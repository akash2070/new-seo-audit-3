import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { AuditResponse } from '@shared/schema';

export interface PDFExportOptions {
  filename?: string;
  includeCharts?: boolean;
  format?: 'a4' | 'letter';
}

export class PDFExporter {
  private pdf: jsPDF;
  private pageHeight: number;
  private pageWidth: number;
  private margin: number;
  private currentY: number;
  private lineHeight: number;

  constructor(format: 'a4' | 'letter' = 'a4') {
    this.pdf = new jsPDF('p', 'mm', format);
    this.pageHeight = format === 'a4' ? 297 : 279;
    this.pageWidth = format === 'a4' ? 210 : 216;
    this.margin = 20;
    this.currentY = this.margin;
    this.lineHeight = 6;
  }

  private addNewPageIfNeeded(requiredHeight: number): void {
    if (this.currentY + requiredHeight > this.pageHeight - this.margin) {
      this.pdf.addPage();
      this.currentY = this.margin;
    }
  }

  private addText(text: string, x: number, y: number, options: {
    fontSize?: number;
    fontStyle?: 'normal' | 'bold' | 'italic';
    color?: string;
    align?: 'left' | 'center' | 'right';
    maxWidth?: number;
  } = {}): number {
    const {
      fontSize = 12,
      fontStyle = 'normal',
      color = '#000000',
      align = 'left',
      maxWidth = this.pageWidth - 2 * this.margin
    } = options;

    this.pdf.setFontSize(fontSize);
    this.pdf.setFont('helvetica', fontStyle);
    this.pdf.setTextColor(color);

    const lines = this.pdf.splitTextToSize(text, maxWidth);
    lines.forEach((line: string, index: number) => {
      this.pdf.text(line, x, y + (index * this.lineHeight), { align });
    });

    return lines.length * this.lineHeight;
  }

  private addSection(title: string, content?: string): void {
    this.addNewPageIfNeeded(20);
    
    // Section header background
    this.pdf.setFillColor('#f3f4f6');
    this.pdf.rect(this.margin, this.currentY - 2, this.pageWidth - 2 * this.margin, 12, 'F');
    
    // Section title
    this.addText(title, this.margin + 5, this.currentY + 6, {
      fontSize: 14,
      fontStyle: 'bold',
      color: '#1f2937'
    });
    
    this.currentY += 15;

    if (content) {
      this.addText(content, this.margin, this.currentY, {
        fontSize: 10,
        color: '#6b7280'
      });
      this.currentY += this.lineHeight * 2;
    }
  }

  private addScoreCard(label: string, score: number, description: string, y: number): void {
    const cardHeight = 12;
    
    // Score color
    let scoreColor = '#ef4444';
    if (score >= 90) scoreColor = '#22c55e';
    else if (score >= 70) scoreColor = '#f59e0b';

    // Card background
    this.pdf.setFillColor('#f8fafc');
    this.pdf.rect(this.margin, y, this.pageWidth - 2 * this.margin, cardHeight, 'F');

    // Label
    this.pdf.setTextColor('#374151');
    this.pdf.setFontSize(11);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(label, this.margin + 5, y + 7);

    // Score
    this.pdf.setTextColor(scoreColor);
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(`${score}`, this.pageWidth - this.margin - 25, y + 8);

    // Description
    this.pdf.setTextColor('#6b7280');
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(description, this.margin + 5, y + 11);

    this.currentY = y + cardHeight + 3;
  }

