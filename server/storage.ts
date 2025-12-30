import { ideas, type Idea, type InsertIdea, users, type User, type InsertUser, ideaVersions, type IdeaVersion } from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Ideas CRUD operations
  getAllIdeas(): Promise<Idea[]>;
  getIdea(id: number): Promise<Idea | undefined>;
  createIdea(idea: InsertIdea): Promise<Idea>;
  updateIdea(id: number, idea: Partial<InsertIdea>): Promise<Idea | undefined>;
  deleteIdea(id: number): Promise<boolean>;
  updateIdeaRank(id: number, rank: number): Promise<Idea | undefined>;
  
  // Version history operations
  createIdeaVersion(ideaId: number, idea: Idea): Promise<IdeaVersion>;
  getIdeaVersions(ideaId: number): Promise<IdeaVersion[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllIdeas(userId?: number): Promise<Idea[]> {
    if (userId !== undefined) {
      console.log("Filtering ideas for userId:", userId);
      const userIdeas = await db.select().from(ideas).where(eq(ideas.userId, userId));
      console.log("User ideas:", userIdeas);
      return userIdeas;
    }
    console.log("Getting all ideas (no userId filter)");
    const allIdeas = await db.select().from(ideas);
    console.log("All ideas:", allIdeas);
    return allIdeas;
  }

  async getIdea(id: number): Promise<Idea | undefined> {
    const [idea] = await db.select().from(ideas).where(eq(ideas.id, id));
    return idea;
  }

  async createIdea(insertIdea: InsertIdea, userId?: number): Promise<Idea> {
    const now = new Date();
    const [idea] = await db
      .insert(ideas)
      .values({
        ...insertIdea,
        dateCreated: now,
        dateModified: now,
        userId: userId || null
      })
      .returning();
    return idea;
  }

  async updateIdea(id: number, ideaData: Partial<InsertIdea>): Promise<Idea | undefined> {
    const [updatedIdea] = await db
      .update(ideas)
      .set({
        ...ideaData,
        dateModified: new Date(),
      })
      .where(eq(ideas.id, id))
      .returning();
    return updatedIdea;
  }

  async deleteIdea(id: number): Promise<boolean> {
    const deleted = await db
      .delete(ideas)
      .where(eq(ideas.id, id))
      .returning({ id: ideas.id });
    return deleted.length > 0;
  }

  async updateIdeaRank(id: number, rank: number): Promise<Idea | undefined> {
    // Ensure rank is between 1-10
    const newRank = Math.min(Math.max(rank, 1), 10);
    
    const [updatedIdea] = await db
      .update(ideas)
      .set({
        rank: newRank,
        dateModified: new Date(),
      })
      .where(eq(ideas.id, id))
      .returning();
    return updatedIdea;
  }

  async createIdeaVersion(ideaId: number, idea: Idea): Promise<IdeaVersion> {
    // Get the next version number
    const versions = await db
      .select({ versionNumber: ideaVersions.versionNumber })
      .from(ideaVersions)
      .where(eq(ideaVersions.ideaId, ideaId))
      .orderBy(desc(ideaVersions.versionNumber))
      .limit(1);
    
    const nextVersionNumber = versions.length > 0 ? versions[0].versionNumber + 1 : 1;
    
    const [version] = await db
      .insert(ideaVersions)
      .values({
        ideaId,
        versionNumber: nextVersionNumber,
        title: idea.title,
        description: idea.description,
        rank: idea.rank,
      })
      .returning();
    
    return version;
  }

  async getIdeaVersions(ideaId: number): Promise<IdeaVersion[]> {
    return db
      .select()
      .from(ideaVersions)
      .where(eq(ideaVersions.ideaId, ideaId))
      .orderBy(desc(ideaVersions.versionNumber));
  }
}

export const storage = new DatabaseStorage();
