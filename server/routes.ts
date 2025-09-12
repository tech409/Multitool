import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertExchangeRateSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Exchange rates API
  app.get("/api/exchange-rates", async (req, res) => {
    try {
      const rates = await storage.getAllExchangeRates();
      res.json(rates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exchange rates" });
    }
  });

  app.get("/api/exchange-rates/:base/:target", async (req, res) => {
    try {
      const { base, target } = req.params;
      const rate = await storage.getExchangeRate(base.toUpperCase(), target.toUpperCase());
      
      if (!rate) {
        // Try to fetch from external API or return inverse rate
        const inverseRate = await storage.getExchangeRate(target.toUpperCase(), base.toUpperCase());
        if (inverseRate) {
          const calculatedRate = {
            ...inverseRate,
            baseCurrency: base.toUpperCase(),
            targetCurrency: target.toUpperCase(),
            rate: 1 / inverseRate.rate,
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

  app.post("/api/exchange-rates", async (req, res) => {
    try {
      const validatedData = insertExchangeRateSchema.parse(req.body);
      const rate = await storage.updateExchangeRate(validatedData);
      res.json(rate);
    } catch (error) {
      res.status(400).json({ message: "Invalid exchange rate data" });
    }
  });

  // User preferences API (for future use)
  app.get("/api/preferences/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const preferences = await storage.getUserPreferences(userId);
      
      if (!preferences) {
        // Create default preferences
        const defaultPrefs = await storage.updateUserPreferences(userId, {});
        res.json(defaultPrefs);
      } else {
        res.json(preferences);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user preferences" });
    }
  });

  app.put("/api/preferences/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const preferences = await storage.updateUserPreferences(userId, req.body);
      res.json(preferences);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user preferences" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
