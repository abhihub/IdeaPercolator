import { ideas, type Idea, type InsertIdea, users, type User, type InsertUser } from "@shared/schema";

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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private ideas: Map<number, Idea>;
  private userId: number;
  private ideaId: number;

  constructor() {
    this.users = new Map();
    this.ideas = new Map();
    this.userId = 1;
    this.ideaId = 1;
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
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllIdeas(): Promise<Idea[]> {
    return Array.from(this.ideas.values());
  }

  async getIdea(id: number): Promise<Idea | undefined> {
    return this.ideas.get(id);
  }

  async createIdea(insertIdea: InsertIdea): Promise<Idea> {
    const id = this.ideaId++;
    const now = new Date();
    const idea: Idea = { 
      ...insertIdea, 
      id, 
      dateCreated: now, 
      dateModified: now,
      userId: null 
    };
    this.ideas.set(id, idea);
    return idea;
  }

  async updateIdea(id: number, ideaData: Partial<InsertIdea>): Promise<Idea | undefined> {
    const idea = this.ideas.get(id);
    if (!idea) return undefined;

    const updatedIdea: Idea = {
      ...idea,
      ...ideaData,
      dateModified: new Date()
    };

    this.ideas.set(id, updatedIdea);
    return updatedIdea;
  }

  async deleteIdea(id: number): Promise<boolean> {
    return this.ideas.delete(id);
  }

  async updateIdeaRank(id: number, rank: number): Promise<Idea | undefined> {
    const idea = this.ideas.get(id);
    if (!idea) return undefined;

    // Ensure rank is between 1-10
    const newRank = Math.min(Math.max(rank, 1), 10);
    
    const updatedIdea: Idea = {
      ...idea,
      rank: newRank,
      dateModified: new Date()
    };

    this.ideas.set(id, updatedIdea);
    return updatedIdea;
  }
}

export const storage = new MemStorage();
