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
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.userPreferences = /* @__PURE__ */ new Map();
    this.exchangeRates = /* @__PURE__ */ new Map();
    this.currentUserId = 1;
    this.currentPrefsId = 1;
    this.currentRateId = 1;
    this.initializeDefaultRates();
  }
  initializeDefaultRates() {
    const defaultRates = [
      { baseCurrency: "USD", targetCurrency: "EUR", rate: 0.85 },
      { baseCurrency: "USD", targetCurrency: "GBP", rate: 0.73 },
      { baseCurrency: "USD", targetCurrency: "JPY", rate: 110 },
      { baseCurrency: "USD", targetCurrency: "CAD", rate: 1.25 },
      { baseCurrency: "USD", targetCurrency: "AUD", rate: 1.35 },
      { baseCurrency: "USD", targetCurrency: "CHF", rate: 0.92 },
      { baseCurrency: "USD", targetCurrency: "CNY", rate: 6.45 },
      { baseCurrency: "EUR", targetCurrency: "USD", rate: 1.18 },
      { baseCurrency: "GBP", targetCurrency: "USD", rate: 1.37 }
    ];
    defaultRates.forEach((rate) => {
      const exchangeRate = {
        id: this.currentRateId++,
        ...rate,
        lastUpdated: /* @__PURE__ */ new Date()
      };
      this.exchangeRates.set(`${rate.baseCurrency}-${rate.targetCurrency}`, exchangeRate);
    });
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
