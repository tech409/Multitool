// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
var MemStorage = class {
  users;
  userPreferences;
  exchangeRates;
  currentUserId;
  currentPrefsId;
  currentRateId;
  isRefreshingRates = false;
  refreshTimer = null;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.userPreferences = /* @__PURE__ */ new Map();
    this.exchangeRates = /* @__PURE__ */ new Map();
    this.currentUserId = 1;
    this.currentPrefsId = 1;
    this.currentRateId = 1;
    this.initializeDefaultRates().catch((error) => {
      console.error("Failed to initialize exchange rates:", error);
    });
  }
  async initializeDefaultRates() {
    try {
      await this.fetchLiveRatesWithRetry();
      console.log("\u2705 Successfully loaded live exchange rates");
    } catch (error) {
      console.warn("\u26A0\uFE0F Failed to fetch live rates, using fallback data:", error);
      this.initializeFallbackRates();
    }
    this.startAutoRefresh();
  }
  async fetchWithTimeout(url, timeoutMs = 1e4) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Exchange-Rate-Service/1.0"
        }
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
  async fetchLiveRatesWithRetry(maxRetries = 3) {
    let lastError = null;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.fetchLiveRates();
        return;
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries) {
          const backoffMs = Math.pow(2, attempt - 1) * 1e3;
          console.warn(`\u26A0\uFE0F Attempt ${attempt} failed, retrying in ${backoffMs}ms:`, error);
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
        }
      }
    }
    throw new Error(`Failed to fetch exchange rates after ${maxRetries} attempts. Last error: ${lastError?.message}`);
  }
  async fetchLiveRates() {
    const response = await this.fetchWithTimeout("https://api.exchangerate-api.com/v4/latest/USD", 1e4);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    if (!data.rates || typeof data.rates !== "object") {
      throw new Error("Invalid API response format: missing or invalid rates object");
    }
    const supportedCurrencies = ["EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY"];
    const newRatesMap = /* @__PURE__ */ new Map();
    const usdToUsd = {
      id: this.currentRateId++,
      baseCurrency: "USD",
      targetCurrency: "USD",
      rate: 1,
      lastUpdated: /* @__PURE__ */ new Date()
    };
    newRatesMap.set("USD-USD", usdToUsd);
    supportedCurrencies.forEach((targetCurrency) => {
      const rate = data.rates[targetCurrency];
      if (rate && typeof rate === "number" && rate > 0) {
        const exchangeRate = {
          id: this.currentRateId++,
          baseCurrency: "USD",
          targetCurrency,
          rate,
          lastUpdated: /* @__PURE__ */ new Date()
        };
        newRatesMap.set(`USD-${targetCurrency}`, exchangeRate);
        const inverseRate = {
          id: this.currentRateId++,
          baseCurrency: targetCurrency,
          targetCurrency: "USD",
          rate: 1 / rate,
          lastUpdated: /* @__PURE__ */ new Date()
        };
        newRatesMap.set(`${targetCurrency}-USD`, inverseRate);
      }
    });
    supportedCurrencies.forEach((currency) => {
      const selfRate = {
        id: this.currentRateId++,
        baseCurrency: currency,
        targetCurrency: currency,
        rate: 1,
        lastUpdated: /* @__PURE__ */ new Date()
      };
      newRatesMap.set(`${currency}-${currency}`, selfRate);
    });
    this.generateCrossRatesForMap(newRatesMap, supportedCurrencies);
    this.exchangeRates = newRatesMap;
  }
  generateCrossRates(currencies) {
    this.generateCrossRatesForMap(this.exchangeRates, currencies);
  }
  generateCrossRatesForMap(ratesMap, currencies) {
    currencies.forEach((baseCurrency) => {
      currencies.forEach((targetCurrency) => {
        if (baseCurrency !== targetCurrency) {
          const key = `${baseCurrency}-${targetCurrency}`;
          if (!ratesMap.has(key)) {
            const baseToUsd = ratesMap.get(`${baseCurrency}-USD`);
            const usdToTarget = ratesMap.get(`USD-${targetCurrency}`);
            if (baseToUsd && usdToTarget) {
              const crossRate = baseToUsd.rate * usdToTarget.rate;
              const exchangeRate = {
                id: this.currentRateId++,
                baseCurrency,
                targetCurrency,
                rate: crossRate,
                lastUpdated: /* @__PURE__ */ new Date()
              };
              ratesMap.set(key, exchangeRate);
            }
          }
        }
      });
    });
  }
  initializeFallbackRates() {
    const fallbackRates = [
      { baseCurrency: "USD", targetCurrency: "EUR", rate: 0.92 },
      { baseCurrency: "USD", targetCurrency: "GBP", rate: 0.79 },
      { baseCurrency: "USD", targetCurrency: "JPY", rate: 149.5 },
      { baseCurrency: "USD", targetCurrency: "CAD", rate: 1.35 },
      { baseCurrency: "USD", targetCurrency: "AUD", rate: 1.54 },
      { baseCurrency: "USD", targetCurrency: "CHF", rate: 0.88 },
      { baseCurrency: "USD", targetCurrency: "CNY", rate: 7.25 },
      { baseCurrency: "EUR", targetCurrency: "USD", rate: 1.09 },
      { baseCurrency: "GBP", targetCurrency: "USD", rate: 1.27 },
      { baseCurrency: "JPY", targetCurrency: "USD", rate: 67e-4 },
      { baseCurrency: "CAD", targetCurrency: "USD", rate: 0.74 },
      { baseCurrency: "AUD", targetCurrency: "USD", rate: 0.65 },
      { baseCurrency: "CHF", targetCurrency: "USD", rate: 1.14 },
      { baseCurrency: "CNY", targetCurrency: "USD", rate: 0.14 }
    ];
    fallbackRates.forEach((rate) => {
      const exchangeRate = {
        id: this.currentRateId++,
        ...rate,
        lastUpdated: /* @__PURE__ */ new Date()
      };
      this.exchangeRates.set(`${rate.baseCurrency}-${rate.targetCurrency}`, exchangeRate);
    });
    const currencies = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY"];
    currencies.forEach((currency) => {
      const selfRate = {
        id: this.currentRateId++,
        baseCurrency: currency,
        targetCurrency: currency,
        rate: 1,
        lastUpdated: /* @__PURE__ */ new Date()
      };
      this.exchangeRates.set(`${currency}-${currency}`, selfRate);
    });
  }
  startAutoRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
    this.refreshTimer = setInterval(async () => {
      await this.refreshExchangeRates();
    }, 30 * 60 * 1e3);
  }
  async refreshExchangeRates() {
    if (this.isRefreshingRates) {
      console.log("\u23F3 Exchange rate refresh already in progress, skipping...");
      return;
    }
    this.isRefreshingRates = true;
    try {
      console.log("\u{1F504} Refreshing exchange rates...");
      await this.fetchLiveRatesWithRetry();
      console.log("\u2705 Exchange rates refreshed successfully");
    } catch (error) {
      console.warn("\u26A0\uFE0F Failed to refresh exchange rates:", error);
    } finally {
      this.isRefreshingRates = false;
    }
  }
  // Public method to manually trigger a refresh (useful for testing or admin functions)
  async forceRefreshRates() {
    try {
      await this.refreshExchangeRates();
      return true;
    } catch (error) {
      console.error("Failed to force refresh exchange rates:", error);
      return false;
    }
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = this.currentUserId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  async getUserPreferences(userId) {
    return Array.from(this.userPreferences.values()).find(
      (prefs) => prefs.userId === userId
    );
  }
  async updateUserPreferences(userId, preferences) {
    const existing = await this.getUserPreferences(userId);
    if (existing) {
      const updated = {
        ...existing,
        ...preferences,
        updatedAt: /* @__PURE__ */ new Date()
      };
      this.userPreferences.set(existing.id, updated);
      return updated;
    } else {
      const newPrefs = {
        id: this.currentPrefsId++,
        userId,
        theme: "light",
        lastUsedTool: "calculator",
        calculatorHistory: [],
        levelCalibration: { x: 0, y: 0 },
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date(),
        ...preferences
      };
      this.userPreferences.set(newPrefs.id, newPrefs);
      return newPrefs;
    }
  }
  async getExchangeRate(baseCurrency, targetCurrency) {
    return this.exchangeRates.get(`${baseCurrency}-${targetCurrency}`);
  }
  async updateExchangeRate(rate) {
    const key = `${rate.baseCurrency}-${rate.targetCurrency}`;
    const existing = this.exchangeRates.get(key);
    if (existing) {
      const updated = {
        ...existing,
        rate: rate.rate,
        lastUpdated: /* @__PURE__ */ new Date()
      };
      this.exchangeRates.set(key, updated);
      return updated;
    } else {
      const newRate = {
        id: this.currentRateId++,
        ...rate,
        lastUpdated: /* @__PURE__ */ new Date()
      };
      this.exchangeRates.set(key, newRate);
      return newRate;
    }
  }
  async getAllExchangeRates() {
    return Array.from(this.exchangeRates.values());
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { pgTable, text, serial, real, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id),
  theme: text("theme").notNull().default("light"),
  lastUsedTool: text("last_used_tool").default("calculator"),
  calculatorHistory: json("calculator_history").$type().default([]),
  levelCalibration: json("level_calibration").$type().default({ x: 0, y: 0 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var exchangeRates = pgTable("exchange_rates", {
  id: serial("id").primaryKey(),
  baseCurrency: text("base_currency").notNull(),
  targetCurrency: text("target_currency").notNull(),
  rate: real("rate").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertExchangeRateSchema = createInsertSchema(exchangeRates).omit({
  id: true,
  lastUpdated: true
});

// server/routes.ts
async function registerRoutes(app2) {
  app2.get("/api/exchange-rates", async (req, res) => {
    try {
      const rates = await storage.getAllExchangeRates();
      res.json(rates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exchange rates" });
    }
  });
  app2.get("/api/exchange-rates/:base/:target", async (req, res) => {
    try {
      const { base, target } = req.params;
      const rate = await storage.getExchangeRate(base.toUpperCase(), target.toUpperCase());
      if (!rate) {
        const inverseRate = await storage.getExchangeRate(target.toUpperCase(), base.toUpperCase());
        if (inverseRate) {
          const calculatedRate = {
            ...inverseRate,
            baseCurrency: base.toUpperCase(),
            targetCurrency: target.toUpperCase(),
            rate: 1 / inverseRate.rate
          };
          res.json(calculatedRate);
        } else {
          res.status(404).json({ message: "Exchange rate not found" });
        }
      } else {
        res.json(rate);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exchange rate" });
    }
  });
  app2.post("/api/exchange-rates", async (req, res) => {
    try {
      const validatedData = insertExchangeRateSchema.parse(req.body);
      const rate = await storage.updateExchangeRate(validatedData);
      res.json(rate);
    } catch (error) {
      res.status(400).json({ message: "Invalid exchange rate data" });
    }
  });
  app2.get("/api/preferences/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const preferences = await storage.getUserPreferences(userId);
      if (!preferences) {
        const defaultPrefs = await storage.updateUserPreferences(userId, {});
        res.json(defaultPrefs);
      } else {
        res.json(preferences);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user preferences" });
    }
  });
  app2.put("/api/preferences/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const preferences = await storage.updateUserPreferences(userId, req.body);
      res.json(preferences);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user preferences" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: "0.0.0.0",
    port: 5e3,
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
