import { 
  users, 
  type User, 
  type InsertUser, 
  type Website, 
  type InsertWebsite, 
  type AuditHistoryRecord, 
  type InsertAuditHistory 
} from "@shared/schema";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Website management
  createWebsite(website: InsertWebsite & { userId: number }): Promise<Website>;
  getWebsite(id: number): Promise<Website | undefined>;
  getUserWebsites(userId: number): Promise<Website[]>;
  updateWebsite(id: number, updates: Partial<Website>): Promise<Website | undefined>;
  deleteWebsite(id: number): Promise<boolean>;
  
  // Audit history
  saveAuditHistory(auditHistory: InsertAuditHistory): Promise<AuditHistoryRecord>;
  getWebsiteAuditHistory(websiteId: number, limit?: number): Promise<AuditHistoryRecord[]>;
  getAuditTrends(websiteId: number, days: number): Promise<AuditHistoryRecord[]>;
  
  // Favorites
  addToFavorites(userId: number, websiteId: number): Promise<void>;
  removeFromFavorites(userId: number, websiteId: number): Promise<void>;
  getUserFavorites(userId: number): Promise<Website[]>;
  
  // Analytics
  getWebsiteAnalytics(websiteId: number): Promise<{
    totalAudits: number;
    averageScore: number;
    scoreImprovement: number;
    lastAuditDate: string | null;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private websites: Map<number, Website>;
  private auditHistory: Map<number, AuditHistoryRecord>;
  private favorites: Map<string, boolean>;
  private currentUserId: number;
  private currentWebsiteId: number;
  private currentAuditId: number;

  constructor() {
    this.users = new Map();
    this.websites = new Map();
    this.auditHistory = new Map();
    this.favorites = new Map();
    this.currentUserId = 1;
    this.currentWebsiteId = 1;
    this.currentAuditId = 1;
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

  async createWebsite(websiteData: InsertWebsite & { userId: number }): Promise<Website> {
    const id = this.currentWebsiteId++;
    const website: Website = {
      id,
      userId: websiteData.userId,
      url: websiteData.url,
      name: websiteData.name,
      category: websiteData.category || null,
      isActive: 1,
      createdAt: new Date().toISOString(),
      lastAuditAt: null,
    };
    this.websites.set(id, website);
    return website;
  }

  async getWebsite(id: number): Promise<Website | undefined> {
    return this.websites.get(id);
  }

  async getUserWebsites(userId: number): Promise<Website[]> {
    return Array.from(this.websites.values()).filter(w => w.userId === userId);
  }

  async updateWebsite(id: number, updates: Partial<Website>): Promise<Website | undefined> {
    const website = this.websites.get(id);
    if (!website) return undefined;
    
    const updatedWebsite = { ...website, ...updates };
    this.websites.set(id, updatedWebsite);
    return updatedWebsite;
  }

  async deleteWebsite(id: number): Promise<boolean> {
    return this.websites.delete(id);
  }

  async saveAuditHistory(auditData: InsertAuditHistory): Promise<AuditHistoryRecord> {
    const id = this.currentAuditId++;
    const auditRecord: AuditHistoryRecord = {
      id,
      ...auditData,
    };
    this.auditHistory.set(id, auditRecord);
    
    const website = this.websites.get(auditData.websiteId);
    if (website) {
      await this.updateWebsite(auditData.websiteId, {
        lastAuditAt: auditData.auditDate
      });
    }
    
    return auditRecord;
  }

  async getWebsiteAuditHistory(websiteId: number, limit = 50): Promise<AuditHistoryRecord[]> {
    return Array.from(this.auditHistory.values())
      .filter(audit => audit.websiteId === websiteId)
      .sort((a, b) => new Date(b.auditDate).getTime() - new Date(a.auditDate).getTime())
      .slice(0, limit);
  }

  async getAuditTrends(websiteId: number, days = 30): Promise<AuditHistoryRecord[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return Array.from(this.auditHistory.values())
      .filter(audit => 
        audit.websiteId === websiteId && 
        new Date(audit.auditDate) >= cutoffDate
      )
      .sort((a, b) => new Date(a.auditDate).getTime() - new Date(b.auditDate).getTime());
  }

  async addToFavorites(userId: number, websiteId: number): Promise<void> {
    this.favorites.set(`${userId}:${websiteId}`, true);
  }

  async removeFromFavorites(userId: number, websiteId: number): Promise<void> {
    this.favorites.delete(`${userId}:${websiteId}`);
  }

  async getUserFavorites(userId: number): Promise<Website[]> {
    const favoriteWebsiteIds = Array.from(this.favorites.keys())
      .filter(key => key.startsWith(`${userId}:`))
      .map(key => parseInt(key.split(':')[1]));
    
    return Array.from(this.websites.values())
      .filter(website => favoriteWebsiteIds.includes(website.id));
  }

  async getWebsiteAnalytics(websiteId: number): Promise<{
    totalAudits: number;
    averageScore: number;
    scoreImprovement: number;
    lastAuditDate: string | null;
  }> {
    const audits = await this.getWebsiteAuditHistory(websiteId);
    
    if (audits.length === 0) {
      return {
        totalAudits: 0,
        averageScore: 0,
        scoreImprovement: 0,
        lastAuditDate: null,
      };
    }

    const totalScore = audits.reduce((sum, audit) => sum + audit.overallScore, 0);
    const averageScore = totalScore / audits.length;
    
    let scoreImprovement = 0;
    if (audits.length > 1) {
      const latestScore = audits[0].overallScore;
      const earliestScore = audits[audits.length - 1].overallScore;
      scoreImprovement = latestScore - earliestScore;
    }

    return {
      totalAudits: audits.length,
      averageScore: Math.round(averageScore * 100) / 100,
      scoreImprovement: Math.round(scoreImprovement * 100) / 100,
      lastAuditDate: audits[0]?.auditDate || null,
    };
  }
}

export const storage = new MemStorage();
