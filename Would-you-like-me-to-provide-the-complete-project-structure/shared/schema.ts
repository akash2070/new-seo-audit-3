import { pgTable, text, serial, integer, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define the audit request schema
export const auditRequestSchema = z.object({
  url: z.string().url("Please enter a valid URL").min(1, "URL is required"),
});

export type AuditRequest = z.infer<typeof auditRequestSchema>;

// Define the audit response schema
export const auditResponseSchema = z.object({
  url: z.string(),
  timestamp: z.string(),
  overallScore: z.number(),
  performance: z.number(),
  accessibility: z.number(),
  bestPractices: z.number(),
  seo: z.number(),
  fcp: z.string(),
  lcp: z.string(),
  fcpNumeric: z.number(),
  lcpNumeric: z.number(),
  recommendations: z.array(z.object({
    title: z.string(),
    description: z.string(),
    impact: z.string(),
    type: z.string(),
  })),
  // Enhanced features
  mobileScore: z.object({
    performance: z.number(),
    accessibility: z.number(),
    bestPractices: z.number(),
    seo: z.number(),
  }),
  desktopScore: z.object({
    performance: z.number(),
    accessibility: z.number(),
    bestPractices: z.number(),
    seo: z.number(),
  }),
  technicalIssues: z.array(z.object({
    category: z.string(),
    issue: z.string(),
    severity: z.string(),
    description: z.string(),
  })),
  metaTags: z.object({
    title: z.string().nullable(),
    description: z.string().nullable(),
    keywords: z.string().nullable(),
    canonical: z.string().nullable(),
    ogTitle: z.string().nullable(),
    ogDescription: z.string().nullable(),
    ogImage: z.string().nullable(),
    ogUrl: z.string().nullable(),
    twitterCard: z.string().nullable(),
    twitterSite: z.string().nullable(),
    twitterCreator: z.string().nullable(),
    viewport: z.string().nullable(),
    robots: z.string().nullable(),
    language: z.string().nullable(),
    charset: z.string().nullable(),
    // Analysis scores
    titleLength: z.number(),
    descriptionLength: z.number(),
    titleOptimal: z.boolean(),
    descriptionOptimal: z.boolean(),
    hasAllRequiredTags: z.boolean(),
  }),
  headingStructure: z.object({
    h1Count: z.number(),
    h2Count: z.number(),
    h3Count: z.number(),
    h4Count: z.number(),
    h5Count: z.number(),
    h6Count: z.number(),
    h1Text: z.array(z.string()),
    hasH1: z.boolean(),
    multipleH1: z.boolean(),
    properHierarchy: z.boolean(),
    missingLevels: z.array(z.string()),
    recommendations: z.array(z.string()),
  }),
  technicalHeaders: z.object({
    contentSecurityPolicy: z.string().nullable(),
    xFrameOptions: z.string().nullable(),
    strictTransportSecurity: z.string().nullable(),
    cacheControl: z.string().nullable(),
    etag: z.string().nullable(),
    expires: z.string().nullable(),
    serverInfo: z.string().nullable(),
    contentEncoding: z.string().nullable(),
    isCompressed: z.boolean(),
    httpOnlySet: z.boolean(),
    secureSet: z.boolean(),
    sameSiteSet: z.boolean(),
  }),
  imageOptimization: z.object({
    totalImages: z.number(),
    imagesWithoutAlt: z.number(),
    largeSizeImages: z.number(),
    suboptimalFormats: z.number(),
    recommendations: z.array(z.string()),
  }),
  contentAnalysis: z.object({
    wordCount: z.number(),
    isThinContent: z.boolean(),
    hasLangAttribute: z.boolean(),
    externalLinksCount: z.number(),
    externalLinksWithNofollow: z.number(),
    recommendations: z.array(z.string()),
  }),
  webAppFeatures: z.object({
    hasFavicon: z.boolean(),
    hasManifest: z.boolean(),
    hasHreflang: z.boolean(),
    httpsRedirect: z.boolean(),
    recommendations: z.array(z.string()),
  }),
  httpsSecurity: z.object({
    isSecure: z.boolean(),
    hasHSTS: z.boolean(),
    mixedContent: z.boolean(),
  }),
  structuredData: z.object({
    hasSchema: z.boolean(),
    types: z.array(z.string()),
    errors: z.array(z.string()),
  }),
  robotsAndSitemap: z.object({
    robotsExists: z.boolean(),
    sitemapExists: z.boolean(),
    robotsContent: z.string().nullable(),
  }),
  brokenLinks: z.object({
    brokenLinks: z.array(z.string()),
    totalChecked: z.number(),
  }),
});

export type AuditResponse = z.infer<typeof auditResponseSchema>;

// User schema (keeping existing for compatibility)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Websites table for multi-website management
export const websites = pgTable("websites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  url: text("url").notNull(),
  name: text("name").notNull(),
  category: text("category"),
  isActive: integer("is_active").default(1),
  createdAt: text("created_at").default(new Date().toISOString()),
  lastAuditAt: text("last_audit_at"),
});

