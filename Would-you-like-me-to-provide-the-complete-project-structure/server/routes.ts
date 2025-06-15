import type { Express } from "express";
import { createServer, type Server } from "http";
import { auditRequestSchema, type AuditResponse } from "@shared/schema";
import { z } from "zod";

// Interface for PageSpeed Insights API response
interface PageSpeedResponse {
  lighthouseResult: {
    categories: {
      performance: { score: number };
      accessibility: { score: number };
      'best-practices': { score: number };
      seo: { score: number };
    };
    audits: {
      'first-contentful-paint': {
        displayValue: string;
        numericValue: number;
      };
      'largest-contentful-paint': {
        displayValue: string;
        numericValue: number;
      };
      'unused-css-rules': {
        title: string;
        description: string;
        score: number | null;
      };
      'unused-javascript': {
        title: string;
        description: string;
        score: number | null;
      };
      'render-blocking-resources': {
        title: string;
        description: string;
        score: number | null;
      };
      'meta-description': {
        title: string;
        description: string;
        score: number | null;
      };
      'document-title': {
        title: string;
        description: string;
        score: number | null;
      };
      'is-on-https': {
        score: number | null;
      };
      'uses-https': {
        score: number | null;
      };
      'structured-data': {
        score: number | null;
        details?: any;
      };
      'canonical': {
        score: number | null;
      };
    };
    finalUrl: string;
  };
}

