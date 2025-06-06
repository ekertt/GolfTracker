import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGolfRoundSchema, updateGolfHoleSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get user stats
  app.get("/api/users/:id/stats", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user stats" });
    }
  });

  // Get active round
  app.get("/api/users/:id/active-round", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const activeRound = await storage.getActiveRound(userId);
      res.json(activeRound);
    } catch (error) {
      res.status(500).json({ message: "Failed to get active round" });
    }
  });

  // Get user rounds
  app.get("/api/users/:id/rounds", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const rounds = await storage.getUserGolfRounds(userId);
      res.json(rounds);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user rounds" });
    }
  });

  // Create new golf round
  app.post("/api/rounds", async (req, res) => {
    try {
      const roundData = insertGolfRoundSchema.parse(req.body);
      const round = await storage.createGolfRound(roundData);
      const roundWithHoles = await storage.getGolfRound(round.id);
      res.json(roundWithHoles);
    } catch (error) {
      res.status(400).json({ message: "Invalid round data" });
    }
  });

  // Get specific round
  app.get("/api/rounds/:id", async (req, res) => {
    try {
      const roundId = parseInt(req.params.id);
      const round = await storage.getGolfRound(roundId);
      if (!round) {
        return res.status(404).json({ message: "Round not found" });
      }
      res.json(round);
    } catch (error) {
      res.status(500).json({ message: "Failed to get round" });
    }
  });

  // Update hole data
  app.patch("/api/rounds/:roundId/holes/:holeNumber", async (req, res) => {
    try {
      const roundId = parseInt(req.params.roundId);
      const holeNumber = parseInt(req.params.holeNumber);
      const updates = updateGolfHoleSchema.parse(req.body);
      
      const hole = await storage.updateGolfHole(roundId, holeNumber, updates);
      if (!hole) {
        return res.status(404).json({ message: "Hole not found" });
      }
      res.json(hole);
    } catch (error) {
      res.status(400).json({ message: "Invalid hole data" });
    }
  });

  // Delete round
  app.delete("/api/rounds/:id", async (req, res) => {
    try {
      const roundId = parseInt(req.params.id);
      const deleted = await storage.deleteGolfRound(roundId);
      if (!deleted) {
        return res.status(404).json({ message: "Round not found" });
      }
      res.json({ message: "Round deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete round" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