  private addRecommendation(recommendation: any, index: number): void {
    const cardHeight = 25;
    this.addNewPageIfNeeded(cardHeight + 5);

    const y = this.currentY;

    // Card background
    let bgColor = '#eff6ff'; // blue
    if (recommendation.type === 'performance') bgColor = '#fef3c7'; // amber
    else if (recommendation.type === 'success') bgColor = '#dcfce7'; // green

    const rgbColor = this.hexToRgb(bgColor);
    this.pdf.setFillColor(rgbColor.r, rgbColor.g, rgbColor.b);
    this.pdf.rect(this.margin, y, this.pageWidth - 2 * this.margin, cardHeight, 'F');

    // Recommendation number
    this.pdf.setFillColor('#3b82f6');
    this.pdf.circle(this.margin + 8, y + 8, 4, 'F');
    this.pdf.setTextColor('#ffffff');
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text((index + 1).toString(), this.margin + 8, y + 10, { align: 'center' });

    // Title
    this.pdf.setTextColor('#1f2937');
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(recommendation.title, this.margin + 18, y + 6);

    // Description
    this.pdf.setTextColor('#4b5563');
    this.pdf.setFontSize(9);
    this.pdf.setFont('helvetica', 'normal');
    const descriptionLines = this.pdf.splitTextToSize(recommendation.description, this.pageWidth - 2 * this.margin - 25);
    descriptionLines.forEach((line: string, lineIndex: number) => {
      this.pdf.text(line, this.margin + 18, y + 12 + (lineIndex * 3));
    });

    // Impact badge
    const badgeX = this.pageWidth - this.margin - 30;
    this.pdf.setFillColor('#e5e7eb');
    this.pdf.rect(badgeX, y + 2, 25, 6, 'F');
    this.pdf.setTextColor('#6b7280');
    this.pdf.setFontSize(7);
    this.pdf.text(recommendation.impact.toUpperCase(), badgeX + 12.5, y + 6, { align: 'center' });

    this.currentY = y + cardHeight + 3;
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 255, g: 255, b: 255 };
  }

  private addHeader(results: AuditResponse): void {
    // Logo area
    this.pdf.setFillColor('#3b82f6');
    this.pdf.rect(this.margin, this.currentY, 40, 15, 'F');
    
    this.pdf.setTextColor('#ffffff');
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('SEO Audit', this.margin + 20, this.currentY + 10, { align: 'center' });

    // Report title
    this.pdf.setTextColor('#1f2937');
    this.pdf.setFontSize(20);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Comprehensive SEO Analysis Report', this.margin + 50, this.currentY + 10);

    this.currentY += 20;

    // Website info
    this.addText(`Website: ${results.url}`, this.margin, this.currentY, {
      fontSize: 12,
      color: '#4b5563'
    });
    this.currentY += 8;

    const auditDate = new Date(results.timestamp).toLocaleString();
    this.addText(`Audit Date: ${auditDate}`, this.margin, this.currentY, {
      fontSize: 12,
      color: '#4b5563'
    });
    this.currentY += 15;

    // Overall score
    this.pdf.setFillColor('#f8fafc');
    this.pdf.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 30, 'F');

    this.pdf.setTextColor('#1f2937');
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Overall Performance Score', this.margin + 10, this.currentY + 12);

    // Score circle
    const scoreX = this.pageWidth - this.margin - 30;
    const scoreY = this.currentY + 15;
    
    let scoreColor = '#ef4444';
    if (results.overallScore >= 90) scoreColor = '#22c55e';
    else if (results.overallScore >= 70) scoreColor = '#f59e0b';

    this.pdf.setFillColor(scoreColor);
    this.pdf.circle(scoreX, scoreY, 12, 'F');

    this.pdf.setTextColor('#ffffff');
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(results.overallScore.toString(), scoreX, scoreY + 3, { align: 'center' });

    this.pdf.setTextColor('#6b7280');
    this.pdf.setFontSize(10);
    this.pdf.text('/100', scoreX, scoreY + 12, { align: 'center' });

    this.currentY += 40;
  }

  public async exportToPDF(results: AuditResponse, options: PDFExportOptions = {}): Promise<void> {
    const { filename = `comprehensive-seo-audit-${new Date().toISOString().split('T')[0]}.pdf` } = options;

    try {
      // Reset position
      this.currentY = this.margin;

      // Add header
      this.addHeader(results);

      // 1. Performance Overview Section
      this.addNewPageIfNeeded(80);
      this.addSection('Performance Overview & Core Web Vitals');
      
      // Mobile Performance Details
      this.addText('Mobile Performance Analysis:', this.margin, this.currentY, { fontSize: 12, fontStyle: 'bold' });
      this.currentY += this.lineHeight;
      this.addScoreCard('Performance', results.mobileScore.performance, 'Page loading speed and optimization on mobile devices', this.currentY);
      this.currentY += 15;
      this.addScoreCard('Accessibility', results.mobileScore.accessibility, 'Mobile accessibility standards compliance', this.currentY);
      this.currentY += 15;
      this.addScoreCard('Best Practices', results.mobileScore.bestPractices, 'Mobile development best practices adherence', this.currentY);
      this.currentY += 15;
      this.addScoreCard('SEO', results.mobileScore.seo, 'Mobile search engine optimization factors', this.currentY);
      this.currentY += 20;
      
      // Desktop Performance Details
      this.addText('Desktop Performance Analysis:', this.margin, this.currentY, { fontSize: 12, fontStyle: 'bold' });
      this.currentY += this.lineHeight;
      this.addScoreCard('Performance', results.desktopScore.performance, 'Page loading speed and optimization on desktop', this.currentY);
      this.currentY += 15;
      this.addScoreCard('Accessibility', results.desktopScore.accessibility, 'Desktop accessibility standards compliance', this.currentY);
      this.currentY += 15;
      this.addScoreCard('Best Practices', results.desktopScore.bestPractices, 'Desktop development best practices adherence', this.currentY);
      this.currentY += 15;
      this.addScoreCard('SEO', results.desktopScore.seo, 'Desktop search engine optimization factors', this.currentY);
      this.currentY += 25;

      // Core Web Vitals Details
      this.addText('Core Web Vitals Metrics:', this.margin, this.currentY, { fontSize: 12, fontStyle: 'bold' });
      this.currentY += this.lineHeight;
      this.addText(`First Contentful Paint (FCP): ${results.fcp}`, this.margin, this.currentY);
      this.currentY += this.lineHeight;
      this.addText('• Measures when the first content element appears', this.margin + 5, this.currentY, { fontSize: 10 });
      this.currentY += this.lineHeight;
      this.addText(`Largest Contentful Paint (LCP): ${results.lcp}`, this.margin, this.currentY);
      this.currentY += this.lineHeight;
      this.addText('• Measures loading performance of the main content', this.margin + 5, this.currentY, { fontSize: 10 });
      this.currentY += this.lineHeight * 2;

      // 2. Meta Tags & SEO Elements Section
      this.addNewPageIfNeeded(100);
      this.addSection('Meta Tags & SEO Elements Analysis');
      
      // Title Tag Analysis
      this.addText('Title Tag Analysis:', this.margin, this.currentY, { fontSize: 12, fontStyle: 'bold' });
      this.currentY += this.lineHeight;
      if (results.metaTags.title) {
        this.addText(`Content: "${results.metaTags.title}"`, this.margin, this.currentY);
        this.currentY += this.lineHeight;
        this.addText(`Length: ${results.metaTags.titleLength} characters`, this.margin, this.currentY);
        this.currentY += this.lineHeight;
        this.addText(`Status: ${results.metaTags.titleOptimal ? 'Optimal (30-60 chars)' : 'Needs optimization'}`, this.margin, this.currentY, { 
          color: results.metaTags.titleOptimal ? '#22c55e' : '#f59e0b' 
        });
      } else {
        this.addText('Status: Missing - Critical SEO issue', this.margin, this.currentY, { color: '#ef4444' });
      }
      this.currentY += this.lineHeight * 2;
      
      // Meta Description Analysis
      this.addText('Meta Description Analysis:', this.margin, this.currentY, { fontSize: 12, fontStyle: 'bold' });
      this.currentY += this.lineHeight;
      if (results.metaTags.description) {
        this.addText(`Content: "${results.metaTags.description}"`, this.margin, this.currentY);
        this.currentY += this.lineHeight;
        this.addText(`Length: ${results.metaTags.descriptionLength} characters`, this.margin, this.currentY);
        this.currentY += this.lineHeight;
        this.addText(`Status: ${results.metaTags.descriptionOptimal ? 'Optimal (120-160 chars)' : 'Needs optimization'}`, this.margin, this.currentY, { 
          color: results.metaTags.descriptionOptimal ? '#22c55e' : '#f59e0b' 
        });
      } else {
        this.addText('Status: Missing - Important for search results', this.margin, this.currentY, { color: '#ef4444' });
      }
      this.currentY += this.lineHeight * 2;

      // Social Media Tags
      this.addText('Social Media Integration:', this.margin, this.currentY, { fontSize: 12, fontStyle: 'bold' });
      this.currentY += this.lineHeight;
      this.addText(`Open Graph Title: ${results.metaTags.ogTitle || 'Not configured'}`, this.margin, this.currentY);
      this.currentY += this.lineHeight;
      this.addText(`Open Graph Description: ${results.metaTags.ogDescription || 'Not configured'}`, this.margin, this.currentY);
      this.currentY += this.lineHeight;
      this.addText(`Open Graph Image: ${results.metaTags.ogImage || 'Not configured'}`, this.margin, this.currentY);
      this.currentY += this.lineHeight;
      this.addText(`Twitter Card: ${results.metaTags.twitterCard || 'Not configured'}`, this.margin, this.currentY);
      this.currentY += this.lineHeight;
      this.addText(`Twitter Site: ${results.metaTags.twitterSite || 'Not configured'}`, this.margin, this.currentY);
      this.currentY += this.lineHeight * 2;

      // Technical Meta Tags
      this.addText('Technical Meta Tags:', this.margin, this.currentY, { fontSize: 12, fontStyle: 'bold' });
      this.currentY += this.lineHeight;
      this.addText(`Canonical URL: ${results.metaTags.canonical || 'Not specified'}`, this.margin, this.currentY);
      this.currentY += this.lineHeight;
      this.addText(`Viewport: ${results.metaTags.viewport || 'Not configured'}`, this.margin, this.currentY);
      this.currentY += this.lineHeight;
      this.addText(`Language: ${results.metaTags.language || 'Not specified'}`, this.margin, this.currentY);
      this.currentY += this.lineHeight;
      this.addText(`Character Set: ${results.metaTags.charset || 'Not specified'}`, this.margin, this.currentY);
      this.currentY += this.lineHeight;
      this.addText(`Robots Meta: ${results.metaTags.robots || 'Default behavior'}`, this.margin, this.currentY);
      this.currentY += this.lineHeight * 2;

      // 3. Heading Structure Analysis Section
      this.addNewPageIfNeeded(80);
      this.addSection('Heading Structure & Content Hierarchy');
      
      this.addText('Heading Distribution Analysis:', this.margin, this.currentY, { fontSize: 12, fontStyle: 'bold' });
      this.currentY += this.lineHeight;
      this.addText(`H1 Tags: ${results.headingStructure.h1Count} ${results.headingStructure.hasH1 ? '✓ Present' : '✗ Missing'}`, this.margin, this.currentY);
      this.currentY += this.lineHeight;
      this.addText(`H2 Tags: ${results.headingStructure.h2Count}`, this.margin, this.currentY);
      this.currentY += this.lineHeight;
      this.addText(`H3 Tags: ${results.headingStructure.h3Count}`, this.margin, this.currentY);
      this.currentY += this.lineHeight;
      this.addText(`H4-H6 Tags: ${results.headingStructure.h4Count + results.headingStructure.h5Count + results.headingStructure.h6Count}`, this.margin, this.currentY);
      this.currentY += this.lineHeight * 2;

      if (results.headingStructure.h1Text.length > 0) {
        this.addText('H1 Content Analysis:', this.margin, this.currentY, { fontSize: 11, fontStyle: 'bold' });
        this.currentY += this.lineHeight;
        results.headingStructure.h1Text.forEach(h1 => {
          this.addText(`• "${h1}"`, this.margin + 5, this.currentY, { fontSize: 10 });
          this.currentY += this.lineHeight;
        });
        this.currentY += this.lineHeight;
      }

      this.addText('SEO Structure Assessment:', this.margin, this.currentY, { fontSize: 11, fontStyle: 'bold' });
      this.currentY += this.lineHeight;
      this.addText(`Proper Hierarchy: ${results.headingStructure.properHierarchy ? 'Yes ✓' : 'No ✗ - Fix heading order'}`, this.margin, this.currentY);
      this.currentY += this.lineHeight;
      this.addText(`Multiple H1 Issue: ${results.headingStructure.multipleH1 ? 'Yes ✗ - Use only one H1' : 'No ✓'}`, this.margin, this.currentY);
      this.currentY += this.lineHeight;
      
      if (results.headingStructure.missingLevels.length > 0) {
        this.addText(`Missing Levels: ${results.headingStructure.missingLevels.join(', ')}`, this.margin, this.currentY);
        this.currentY += this.lineHeight;
      }
      this.currentY += this.lineHeight;

      // Save PDF
      this.pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }
}

// Export utility function
export async function exportAuditToPDF(
  results: AuditResponse, 
  options: PDFExportOptions = {}
): Promise<void> {
  const exporter = new PDFExporter(options.format);
  await exporter.exportToPDF(results, options);
}