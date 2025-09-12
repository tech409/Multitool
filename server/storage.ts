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

  constructor() {
    this.users = new Map();
    this.userPreferences = new Map();
    this.exchangeRates = new Map();
    this.currentUserId = 1;
    this.currentPrefsId = 1;
    this.currentRateId = 1;

    // Initialize with some default exchange rates
    this.initializeDefaultRates();
  }

  private initializeDefaultRates() {
    const defaultRates = [
      { baseCurrency: "USD", targetCurrency: "EUR", rate: 0.85 },
      { baseCurrency: "USD", targetCurrency: "GBP", rate: 0.73 },
      { baseCurrency: "USD", targetCurrency: "JPY", rate: 110 },
      { baseCurrency: "USD", targetCurrency: "CAD", rate: 1.25 },
      { baseCurrency: "USD", targetCurrency: "AUD", rate: 1.35 },
      { baseCurrency: "USD", targetCurrency: "CHF", rate: 0.92 },
      { baseCurrency: "USD", targetCurrency: "CNY", rate: 6.45 },
      { baseCurrency: "EUR", targetCurrency: "USD", rate: 1.18 },
      { baseCurrency: "GBP", targetCurrency: "USD", rate: 1.37 },
    ];

    defaultRates.forEach(rate => {
      const exchangeRate: ExchangeRate = {
        id: this.currentRateId++,
        ...rate,
        lastUpdated: new Date(),
      };
      this.exchangeRates.set(`${rate.baseCurrency}-${rate.targetCurrency}`, exchangeRate);
    });
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
