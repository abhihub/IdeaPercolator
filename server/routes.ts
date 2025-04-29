import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertIdeaSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { setupAuth, ensureAuthenticated } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);
  
  // Create API routes
  const apiRouter = express.Router();

  // Get all ideas - either all ideas for public viewing or just the user's ideas if logged in
  apiRouter.get("/ideas", async (req, res) => {
    try {
      // If user is authenticated, return only their ideas
      if (req.isAuthenticated()) {
        const ideas = await storage.getAllIdeas(req.user.id);
        return res.json(ideas);
      }
      
      // For public viewing, return all ideas (could be limited or filtered in a real app)
      const ideas = await storage.getAllIdeas();
      res.json(ideas);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ideas" });
    }
  });

  // Get idea by ID
  apiRouter.get("/ideas/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid idea ID" });
      }

      const idea = await storage.getIdea(id);
      if (!idea) {
        return res.status(404).json({ message: "Idea not found" });
      }

      res.json(idea);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch idea" });
    }
  });

  // Create idea
  apiRouter.post("/ideas", async (req, res) => {
    try {
      // Require authentication to create ideas
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to create ideas" });
      }
      
      const validatedData = insertIdeaSchema.parse(req.body);
      const newIdea = await storage.createIdea(validatedData, req.user.id);
      res.status(201).json(newIdea);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create idea" });
    }
  });

  // Update idea
  apiRouter.put("/ideas/:id", async (req, res) => {
    try {
      // Require authentication to update ideas
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to update ideas" });
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid idea ID" });
      }

      const idea = await storage.getIdea(id);
      if (!idea) {
        return res.status(404).json({ message: "Idea not found" });
      }

      // Only allow users to update their own ideas
      if (idea.userId !== req.user.id) {
        return res.status(403).json({ message: "You can only update your own ideas" });
      }

      const validatedData = insertIdeaSchema.partial().parse(req.body);
      const updatedIdea = await storage.updateIdea(id, validatedData);
      res.json(updatedIdea);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to update idea" });
    }
  });

  // Update idea rank
  apiRouter.patch("/ideas/:id/rank", async (req, res) => {
    try {
      // Require authentication to update idea rank
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to update idea rank" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid idea ID" });
      }

      const { rank } = req.body;
      if (typeof rank !== 'number' || rank < 1 || rank > 10) {
        return res.status(400).json({ message: "Rank must be a number between 1 and 10" });
      }

      const idea = await storage.getIdea(id);
      if (!idea) {
        return res.status(404).json({ message: "Idea not found" });
      }
      
      // Only allow users to update their own ideas
      if (idea.userId !== req.user.id) {
        return res.status(403).json({ message: "You can only update your own ideas" });
      }

      const updatedIdea = await storage.updateIdeaRank(id, rank);
      res.json(updatedIdea);
    } catch (error) {
      res.status(500).json({ message: "Failed to update idea rank" });
    }
  });

  // Delete idea
  apiRouter.delete("/ideas/:id", async (req, res) => {
    try {
      // Require authentication to delete ideas
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to delete ideas" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid idea ID" });
      }

      const idea = await storage.getIdea(id);
      if (!idea) {
        return res.status(404).json({ message: "Idea not found" });
      }
      
      // Only allow users to delete their own ideas
      if (idea.userId !== req.user.id) {
        return res.status(403).json({ message: "You can only delete your own ideas" });
      }

      await storage.deleteIdea(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete idea" });
    }
  });

  // Register API routes
  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}