// Audit history table for tracking trends
export const auditHistory = pgTable("audit_history", {
  id: serial("id").primaryKey(),
  websiteId: integer("website_id").references(() => websites.id),
  auditData: jsonb("audit_data").notNull(),
  overallScore: real("overall_score").notNull(),
  performanceScore: real("performance_score").notNull(),
  accessibilityScore: real("accessibility_score").notNull(),
  bestPracticesScore: real("best_practices_score").notNull(),
  seoScore: real("seo_score").notNull(),
  auditDate: text("audit_date").notNull(),
  deviceType: text("device_type").notNull(),
});

// Website favorites for quick access
export const websiteFavorites = pgTable("website_favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  websiteId: integer("website_id").references(() => websites.id),
  createdAt: text("created_at").default(new Date().toISOString()),
});

// Keyword analysis results
export const keywordAnalysis = pgTable("keyword_analysis", {
  id: serial("id").primaryKey(),
  websiteId: integer("website_id").references(() => websites.id),
  keyword: text("keyword").notNull(),
  density: real("density").notNull(),
  count: integer("count").notNull(),
  isTargeted: integer("is_targeted").default(0),
  auditDate: text("audit_date").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertWebsiteSchema = createInsertSchema(websites).pick({
  url: true,
  name: true,
  category: true,
});

export const insertAuditHistorySchema = createInsertSchema(auditHistory).pick({
  websiteId: true,
  auditData: true,
  overallScore: true,
  performanceScore: true,
  accessibilityScore: true,
  bestPracticesScore: true,
  seoScore: true,
  auditDate: true,
  deviceType: true,
});

// Enhanced audit response with new features
export const enhancedAuditResponseSchema = auditResponseSchema.extend({
  keywordAnalysis: z.object({
    topKeywords: z.array(z.object({
      keyword: z.string(),
      density: z.number(),
      count: z.number(),
      isOptimal: z.boolean(),
    })),
    keywordDensityScore: z.number(),
    recommendedKeywords: z.array(z.string()),
  }),
  contentQuality: z.object({
    readabilityScore: z.number(),
    readingLevel: z.string(),
    averageSentenceLength: z.number(),
    contentFreshness: z.number(),
    socialSharingOptimization: z.number(),
  }),
  linkAnalysis: z.object({
    internalLinks: z.number(),
    externalLinks: z.number(),
    followLinks: z.number(),
    nofollowLinks: z.number(),
    brokenInternalLinks: z.array(z.string()),
    anchorTextAnalysis: z.array(z.object({
      text: z.string(),
      count: z.number(),
      type: z.string(),
    })),
  }),
  performanceMetrics: z.object({
    mobileFirstIndexing: z.boolean(),
    totalPageSize: z.number(),
    totalRequests: z.number(),
    optimizationScore: z.number(),
    coreWebVitalsScore: z.number(),
  }),
  competitorInsights: z.object({
    industryBenchmark: z.number(),
    competitorUrls: z.array(z.string()),
    strengthsVsCompetitors: z.array(z.string()),
    improvementOpportunities: z.array(z.string()),
  }),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Website = typeof websites.$inferSelect;
export type InsertWebsite = z.infer<typeof insertWebsiteSchema>;
export type AuditHistoryRecord = typeof auditHistory.$inferSelect;
export type InsertAuditHistory = z.infer<typeof insertAuditHistorySchema>;
export type EnhancedAuditResponse = z.infer<typeof enhancedAuditResponseSchema>;