// Enhanced analysis functions
async function analyzeMetaTags(url: string): Promise<AuditResponse['metaTags']> {
  try {
    const response = await fetch(url);
    const html = await response.text();
    
    // Enhanced regex patterns for better matching
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
    const keywordsMatch = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']*)["']/i);
    const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i);
    const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i);
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i);
    const ogUrlMatch = html.match(/<meta[^>]*property=["']og:url["'][^>]*content=["']([^"']*)["']/i);
    const twitterCardMatch = html.match(/<meta[^>]*name=["']twitter:card["'][^>]*content=["']([^"']*)["']/i);
    const twitterSiteMatch = html.match(/<meta[^>]*name=["']twitter:site["'][^>]*content=["']([^"']*)["']/i);
    const twitterCreatorMatch = html.match(/<meta[^>]*name=["']twitter:creator["'][^>]*content=["']([^"']*)["']/i);
    const viewportMatch = html.match(/<meta[^>]*name=["']viewport["'][^>]*content=["']([^"']*)["']/i);
    const robotsMatch = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["']/i);
    const languageMatch = html.match(/<html[^>]*lang=["']([^"']*)["']/i);
    const charsetMatch = html.match(/<meta[^>]*charset=["']([^"']*)["']/i) || html.match(/<meta[^>]*http-equiv=["']Content-Type["'][^>]*content=["'][^;]*;\s*charset=([^"']*)["']/i);

    const title = titleMatch ? titleMatch[1].trim() : null;
    const description = descMatch ? descMatch[1].trim() : null;
    
    // SEO optimization analysis
    const titleLength = title ? title.length : 0;
    const descriptionLength = description ? description.length : 0;
    const titleOptimal = titleLength >= 30 && titleLength <= 60;
    const descriptionOptimal = descriptionLength >= 120 && descriptionLength <= 160;
    const hasAllRequiredTags = !!(title && description && (ogTitleMatch || ogDescMatch));

    return {
      title,
      description,
      keywords: keywordsMatch ? keywordsMatch[1].trim() : null,
      canonical: canonicalMatch ? canonicalMatch[1] : null,
      ogTitle: ogTitleMatch ? ogTitleMatch[1].trim() : null,
      ogDescription: ogDescMatch ? ogDescMatch[1].trim() : null,
      ogImage: ogImageMatch ? ogImageMatch[1] : null,
      ogUrl: ogUrlMatch ? ogUrlMatch[1] : null,
      twitterCard: twitterCardMatch ? twitterCardMatch[1] : null,
      twitterSite: twitterSiteMatch ? twitterSiteMatch[1] : null,
      twitterCreator: twitterCreatorMatch ? twitterCreatorMatch[1] : null,
      viewport: viewportMatch ? viewportMatch[1] : null,
      robots: robotsMatch ? robotsMatch[1] : null,
      language: languageMatch ? languageMatch[1] : null,
      charset: charsetMatch ? charsetMatch[1] : null,
      titleLength,
      descriptionLength,
      titleOptimal,
      descriptionOptimal,
      hasAllRequiredTags,
    };
  } catch (error) {
    return {
      title: null,
      description: null,
      keywords: null,
      canonical: null,
      ogTitle: null,
      ogDescription: null,
      ogImage: null,
      ogUrl: null,
      twitterCard: null,
      twitterSite: null,
      twitterCreator: null,
      viewport: null,
      robots: null,
      language: null,
      charset: null,
      titleLength: 0,
      descriptionLength: 0,
      titleOptimal: false,
      descriptionOptimal: false,
      hasAllRequiredTags: false,
    };
  }
}

async function analyzeTechnicalHeaders(url: string): Promise<AuditResponse['technicalHeaders']> {
  try {
    const response = await fetch(url);
    const headers = response.headers;
    
    // Security headers
    const contentSecurityPolicy = headers.get('content-security-policy');
    const xFrameOptions = headers.get('x-frame-options');
    const strictTransportSecurity = headers.get('strict-transport-security');
    
    // Caching headers
    const cacheControl = headers.get('cache-control');
    const etag = headers.get('etag');
    const expires = headers.get('expires');
    
    // Server and compression
    const serverInfo = headers.get('server');
    const contentEncoding = headers.get('content-encoding');
    const isCompressed = !!(contentEncoding && (contentEncoding.includes('gzip') || contentEncoding.includes('br')));
    
    // Cookie security
    const setCookieHeaders = headers.get('set-cookie') || '';
    const httpOnlySet = setCookieHeaders.includes('HttpOnly');
    const secureSet = setCookieHeaders.includes('Secure');
    const sameSiteSet = setCookieHeaders.includes('SameSite');
    
    return {
      contentSecurityPolicy,
      xFrameOptions,
      strictTransportSecurity,
      cacheControl,
      etag,
      expires,
      serverInfo,
      contentEncoding,
      isCompressed,
      httpOnlySet,
      secureSet,
      sameSiteSet,
    };
  } catch (error) {
    console.error('Error analyzing technical headers:', error);
    return {
      contentSecurityPolicy: null,
      xFrameOptions: null,
      strictTransportSecurity: null,
      cacheControl: null,
      etag: null,
      expires: null,
      serverInfo: null,
      contentEncoding: null,
      isCompressed: false,
      httpOnlySet: false,
      secureSet: false,
      sameSiteSet: false,
    };
  }
}

async function analyzeImageOptimization(url: string): Promise<AuditResponse['imageOptimization']> {
  try {
    const response = await fetch(url);
    const html = await response.text();
    
    // Find all image tags
    const imgMatches = html.match(/<img[^>]*>/gi) || [];
    const totalImages = imgMatches.length;
    
    let imagesWithoutAlt = 0;
    let largeSizeImages = 0;
    let suboptimalFormats = 0;
    const recommendations: string[] = [];
    
    for (const imgTag of imgMatches) {
      // Check for alt attribute
      if (!imgTag.match(/alt\s*=\s*["'][^"']*["']/i)) {
        imagesWithoutAlt++;
      }
      
      // Check for suboptimal formats
      const srcMatch = imgTag.match(/src\s*=\s*["']([^"']*)["']/i);
      if (srcMatch) {
        const src = srcMatch[1];
        if (src.match(/\.(jpg|jpeg|png)$/i) && !src.match(/\.(webp|avif)$/i)) {
          suboptimalFormats++;
        }
      }
    }
    
    // Generate recommendations
    if (imagesWithoutAlt > 0) {
      recommendations.push(`Add alt text to ${imagesWithoutAlt} images for better accessibility and SEO`);
    }
    if (suboptimalFormats > 0) {
      recommendations.push(`Consider converting ${suboptimalFormats} images to modern formats (WebP, AVIF) for better performance`);
    }
    if (totalImages === 0) {
      recommendations.push('Consider adding relevant images to improve user engagement');
    }
    
    return {
      totalImages,
      imagesWithoutAlt,
      largeSizeImages,
      suboptimalFormats,
      recommendations,
    };
  } catch (error) {
    console.error('Error analyzing image optimization:', error);
    return {
      totalImages: 0,
      imagesWithoutAlt: 0,
      largeSizeImages: 0,
      suboptimalFormats: 0,
      recommendations: ['Unable to analyze images'],
    };
  }
}

async function analyzeContentAnalysis(url: string): Promise<AuditResponse['contentAnalysis']> {
  try {
    const response = await fetch(url);
    const html = await response.text();
    
    // Check for lang attribute
    const hasLangAttribute = /<html[^>]*lang\s*=\s*["'][^"']*["']/i.test(html);
    
    // Extract text content (remove HTML tags and scripts)
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    const wordCount = textContent.split(/\s+/).filter(word => word.length > 0).length;
    const isThinContent = wordCount < 300;
    
    // Analyze external links
    const linkMatches = html.match(/<a[^>]*href\s*=\s*["']([^"']*)["'][^>]*>/gi) || [];
    let externalLinksCount = 0;
    let externalLinksWithNofollow = 0;
    
    for (const link of linkMatches) {
      const hrefMatch = link.match(/href\s*=\s*["']([^"']*)["']/i);
      if (hrefMatch) {
        const href = hrefMatch[1];
        if (href.startsWith('http') && !href.includes(new URL(url).hostname)) {
          externalLinksCount++;
          if (link.includes('rel="nofollow"') || link.includes("rel='nofollow'")) {
            externalLinksWithNofollow++;
          }
        }
      }
    }
    
    const recommendations: string[] = [];
    if (isThinContent) {
      recommendations.push(`Increase content length (currently ${wordCount} words, recommended: 300+ words)`);
    }
    if (!hasLangAttribute) {
      recommendations.push('Add lang attribute to <html> tag for better accessibility');
    }
    if (externalLinksCount > 0 && externalLinksWithNofollow === 0) {
      recommendations.push('Consider adding rel="nofollow" to external links to preserve link equity');
    }
    
    return {
      wordCount,
      isThinContent,
      hasLangAttribute,
      externalLinksCount,
      externalLinksWithNofollow,
      recommendations,
    };
  } catch (error) {
    console.error('Error analyzing content:', error);
    return {
      wordCount: 0,
      isThinContent: true,
      hasLangAttribute: false,
      externalLinksCount: 0,
      externalLinksWithNofollow: 0,
      recommendations: ['Unable to analyze content'],
    };
  }
}

async function analyzeWebAppFeatures(url: string): Promise<AuditResponse['webAppFeatures']> {
  try {
    const response = await fetch(url);
    const html = await response.text();
    
    // Check for favicon
    const hasFavicon = /<link[^>]*rel\s*=\s*["'][^"']*icon[^"']*["'][^>]*>/i.test(html) ||
                     /<link[^>]*href\s*=\s*["'][^"']*favicon[^"']*["'][^>]*>/i.test(html);
    
    // Check for web app manifest
    const hasManifest = /<link[^>]*rel\s*=\s*["']manifest["'][^>]*>/i.test(html);
    
    // Check for hreflang
    const hasHreflang = /<link[^>]*hreflang\s*=\s*["'][^"']*["'][^>]*>/i.test(html);
    
    // Test HTTPS redirect
    let httpsRedirect = false;
    if (url.startsWith('https://')) {
      try {
        const httpUrl = url.replace('https://', 'http://');
        const httpResponse = await fetch(httpUrl, { redirect: 'manual' });
        httpsRedirect = httpResponse.status >= 300 && httpResponse.status < 400;
      } catch {
        httpsRedirect = false;
      }
    }
    
    const recommendations: string[] = [];
    if (!hasFavicon) {
      recommendations.push('Add a favicon to improve brand recognition and user experience');
    }
    if (!hasManifest) {
      recommendations.push('Add a web app manifest for better mobile experience and PWA capabilities');
    }
    if (!hasHreflang && html.includes('lang=')) {
      recommendations.push('Consider adding hreflang tags for international SEO if serving multiple languages');
    }
    if (!httpsRedirect && url.startsWith('https://')) {
      recommendations.push('Ensure automatic HTTP to HTTPS redirect is configured');
    }
    
    return {
      hasFavicon,
      hasManifest,
      hasHreflang,
      httpsRedirect,
      recommendations,
    };
  } catch (error) {
    console.error('Error analyzing web app features:', error);
    return {
      hasFavicon: false,
      hasManifest: false,
      hasHreflang: false,
      httpsRedirect: false,
      recommendations: ['Unable to analyze web app features'],
    };
  }
}

async function analyzeHeadingStructure(url: string): Promise<AuditResponse['headingStructure']> {
  try {
    const response = await fetch(url);
    const html = await response.text();
    
    // Extract all heading tags
    const h1Matches = html.match(/<h1[^>]*>([^<]*)<\/h1>/gi) || [];
    const h2Matches = html.match(/<h2[^>]*>([^<]*)<\/h2>/gi) || [];
    const h3Matches = html.match(/<h3[^>]*>([^<]*)<\/h3>/gi) || [];
    const h4Matches = html.match(/<h4[^>]*>([^<]*)<\/h4>/gi) || [];
    const h5Matches = html.match(/<h5[^>]*>([^<]*)<\/h5>/gi) || [];
    const h6Matches = html.match(/<h6[^>]*>([^<]*)<\/h6>/gi) || [];
    
    const h1Count = h1Matches.length;
    const h2Count = h2Matches.length;
    const h3Count = h3Matches.length;
    const h4Count = h4Matches.length;
    const h5Count = h5Matches.length;
    const h6Count = h6Matches.length;
    
    // Extract H1 text content
    const h1Text = h1Matches.map(match => {
      const textMatch = match.match(/<h1[^>]*>([^<]*)<\/h1>/i);
      return textMatch ? textMatch[1].trim() : '';
    }).filter(text => text.length > 0);
    
    const hasH1 = h1Count > 0;
    const multipleH1 = h1Count > 1;
    
    // Check heading hierarchy
    const headingCounts = [h1Count, h2Count, h3Count, h4Count, h5Count, h6Count];
    let properHierarchy = true;
    const missingLevels: string[] = [];
    
    // Check if headings follow proper hierarchy (no skipping levels)
    let foundHeading = false;
    for (let i = 0; i < headingCounts.length; i++) {
      if (headingCounts[i] > 0) {
        if (!foundHeading && i > 0) {
          // First heading should be H1
          properHierarchy = false;
          for (let j = 0; j < i; j++) {
            missingLevels.push(`H${j + 1}`);
          }
        }
        foundHeading = true;
      } else if (foundHeading && i < headingCounts.length - 1) {
        // Check if there are headings after this missing level
        const hasLaterHeadings = headingCounts.slice(i + 1).some(count => count > 0);
        if (hasLaterHeadings) {
          properHierarchy = false;
          missingLevels.push(`H${i + 1}`);
        }
      }
    }
    
    // Generate recommendations
    const recommendations: string[] = [];
    if (!hasH1) {
      recommendations.push('Add an H1 tag to clearly define the main topic of the page');
    }
    if (multipleH1) {
      recommendations.push('Use only one H1 tag per page for better SEO structure');
    }
    if (!properHierarchy) {
      recommendations.push('Follow proper heading hierarchy (H1 → H2 → H3, etc.) without skipping levels');
    }
    if (missingLevels.length > 0) {
      recommendations.push(`Consider adding missing heading levels: ${missingLevels.join(', ')}`);
    }
    if (h2Count === 0 && (h3Count > 0 || h4Count > 0 || h5Count > 0 || h6Count > 0)) {
      recommendations.push('Add H2 headings to create better content structure');
    }
    
    return {
      h1Count,
      h2Count,
      h3Count,
      h4Count,
      h5Count,
      h6Count,
      h1Text,
      hasH1,
      multipleH1,
      properHierarchy,
      missingLevels,
      recommendations,
    };
  } catch (error) {
    console.error('Error analyzing heading structure:', error);
    return {
      h1Count: 0,
      h2Count: 0,
      h3Count: 0,
      h4Count: 0,
      h5Count: 0,
      h6Count: 0,
      h1Text: [],
      hasH1: false,
      multipleH1: false,
      properHierarchy: false,
      missingLevels: [],
      recommendations: ['Unable to analyze heading structure'],
    };
  }
}

async function analyzeHttpsSecurity(url: string): Promise<AuditResponse['httpsSecurity']> {
  try {
    const isSecure = url.startsWith('https://');
    const response = await fetch(url);
    const hasHSTS = response.headers.get('strict-transport-security') !== null;
    
    return {
      isSecure,
      hasHSTS,
      mixedContent: false, // Would need more sophisticated analysis
    };
  } catch (error) {
    return {
      isSecure: url.startsWith('https://'),
      hasHSTS: false,
      mixedContent: false,
    };
  }
}

async function analyzeStructuredData(url: string): Promise<AuditResponse['structuredData']> {
  try {
    const response = await fetch(url);
    const html = await response.text();
    
    const jsonLdMatches = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([^<]*)<\/script>/gi);
    const microdataMatches = html.match(/itemtype="[^"]*"/gi);
    
    const types: string[] = [];
    const errors: string[] = [];
    
    if (jsonLdMatches) {
      jsonLdMatches.forEach(match => {
        try {
          const jsonContent = match.replace(/<script[^>]*>/, '').replace(/<\/script>/, '');
          const data = JSON.parse(jsonContent);
          if (data['@type']) {
            types.push(data['@type']);
          }
        } catch (e) {
          errors.push('Invalid JSON-LD syntax found');
        }
      });
    }

    return {
      hasSchema: types.length > 0 || (microdataMatches?.length || 0) > 0,
      types,
      errors,
    };
  } catch (error) {
    return {
      hasSchema: false,
      types: [],
      errors: ['Could not analyze structured data'],
    };
  }
}

async function checkRobotsAndSitemap(url: string): Promise<{robotsExists: boolean, sitemapExists: boolean, robotsContent: string | null}> {
  try {
    const baseUrl = new URL(url).origin;
    
    // Check robots.txt
    let robotsExists = false;
    let robotsContent = '';
    try {
      const robotsResponse = await fetch(`${baseUrl}/robots.txt`);
      robotsExists = robotsResponse.ok;
      if (robotsExists) {
        robotsContent = await robotsResponse.text();
      }
    } catch (e) {
      robotsExists = false;
    }

    // Check sitemap.xml
    let sitemapExists = false;
    try {
      const sitemapResponse = await fetch(`${baseUrl}/sitemap.xml`);
      sitemapExists = sitemapResponse.ok;
    } catch (e) {
      // Also check if robots.txt mentions sitemap
      if (robotsContent.toLowerCase().includes('sitemap:')) {
        sitemapExists = true;
      }
    }

    return { 
      robotsExists, 
      sitemapExists, 
      robotsContent: robotsContent || null 
    };
  } catch (error) {
    return { 
      robotsExists: false, 
      sitemapExists: false, 
      robotsContent: null 
    };
  }
}

async function checkBrokenLinks(url: string): Promise<{brokenLinks: string[], totalChecked: number}> {
  try {
    const response = await fetch(url);
    const html = await response.text();
    
    // Extract all links
    const linkMatches = html.match(/<a[^>]+href=["']([^"']+)["'][^>]*>/gi) || [];
    const links = linkMatches
      .map(match => {
        const hrefMatch = match.match(/href=["']([^"']+)["']/);
        return hrefMatch ? hrefMatch[1] : null;
      })
      .filter((link): link is string => Boolean(link))
      .slice(0, 10); // Limit to first 10 links for performance

    const brokenLinks: string[] = [];
    const baseUrl = new URL(url);

    // Check each link (with timeout for performance)
    for (const link of links) {
      if (!link) continue;
      
      try {
        let fullUrl = link;
        if (link.startsWith('/')) {
          fullUrl = `${baseUrl.origin}${link}`;
        } else if (!link.startsWith('http')) {
          continue; // Skip relative links and mailto/tel links
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const linkResponse = await fetch(fullUrl, { 
          method: 'HEAD',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!linkResponse.ok) {
          brokenLinks.push(fullUrl);
        }
      } catch (e) {
        brokenLinks.push(link);
      }
    }

    return { brokenLinks, totalChecked: links.length };
  } catch (error) {
    return { brokenLinks: [], totalChecked: 0 };
  }
}

async function callPageSpeedAPI(url: string, strategy: 'mobile' | 'desktop' = 'mobile'): Promise<PageSpeedResponse> {
  const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY;
  
  if (!apiKey) {
    throw new Error("Google PageSpeed API key is not configured");
  }

  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}&strategy=${strategy}&category=performance&category=accessibility&category=best-practices&category=seo`;

  const response = await fetch(apiUrl);
  
  if (!response.ok) {
    if (response.status === 400) {
      throw new Error("Invalid URL or URL is not accessible");
    } else if (response.status === 401) {
      throw new Error("Invalid API key");
    } else if (response.status === 403) {
      throw new Error("API quota exceeded or access denied");
    } else if (response.status === 429) {
      throw new Error("Rate limit exceeded. Please try again later");
    } else {
      throw new Error(`PageSpeed API error: ${response.status}`);
    }
  }

  return await response.json();
}

function generateRecommendations(audits: PageSpeedResponse['lighthouseResult']['audits']): AuditResponse['recommendations'] {
  const recommendations: AuditResponse['recommendations'] = [];

  // Check for unused CSS
  if (audits['unused-css-rules']?.score !== null && audits['unused-css-rules'].score < 0.9) {
    recommendations.push({
      title: "Optimize CSS",
      description: "Remove unused CSS rules to reduce file size and improve loading performance.",
      impact: "Medium",
      type: "performance"
    });
  }

  // Check for unused JavaScript
  if (audits['unused-javascript']?.score !== null && audits['unused-javascript'].score < 0.9) {
    recommendations.push({
      title: "Optimize JavaScript",
      description: "Remove unused JavaScript code to reduce bundle size and improve performance.",
      impact: "Medium", 
      type: "performance"
    });
  }

  // Check for render-blocking resources
  if (audits['render-blocking-resources']?.score !== null && audits['render-blocking-resources'].score < 0.9) {
    recommendations.push({
      title: "Optimize Images",
      description: "Large images are slowing down your Largest Contentful Paint. Consider using WebP format and proper sizing.",
      impact: "Medium",
      type: "performance"
    });
  }

  // Check for meta description
  if (audits['meta-description']?.score !== null && audits['meta-description'].score < 1) {
    recommendations.push({
      title: "Add Meta Description",
      description: "Some pages are missing meta descriptions which help search engines understand your content.",
      impact: "Low",
      type: "seo"
    });
  }

  // Check for document title
  if (audits['document-title']?.score !== null && audits['document-title'].score < 1) {
    recommendations.push({
      title: "Optimize Page Titles",
      description: "Ensure all pages have descriptive, unique titles for better SEO.",
      impact: "Medium",
      type: "seo"
    });
  }

  // Add a positive recommendation if scores are good
  if (recommendations.length === 0) {
    recommendations.push({
      title: "Excellent Performance",
      description: "Your website follows web performance best practices well. Keep up the good work!",
      impact: "Positive",
      type: "success"
    });
  }

  return recommendations;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint for audit features
  app.get("/api/health", async (req, res) => {
    try {
      const testUrl = "https://example.com";
      
      // Test each component individually
      const tests = {
        pageSpeedAPI: false,
        metaTagsAnalysis: false,
        headingStructureAnalysis: false,
        technicalHeadersAnalysis: false,
        imageOptimizationAnalysis: false,
        contentAnalysis: false,
        webAppFeaturesAnalysis: false,
        httpsSecurityCheck: false,
        structuredDataCheck: false,
        robotsSitemapCheck: false,
        brokenLinksCheck: false
      };

      try {
        await callPageSpeedAPI(testUrl, 'mobile');
        tests.pageSpeedAPI = true;
      } catch (e: any) {
        console.log('PageSpeed API test failed:', e.message);
      }

      try {
        await analyzeMetaTags(testUrl);
        tests.metaTagsAnalysis = true;
      } catch (e: any) {
        console.log('Meta tags analysis test failed:', e.message);
      }

      try {
        await analyzeHeadingStructure(testUrl);
        tests.headingStructureAnalysis = true;
      } catch (e: any) {
        console.log('Heading structure analysis test failed:', e.message);
      }

      try {
        await analyzeTechnicalHeaders(testUrl);
        tests.technicalHeadersAnalysis = true;
      } catch (e: any) {
        console.log('Technical headers analysis test failed:', e.message);
      }

      try {
        await analyzeImageOptimization(testUrl);
        tests.imageOptimizationAnalysis = true;
      } catch (e: any) {
        console.log('Image optimization analysis test failed:', e.message);
      }

      try {
        await analyzeContentAnalysis(testUrl);
        tests.contentAnalysis = true;
      } catch (e: any) {
        console.log('Content analysis test failed:', e.message);
      }

      try {
        await analyzeWebAppFeatures(testUrl);
        tests.webAppFeaturesAnalysis = true;
      } catch (e: any) {
        console.log('Web app features analysis test failed:', e.message);
      }

      try {
        await analyzeHttpsSecurity(testUrl);
        tests.httpsSecurityCheck = true;
      } catch (e: any) {
        console.log('HTTPS security test failed:', e.message);
      }

      try {
        await analyzeStructuredData(testUrl);
        tests.structuredDataCheck = true;
      } catch (e: any) {
        console.log('Structured data test failed:', e.message);
      }

      try {
        await checkRobotsAndSitemap(testUrl);
        tests.robotsSitemapCheck = true;
      } catch (e: any) {
        console.log('Robots/Sitemap test failed:', e.message);
      }

      try {
        await checkBrokenLinks(testUrl);
        tests.brokenLinksCheck = true;
      } catch (e: any) {
        console.log('Broken links test failed:', e.message);
      }

      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        apiKeyConfigured: !!process.env.GOOGLE_PAGESPEED_API_KEY,
        componentTests: tests,
        allTestsPassed: Object.values(tests).every(test => test === true)
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // SEO Audit endpoint
  app.post("/api/audit", async (req, res) => {
    try {
      // Validate request body
      const validatedData = auditRequestSchema.parse(req.body);
      const { url } = validatedData;

      console.log(`Starting comprehensive audit for: ${url}`);
      const startTime = Date.now();

      // Run all audits in parallel with timeout handling
      const [mobileData, desktopData, metaTags, headingStructure, technicalHeaders, imageOptimization, contentAnalysis, webAppFeatures, httpsSecurity, structuredData, robotsAndSitemap, brokenLinks] = await Promise.all([
        callPageSpeedAPI(url, 'mobile').catch(err => {
          console.error('Mobile PageSpeed failed:', err.message);
          throw err;
        }),
        callPageSpeedAPI(url, 'desktop').catch(err => {
          console.error('Desktop PageSpeed failed:', err.message);
          throw err;
        }),
        analyzeMetaTags(url).catch(err => {
          console.error('Meta tags analysis failed:', err.message);
          return { 
            title: null, description: null, keywords: null, canonical: null, 
            ogTitle: null, ogDescription: null, ogImage: null, ogUrl: null,
            twitterCard: null, twitterSite: null, twitterCreator: null,
            viewport: null, robots: null, language: null, charset: null,
            titleLength: 0, descriptionLength: 0, titleOptimal: false,
            descriptionOptimal: false, hasAllRequiredTags: false
          };
        }),
        analyzeHeadingStructure(url).catch(err => {
          console.error('Heading structure analysis failed:', err.message);
          return {
            h1Count: 0, h2Count: 0, h3Count: 0, h4Count: 0, h5Count: 0, h6Count: 0,
            h1Text: [], hasH1: false, multipleH1: false, properHierarchy: false,
            missingLevels: [], recommendations: ['Analysis failed']
          };
        }),
        analyzeTechnicalHeaders(url).catch(err => {
          console.error('Technical headers analysis failed:', err.message);
          return {
            contentSecurityPolicy: null, xFrameOptions: null, strictTransportSecurity: null,
            cacheControl: null, etag: null, expires: null, serverInfo: null,
            contentEncoding: null, isCompressed: false, httpOnlySet: false,
            secureSet: false, sameSiteSet: false
          };
        }),
        analyzeImageOptimization(url).catch(err => {
          console.error('Image optimization analysis failed:', err.message);
          return {
            totalImages: 0, imagesWithoutAlt: 0, largeSizeImages: 0,
            suboptimalFormats: 0, recommendations: ['Analysis failed']
          };
        }),
        analyzeContentAnalysis(url).catch(err => {
          console.error('Content analysis failed:', err.message);
          return {
            wordCount: 0, isThinContent: true, hasLangAttribute: false,
            externalLinksCount: 0, externalLinksWithNofollow: 0,
            recommendations: ['Analysis failed']
          };
        }),
        analyzeWebAppFeatures(url).catch(err => {
          console.error('Web app features analysis failed:', err.message);
          return {
            hasFavicon: false, hasManifest: false, hasHreflang: false,
            httpsRedirect: false, recommendations: ['Analysis failed']
          };
        }),
        analyzeHttpsSecurity(url).catch(err => {
          console.error('HTTPS analysis failed:', err.message);
          return { isSecure: url.startsWith('https://'), hasHSTS: false, mixedContent: false };
        }),
        analyzeStructuredData(url).catch(err => {
          console.error('Structured data analysis failed:', err.message);
          return { hasSchema: false, types: [], errors: ['Analysis failed'] };
        }),
        checkRobotsAndSitemap(url).catch(err => {
          console.error('Robots/Sitemap check failed:', err.message);
          return { robotsExists: false, sitemapExists: false, robotsContent: null };
        }),
        checkBrokenLinks(url).catch(err => {
          console.error('Broken links check failed:', err.message);
          return { brokenLinks: [], totalChecked: 0 };
        })
      ]);

      console.log(`All audits completed in ${Date.now() - startTime}ms`);
      
      const { categories, audits } = mobileData.lighthouseResult;
      const desktopCategories = desktopData.lighthouseResult.categories;

      // Convert mobile scores to percentages
      const performance = Math.round(categories.performance.score * 100);
      const accessibility = Math.round(categories.accessibility.score * 100);
      const bestPractices = Math.round(categories['best-practices'].score * 100);
      const seo = Math.round(categories.seo.score * 100);

      // Log key metrics for debugging
      console.log(`Mobile scores - Performance: ${performance}, Accessibility: ${accessibility}, Best Practices: ${bestPractices}, SEO: ${seo}`);
      console.log(`Desktop scores - Performance: ${Math.round(desktopCategories.performance.score * 100)}, Accessibility: ${Math.round(desktopCategories.accessibility.score * 100)}, Best Practices: ${Math.round(desktopCategories['best-practices'].score * 100)}, SEO: ${Math.round(desktopCategories.seo.score * 100)}`);
      console.log(`Meta tags - Title: ${metaTags.title ? 'Found' : 'Missing'}, Description: ${metaTags.description ? 'Found' : 'Missing'}`);
      console.log(`Heading structure - H1: ${headingStructure.h1Count}, H2: ${headingStructure.h2Count}, Proper hierarchy: ${headingStructure.properHierarchy}`);
      console.log(`Technical - HTTPS: ${httpsSecurity.isSecure}, Robots: ${robotsAndSitemap.robotsExists}, Sitemap: ${robotsAndSitemap.sitemapExists}, Broken Links: ${brokenLinks.brokenLinks.length}`);

      // Desktop scores
      const mobileScore = {
        performance,
        accessibility,
        bestPractices,
        seo
      };

      const desktopScore = {
        performance: Math.round(desktopCategories.performance.score * 100),
        accessibility: Math.round(desktopCategories.accessibility.score * 100),
        bestPractices: Math.round(desktopCategories['best-practices'].score * 100),
        seo: Math.round(desktopCategories.seo.score * 100)
      };

      // Calculate overall score (weighted average of mobile and desktop)
      const overallScore = Math.round(
        ((performance + desktopScore.performance) * 0.2 + 
         (accessibility + desktopScore.accessibility) * 0.15 + 
         (bestPractices + desktopScore.bestPractices) * 0.15 + 
         (seo + desktopScore.seo) * 0.25) / 2
      );

      // Format Core Web Vitals
      const fcp = audits['first-contentful-paint']?.displayValue || "N/A";
      const lcp = audits['largest-contentful-paint']?.displayValue || "N/A";
      const fcpNumeric = audits['first-contentful-paint']?.numericValue || 0;
      const lcpNumeric = audits['largest-contentful-paint']?.numericValue || 0;

      // Generate recommendations
      const recommendations = generateRecommendations(audits);

      // Generate technical issues
      const technicalIssues: AuditResponse['technicalIssues'] = [];
      
      if (!httpsSecurity.isSecure) {
        technicalIssues.push({
          category: 'Security',
          issue: 'No HTTPS',
          severity: 'High',
          description: 'Website is not using HTTPS, which affects SEO rankings and user trust.'
        });
      }

      if (!metaTags.title) {
        technicalIssues.push({
          category: 'SEO',
          issue: 'Missing Title Tag',
          severity: 'High',
          description: 'Page is missing a title tag, which is crucial for SEO.'
        });
      }

      if (!metaTags.description) {
        technicalIssues.push({
          category: 'SEO',
          issue: 'Missing Meta Description',
          severity: 'Medium',
          description: 'Page is missing a meta description, which helps search engines understand content.'
        });
      }

      if (!structuredData.hasSchema) {
        technicalIssues.push({
          category: 'SEO',
          issue: 'No Structured Data',
          severity: 'Low',
          description: 'No structured data found. Adding Schema markup can improve search visibility.'
        });
      }

      if (!robotsAndSitemap.robotsExists) {
        technicalIssues.push({
          category: 'SEO',
          issue: 'Missing robots.txt',
          severity: 'Medium',
          description: 'robots.txt file not found. This file helps search engines understand how to crawl your site.'
        });
      }

      if (!robotsAndSitemap.sitemapExists) {
        technicalIssues.push({
          category: 'SEO',
          issue: 'Missing sitemap.xml',
          severity: 'Medium',
          description: 'sitemap.xml file not found. This helps search engines discover and index your pages.'
        });
      }

      if (brokenLinks.brokenLinks.length > 0) {
        technicalIssues.push({
          category: 'SEO',
          issue: `${brokenLinks.brokenLinks.length} Broken Links Found`,
          severity: 'High',
          description: `Found ${brokenLinks.brokenLinks.length} broken links out of ${brokenLinks.totalChecked} checked. Broken links hurt user experience and SEO.`
        });
      }

      const auditResult: AuditResponse = {
        url,
        timestamp: new Date().toISOString(),
        overallScore,
        performance,
        accessibility,
        bestPractices,
        seo,
        fcp,
        lcp,
        fcpNumeric,
        lcpNumeric,
        recommendations,
        mobileScore,
        desktopScore,
        technicalIssues,
        metaTags,
        headingStructure,
        technicalHeaders,
        imageOptimization,
        contentAnalysis,
        webAppFeatures,
        httpsSecurity,
        structuredData,
        robotsAndSitemap,
        brokenLinks,
      };

      res.json(auditResult);
    } catch (error) {
      console.error("Audit error:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid request data",
          errors: error.errors,
        });
      }

      const errorMessage = error instanceof Error ? error.message : "Internal server error";
      res.status(500).json({ message: errorMessage });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
