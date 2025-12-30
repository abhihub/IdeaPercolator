import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { insertIdeaSchema, ideas, users } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { setupAuth, ensureAuthenticated } from "./auth";
import { eq, and } from "drizzle-orm";
import { TwitterApi } from "twitter-api-v2";

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
        console.log("User authenticated, filtering ideas for user ID:", req.user.id);
        const ideas = await storage.getAllIdeas(req.user.id);
        console.log("Found ideas:", ideas.length);
        return res.json(ideas);
      }
      
      console.log("User not authenticated, returning all ideas");
      // For public viewing, return all ideas (could be limited or filtered in a real app)
      const ideas = await storage.getAllIdeas();
      res.json(ideas);
    } catch (error) {
      console.error("Error fetching ideas:", error);
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

      // Save current version before updating
      await storage.createIdeaVersion(id, idea);

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

  // Get idea version history
  apiRouter.get("/ideas/:id/versions", async (req, res) => {
    try {
      // Require authentication to view version history
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to view version history" });
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid idea ID" });
      }

      const idea = await storage.getIdea(id);
      if (!idea) {
        return res.status(404).json({ message: "Idea not found" });
      }

      // Only allow users to view their own idea history
      if (idea.userId !== req.user.id) {
        return res.status(403).json({ message: "You can only view your own idea history" });
      }

      const versions = await storage.getIdeaVersions(id);
      res.json(versions);
    } catch (error) {
      console.error("Error fetching idea versions:", error);
      res.status(500).json({ message: "Failed to fetch version history" });
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

      // Save current version before updating rank
      await storage.createIdeaVersion(id, idea);

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

  // Publish an idea
  apiRouter.patch("/ideas/:id/publish", async (req, res) => {
    try {
      // Require authentication to publish ideas
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to publish ideas" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid idea ID" });
      }

      const idea = await storage.getIdea(id);
      if (!idea) {
        return res.status(404).json({ message: "Idea not found" });
      }
      
      // Only allow users to publish their own ideas
      if (idea.userId !== req.user.id) {
        return res.status(403).json({ message: "You can only publish your own ideas" });
      }

      // Update the idea to be published
      const [updatedIdea] = await db
        .update(ideas)
        .set({ 
          published: true,
          dateModified: new Date() 
        })
        .where(eq(ideas.id, id))
        .returning();

      res.json(updatedIdea);
    } catch (error) {
      console.error("Error publishing idea:", error);
      res.status(500).json({ message: "Failed to publish idea" });
    }
  });

  // Publish an idea to Twitter
  apiRouter.post("/ideas/:id/twitter", async (req, res) => {
    try {
      // Require authentication to publish to Twitter
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to publish to Twitter" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid idea ID" });
      }

      const idea = await storage.getIdea(id);
      if (!idea) {
        return res.status(404).json({ message: "Idea not found" });
      }
      
      // Only allow users to publish their own ideas
      if (idea.userId !== req.user.id) {
        return res.status(403).json({ message: "You can only publish your own ideas" });
      }

      // For now, return a success message (Twitter integration will be added later)
      res.json({ 
        message: "Twitter publishing feature is coming soon! Your idea would be shared as a tweet.",
        idea: {
          title: idea.title,
          description: idea.description,
          rank: idea.rank
        }
      });
    } catch (error) {
      console.error("Error publishing idea to Twitter:", error);
      res.status(500).json({ message: "Failed to publish to Twitter" });
    }
  });

  // Get public ideas for a specific user
  app.get("/api/public/:username", async (req, res) => {
    try {
      const { username } = req.params;
      
      // First, get the user by username
      const [user] = await db.select().from(users).where(eq(users.username, username));
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get only published ideas for the user
      const publishedIdeas = await db
        .select()
        .from(ideas)
        .where(and(
          eq(ideas.userId, user.id),
          eq(ideas.published, true)
        ));
      
      res.json(publishedIdeas);
    } catch (error) {
      console.error("Error fetching public ideas:", error);
      res.status(500).json({ message: "Failed to fetch public ideas" });
    }
  });
  
  // Get all published ideas from all users
  app.get("/api/public", async (req, res) => {
    try {
      // Get all published ideas with username data
      const publishedIdeas = await db
        .select({
          id: ideas.id,
          title: ideas.title,
          description: ideas.description,
          rank: ideas.rank,
          dateCreated: ideas.dateCreated,
          dateModified: ideas.dateModified,
          userId: ideas.userId,
          published: ideas.published,
          username: users.username
        })
        .from(ideas)
        .innerJoin(users, eq(ideas.userId, users.id))
        .where(eq(ideas.published, true))
        .orderBy(ideas.dateModified);
      
      res.json(publishedIdeas);
    } catch (error) {
      console.error("Error fetching all public ideas:", error);
      res.status(500).json({ message: "Failed to fetch all public ideas" });
    }
  });

  // Publish idea to Twitter/X
  apiRouter.post("/ideas/:id/twitter", async (req, res) => {
    try {
      // Require authentication to publish to Twitter
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to publish to Twitter" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid idea ID" });
      }

      const idea = await storage.getIdea(id);
      if (!idea) {
        return res.status(404).json({ message: "Idea not found" });
      }
      
      // Only allow users to publish their own ideas
      if (idea.userId !== req.user.id) {
        return res.status(403).json({ message: "You can only publish your own ideas" });
      }

      // Check if Twitter credentials are provided
      if (!process.env.TWITTER_API_KEY || !process.env.TWITTER_API_SECRET) {
        return res.status(500).json({ message: "Twitter API credentials not configured" });
      }

      try {
        // Initialize Twitter client with user credentials
        const twitterClient = new TwitterApi({
          appKey: process.env.TWITTER_API_KEY,
          appSecret: process.env.TWITTER_API_SECRET,
          accessToken: process.env.TWITTER_ACCESS_TOKEN,
          accessSecret: process.env.TWITTER_ACCESS_SECRET,
        });

        // Format the tweet text
        const tweetText = `💡 New idea: ${idea.title}

${idea.description.substring(0, 200)}${idea.description.length > 200 ? '...' : ''}

Maturity: ${idea.rank}/10
#ThoughtPercolator #Ideas #Innovation`;

        // Post the tweet
        const tweet = await twitterClient.v2.tweet(tweetText);
        
        res.json({ 
          success: true, 
          tweetId: tweet.data.id,
          message: "Successfully posted to Twitter!" 
        });
      } catch (twitterError: any) {
        console.error("Twitter API error:", twitterError);
        res.status(500).json({ 
          message: "Failed to post to Twitter", 
          error: twitterError.message 
        });
      }
    } catch (error) {
      console.error("Error publishing to Twitter:", error);
      res.status(500).json({ message: "Failed to publish to Twitter" });
    }
  });

  // Register API routes
  app.use("/api", apiRouter);

  // Handle client-side routes for proper deployment support
  // This ensures routes like /public work when accessed directly
  app.get('/public', (req, res, next) => {
    // This route will be handled by the frontend router
    next();
  });
  
  app.get('/public/*', (req, res, next) => {
    // This route will be handled by the frontend router
    next();
  });

  const httpServer = createServer(app);
  return httpServer;
}
