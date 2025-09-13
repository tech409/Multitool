import { users, userPreferences, exchangeRates, type User, type InsertUser, type UserPreferences, type InsertUserPreferences, type ExchangeRate, type InsertExchangeRate } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUserPreferences(userId: number): Promise<UserPreferences | undefined>;
  updateUserPreferences(userId: number, preferences: Partial<InsertUserPreferences>): Promise<UserPreferences>;
  getExchangeRate(baseCurrency: string, targetCurrency: string): Promise<ExchangeRate | undefined>;
  updateExchangeRate(rate: InsertExchangeRate): Promise<ExchangeRate>;
  getAllExchangeRates(): Promise<ExchangeRate[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private userPreferences: Map<number, UserPreferences>;
  private exchangeRates: Map<string, ExchangeRate>;
  private currentUserId: number;
  private currentPrefsId: number;
  private currentRateId: number;
  private isRefreshingRates: boolean = false;
  private refreshTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.users = new Map();
    this.userPreferences = new Map();
    this.exchangeRates = new Map();
    this.currentUserId = 1;
    this.currentPrefsId = 1;
    this.currentRateId = 1;

    // Initialize with live exchange rates
    this.initializeDefaultRates().catch(error => {
      console.error('Failed to initialize exchange rates:', error);
    });
  }

  private async initializeDefaultRates() {
    try {
      await this.fetchLiveRatesWithRetry();
      console.log('✅ Successfully loaded live exchange rates');
    } catch (error) {
      console.warn('⚠️ Failed to fetch live rates, using fallback data:', error);
      this.initializeFallbackRates();
    }

    // Start auto-refresh every 30 minutes
    this.startAutoRefresh();
  }

  private async fetchWithTimeout(url: string, timeoutMs: number = 10000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Exchange-Rate-Service/1.0'
        }
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async fetchLiveRatesWithRetry(maxRetries: number = 3): Promise<void> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.fetchLiveRates();
        return; // Success, exit retry loop
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < maxRetries) {
          // Exponential backoff: 1s, 2s, 4s, etc.
          const backoffMs = Math.pow(2, attempt - 1) * 1000;
          console.warn(`⚠️ Attempt ${attempt} failed, retrying in ${backoffMs}ms:`, error);
          await new Promise(resolve => setTimeout(resolve, backoffMs));
        }
      }
    }
    
    // All retries exhausted
    throw new Error(`Failed to fetch exchange rates after ${maxRetries} attempts. Last error: ${lastError?.message}`);
  }

  private async fetchLiveRates(): Promise<void> {
    const response = await this.fetchWithTimeout('https://api.exchangerate-api.com/v4/latest/USD', 10000);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.rates || typeof data.rates !== 'object') {
      throw new Error('Invalid API response format: missing or invalid rates object');
    }

    const supportedCurrencies = ['EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'];
    
    // Build a completely new rates map atomically
    const newRatesMap = new Map<string, ExchangeRate>();
    
    // Add USD as base with rate 1.0 to itself
    const usdToUsd: ExchangeRate = {
      id: this.currentRateId++,
      baseCurrency: 'USD',
      targetCurrency: 'USD',
      rate: 1.0,
      lastUpdated: new Date(),
    };
    newRatesMap.set('USD-USD', usdToUsd);
    
    // Add all USD-based rates
    supportedCurrencies.forEach(targetCurrency => {
      const rate = data.rates[targetCurrency];
      if (rate && typeof rate === 'number' && rate > 0) {
        // USD -> Target
        const exchangeRate: ExchangeRate = {
          id: this.currentRateId++,
          baseCurrency: 'USD',
          targetCurrency,
          rate: rate,
          lastUpdated: new Date(),
        };
        newRatesMap.set(`USD-${targetCurrency}`, exchangeRate);
        
        // Target -> USD (inverse)
        const inverseRate: ExchangeRate = {
          id: this.currentRateId++,
          baseCurrency: targetCurrency,
          targetCurrency: 'USD',
          rate: 1 / rate,
          lastUpdated: new Date(),
        };
        newRatesMap.set(`${targetCurrency}-USD`, inverseRate);
      }
    });
    
    // Add same-currency rates for all currencies
    supportedCurrencies.forEach(currency => {
      const selfRate: ExchangeRate = {
        id: this.currentRateId++,
        baseCurrency: currency,
        targetCurrency: currency,
        rate: 1.0,
        lastUpdated: new Date(),
      };
      newRatesMap.set(`${currency}-${currency}`, selfRate);
    });
    
    // Generate cross-rates (EUR-GBP, GBP-JPY, etc.)
    this.generateCrossRatesForMap(newRatesMap, supportedCurrencies);
    
    // Atomic swap: replace the entire map at once
    this.exchangeRates = newRatesMap;
  }
  
  private generateCrossRates(currencies: string[]) {
    this.generateCrossRatesForMap(this.exchangeRates, currencies);
  }
  
  private generateCrossRatesForMap(ratesMap: Map<string, ExchangeRate>, currencies: string[]) {
    currencies.forEach(baseCurrency => {
      currencies.forEach(targetCurrency => {
        if (baseCurrency !== targetCurrency) {
          const key = `${baseCurrency}-${targetCurrency}`;
          
          // Skip if we already have this rate
          if (!ratesMap.has(key)) {
            const baseToUsd = ratesMap.get(`${baseCurrency}-USD`);
            const usdToTarget = ratesMap.get(`USD-${targetCurrency}`);
            
            if (baseToUsd && usdToTarget) {
              const crossRate = baseToUsd.rate * usdToTarget.rate;
              const exchangeRate: ExchangeRate = {
                id: this.currentRateId++,
                baseCurrency,
                targetCurrency,
                rate: crossRate,
                lastUpdated: new Date(),
              };
              ratesMap.set(key, exchangeRate);
            }
          }
        }
      });
    });
  }
  
  private initializeFallbackRates() {
    const fallbackRates = [
      { baseCurrency: "USD", targetCurrency: "EUR", rate: 0.92 },
      { baseCurrency: "USD", targetCurrency: "GBP", rate: 0.79 },
      { baseCurrency: "USD", targetCurrency: "JPY", rate: 149.50 },
      { baseCurrency: "USD", targetCurrency: "CAD", rate: 1.35 },
      { baseCurrency: "USD", targetCurrency: "AUD", rate: 1.54 },
      { baseCurrency: "USD", targetCurrency: "CHF", rate: 0.88 },
      { baseCurrency: "USD", targetCurrency: "CNY", rate: 7.25 },
      { baseCurrency: "EUR", targetCurrency: "USD", rate: 1.09 },
      { baseCurrency: "GBP", targetCurrency: "USD", rate: 1.27 },
      { baseCurrency: "JPY", targetCurrency: "USD", rate: 0.0067 },
      { baseCurrency: "CAD", targetCurrency: "USD", rate: 0.74 },
      { baseCurrency: "AUD", targetCurrency: "USD", rate: 0.65 },
      { baseCurrency: "CHF", targetCurrency: "USD", rate: 1.14 },
      { baseCurrency: "CNY", targetCurrency: "USD", rate: 0.14 },
    ];

    fallbackRates.forEach(rate => {
      const exchangeRate: ExchangeRate = {
        id: this.currentRateId++,
        ...rate,
        lastUpdated: new Date(),
      };
      this.exchangeRates.set(`${rate.baseCurrency}-${rate.targetCurrency}`, exchangeRate);
    });
    
    // Add same-currency rates
    const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'];
    currencies.forEach(currency => {
      const selfRate: ExchangeRate = {
        id: this.currentRateId++,
        baseCurrency: currency,
        targetCurrency: currency,
        rate: 1.0,
        lastUpdated: new Date(),
      };
      this.exchangeRates.set(`${currency}-${currency}`, selfRate);
    });
  }
  
  private startAutoRefresh() {
    // Clear any existing timer
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
    
    // Refresh rates every 30 minutes
    this.refreshTimer = setInterval(async () => {
      await this.refreshExchangeRates();
    }, 30 * 60 * 1000); // 30 minutes
  }
  
  private async refreshExchangeRates(): Promise<void> {
    // Prevent overlapping refreshes
    if (this.isRefreshingRates) {
      console.log('⏳ Exchange rate refresh already in progress, skipping...');
      return;
    }
    
    this.isRefreshingRates = true;
    
    try {
      console.log('🔄 Refreshing exchange rates...');
      await this.fetchLiveRatesWithRetry();
      console.log('✅ Exchange rates refreshed successfully');
    } catch (error) {
      console.warn('⚠️ Failed to refresh exchange rates:', error);
      // Don't fall back to static rates during auto-refresh - keep existing rates
    } finally {
      this.isRefreshingRates = false;
    }
  }
  
  // Public method to manually trigger a refresh (useful for testing or admin functions)
  public async forceRefreshRates(): Promise<boolean> {
    try {
      await this.refreshExchangeRates();
      return true;
    } catch (error) {
      console.error('Failed to force refresh exchange rates:', error);
      return false;
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getUserPreferences(userId: number): Promise<UserPreferences | undefined> {
    return Array.from(this.userPreferences.values()).find(
      (prefs) => prefs.userId === userId,
    );
  }

  async updateUserPreferences(userId: number, preferences: Partial<InsertUserPreferences>): Promise<UserPreferences> {
    const existing = await this.getUserPreferences(userId);
    
    if (existing) {
      const updated: UserPreferences = {
        ...existing,
        ...preferences,
        updatedAt: new Date(),
      } as UserPreferences;
      this.userPreferences.set(existing.id, updated);
      return updated;
    } else {
      const newPrefs: UserPreferences = {
        id: this.currentPrefsId++,
        userId,
        theme: "light",
        lastUsedTool: "calculator",
        calculatorHistory: [],
        levelCalibration: { x: 0, y: 0 },
        createdAt: new Date(),
        updatedAt: new Date(),
        ...preferences,
      } as UserPreferences;
      this.userPreferences.set(newPrefs.id, newPrefs);
      return newPrefs;
    }
  }

  async getExchangeRate(baseCurrency: string, targetCurrency: string): Promise<ExchangeRate | undefined> {
    return this.exchangeRates.get(`${baseCurrency}-${targetCurrency}`);
  }

  async updateExchangeRate(rate: InsertExchangeRate): Promise<ExchangeRate> {
    const key = `${rate.baseCurrency}-${rate.targetCurrency}`;
    const existing = this.exchangeRates.get(key);
    
    if (existing) {
      const updated: ExchangeRate = {
        ...existing,
        rate: rate.rate,
        lastUpdated: new Date(),
      };
      this.exchangeRates.set(key, updated);
      return updated;
    } else {
      const newRate: ExchangeRate = {
        id: this.currentRateId++,
        ...rate,
        lastUpdated: new Date(),
      };
      this.exchangeRates.set(key, newRate);
      return newRate;
    }
  }

  async getAllExchangeRates(): Promise<ExchangeRate[]> {
    return Array.from(this.exchangeRates.values());
  }
}

export const storage = new MemStorage();
