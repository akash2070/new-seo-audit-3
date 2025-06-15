import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Download, 
  Share, 
  RotateCcw, 
  Globe, 
  Gauge, 
  Shield, 
  Award, 
  SearchCheck,
  Paintbrush,
  Expand,
  Lightbulb,
  AlertTriangle,
  Info,
  CheckCircle,
  FileText,
  Loader2
} from "@/components/icons";
import { useState } from "react";
import { exportAuditToPDF } from "@/lib/pdf-export";
import { useToast } from "@/hooks/use-toast";
import { MetaTagsAnalysis } from "./meta-tags-analysis";
import { HeadingStructureAnalysis } from "./heading-structure-analysis";
import { TechnicalAnalysis } from "./technical-analysis";
import type { AuditResponse } from "@shared/schema";

interface AuditResultsProps {
  results: AuditResponse;
  onNewAudit: () => void;
}

export function AuditResults({ results, onNewAudit }: AuditResultsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const filename = `seo-audit-${new URL(results.url).hostname}-${new Date().toISOString().split('T')[0]}.pdf`;
      await exportAuditToPDF(results, { filename, format: 'a4' });
      
      toast({
        title: "PDF Export Successful",
        description: "Your SEO audit report has been downloaded successfully.",
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: "Export Failed",
        description: "There was an error generating your PDF report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 70) return "bg-amber-500";
    return "bg-red-500";
  };

  const getPerformanceLabel = (score: number) => {
    if (score >= 90) return "Good Performance";
    if (score >= 70) return "Needs Improvement";
    return "Poor Performance";
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    return date.toLocaleDateString();
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case "performance":
        return <AlertTriangle className="h-4 w-4 text-amber-600" />;
      case "seo":
        return <Info className="h-4 w-4 text-blue-600" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getRecommendationBg = (type: string) => {
    switch (type) {
      case "performance":
        return "bg-amber-50 border-amber-200";
      case "seo":
        return "bg-blue-50 border-blue-200";
      case "success":
        return "bg-green-50 border-green-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  const getRecommendationBadge = (type: string, impact: string) => {
    const baseClasses = "inline-flex items-center px-2 py-1 rounded text-xs font-medium";
    
    switch (type) {
      case "performance":
        return `${baseClasses} bg-amber-100 text-amber-800`;
      case "seo":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case "success":
        return `${baseClasses} bg-green-100 text-green-800`;
      default:
        return `${baseClasses} bg-blue-100 text-blue-800`;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-slide-up">
      {/* Results Header */}
      <Card className="p-6 mb-6">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Audit Results</h3>
              <div className="flex items-center text-sm text-gray-600">
                <Globe className="h-4 w-4 mr-2" />
                <span className="break-all">{results.url}</span>
                <span className="mx-2">•</span>
                <span>{formatTimestamp(results.timestamp)}</span>
              </div>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <Button 
                onClick={handleExportPDF}
                disabled={isExporting}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                <span>{isExporting ? "Generating..." : "Export PDF"}</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export Data</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Score */}
      <Card className="p-6 mb-6">
        <CardContent className="p-0">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Overall Performance Score</h4>
          <div className="flex items-center justify-center">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" stroke="#E5E7EB" strokeWidth="8" fill="none"/>
                <circle 
                  cx="60" 
                  cy="60" 
                  r="50" 
                  stroke={results.overallScore >= 90 ? "#059669" : results.overallScore >= 70 ? "#D97706" : "#DC2626"}
                  strokeWidth="8" 
                  fill="none" 
                  strokeDasharray="314" 
                  strokeDashoffset={314 - (314 * results.overallScore / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{results.overallScore}</div>
                  <div className="text-sm text-gray-500">/ 100</div>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center mt-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              results.overallScore >= 90 ? "bg-green-100 text-green-800" :
              results.overallScore >= 70 ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"
            }`}>
              <CheckCircle className="h-4 w-4 mr-1" />
              {getPerformanceLabel(results.overallScore)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Mobile vs Desktop Comparison */}
      <Card className="p-6 mb-6">
        <CardContent className="p-0">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            📱 Mobile vs 💻 Desktop Performance
          </h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mobile Scores */}
            <div>
              <h5 className="font-medium text-gray-900 mb-3">Mobile Scores</h5>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Performance</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div className={`h-2 rounded-full ${getScoreBgColor(results.mobileScore.performance)}`} 
                           style={{width: `${results.mobileScore.performance}%`}}></div>
                    </div>
                    <span className={`text-sm font-medium ${getScoreColor(results.mobileScore.performance)}`}>
                      {results.mobileScore.performance}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Accessibility</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div className={`h-2 rounded-full ${getScoreBgColor(results.mobileScore.accessibility)}`} 
                           style={{width: `${results.mobileScore.accessibility}%`}}></div>
                    </div>
                    <span className={`text-sm font-medium ${getScoreColor(results.mobileScore.accessibility)}`}>
                      {results.mobileScore.accessibility}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Best Practices</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div className={`h-2 rounded-full ${getScoreBgColor(results.mobileScore.bestPractices)}`} 
                           style={{width: `${results.mobileScore.bestPractices}%`}}></div>
                    </div>
                    <span className={`text-sm font-medium ${getScoreColor(results.mobileScore.bestPractices)}`}>
                      {results.mobileScore.bestPractices}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">SEO</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div className={`h-2 rounded-full ${getScoreBgColor(results.mobileScore.seo)}`} 
                           style={{width: `${results.mobileScore.seo}%`}}></div>
                    </div>
                    <span className={`text-sm font-medium ${getScoreColor(results.mobileScore.seo)}`}>
                      {results.mobileScore.seo}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Scores */}
            <div>
              <h5 className="font-medium text-gray-900 mb-3">Desktop Scores</h5>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Performance</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div className={`h-2 rounded-full ${getScoreBgColor(results.desktopScore.performance)}`} 
                           style={{width: `${results.desktopScore.performance}%`}}></div>
                    </div>
                    <span className={`text-sm font-medium ${getScoreColor(results.desktopScore.performance)}`}>
                      {results.desktopScore.performance}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Accessibility</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div className={`h-2 rounded-full ${getScoreBgColor(results.desktopScore.accessibility)}`} 
                           style={{width: `${results.desktopScore.accessibility}%`}}></div>
                    </div>
                    <span className={`text-sm font-medium ${getScoreColor(results.desktopScore.accessibility)}`}>
                      {results.desktopScore.accessibility}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Best Practices</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div className={`h-2 rounded-full ${getScoreBgColor(results.desktopScore.bestPractices)}`} 
                           style={{width: `${results.desktopScore.bestPractices}%`}}></div>
                    </div>
                    <span className={`text-sm font-medium ${getScoreColor(results.desktopScore.bestPractices)}`}>
                      {results.desktopScore.bestPractices}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">SEO</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div className={`h-2 rounded-full ${getScoreBgColor(results.desktopScore.seo)}`} 
                           style={{width: `${results.desktopScore.seo}%`}}></div>
                    </div>
                    <span className={`text-sm font-medium ${getScoreColor(results.desktopScore.seo)}`}>
                      {results.desktopScore.seo}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Core Web Vitals */}
      <Card className="p-6 mb-6">
        <CardContent className="p-0">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Paintbrush className="h-5 w-5 text-cyan-600 mr-2" />
            Core Web Vitals
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h5 className="font-medium text-gray-900">First Contentful Paint</h5>
                <p className="text-sm text-gray-500">Initial render time</p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-green-600">{results.fcp}</div>
                <div className="text-xs text-green-600">Good</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h5 className="font-medium text-gray-900">Largest Contentful Paint</h5>
                <p className="text-sm text-gray-500">Main content load</p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-amber-600">{results.lcp}</div>
                <div className="text-xs text-amber-600">
                  {results.lcpNumeric < 2500 ? "Good" : results.lcpNumeric < 4000 ? "Needs Improvement" : "Poor"}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Issues */}
      {results.technicalIssues && results.technicalIssues.length > 0 && (
        <Card className="p-6 mb-6">
          <CardContent className="p-0">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              Technical Issues
            </h4>
            <div className="space-y-3">
              {results.technicalIssues.map((issue, index) => (
                <div key={index} className={`flex items-start space-x-3 p-4 rounded-lg border ${
                  issue.severity === 'High' ? 'bg-red-50 border-red-200' :
                  issue.severity === 'Medium' ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex-shrink-0 mt-1">
                    {issue.severity === 'High' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                    {issue.severity === 'Medium' && <AlertTriangle className="h-4 w-4 text-amber-600" />}
                    {issue.severity === 'Low' && <Info className="h-4 w-4 text-blue-600" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h6 className="font-medium text-gray-900">{issue.issue}</h6>
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        issue.severity === 'High' ? 'bg-red-100 text-red-800' :
                        issue.severity === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {issue.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{issue.description}</p>
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 mt-2">
                      {issue.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Meta Tags Analysis */}
      <Card className="p-6 mb-6">
        <CardContent className="p-0">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <SearchCheck className="h-5 w-5 text-blue-600 mr-2" />
            Meta Tags & SEO Elements
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Title Tag</span>
                {results.metaTags.title ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
              </div>
              {results.metaTags.title && (
                <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  {results.metaTags.title}
                </p>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Meta Description</span>
                {results.metaTags.description ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
              </div>
              {results.metaTags.description && (
                <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  {results.metaTags.description}
                </p>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Canonical URL</span>
                {results.metaTags.canonical ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Info className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Open Graph Title</span>
                {results.metaTags.ogTitle ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Info className="h-4 w-4 text-gray-400" />
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Twitter Card</span>
                {results.metaTags.twitterCard ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Info className="h-4 w-4 text-gray-400" />
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">HTTPS Security</span>
                {results.httpsSecurity.isSecure ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Structured Data</span>
                {results.structuredData.hasSchema ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Info className="h-4 w-4 text-gray-400" />
                )}
              </div>
              {results.structuredData.types.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {results.structuredData.types.map((type, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                      {type}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">robots.txt</span>
                {results.robotsAndSitemap.robotsExists ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">sitemap.xml</span>
                {results.robotsAndSitemap.sitemapExists ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Broken Links Section */}
      <Card className="p-6 mb-6">
        <CardContent className="p-0">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Globe className="h-5 w-5 text-blue-600 mr-2" />
            Broken Link Check
          </h4>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
            <div>
              <h5 className="font-medium text-gray-900">Links Analyzed</h5>
              <p className="text-sm text-gray-500">Checked {results.brokenLinks.totalChecked} links on this page</p>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${results.brokenLinks.brokenLinks.length === 0 ? 'text-green-600' : 'text-red-600'}`}>
                {results.brokenLinks.brokenLinks.length}
              </div>
              <div className="text-xs text-gray-500">broken</div>
            </div>
          </div>
          
          {results.brokenLinks.brokenLinks.length > 0 ? (
            <div className="space-y-2">
              <h6 className="font-medium text-red-800 mb-2">Broken Links Found:</h6>
              {results.brokenLinks.brokenLinks.slice(0, 5).map((link, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 bg-red-50 border border-red-200 rounded">
                  <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <span className="text-sm text-red-800 break-all">{link}</span>
                </div>
              ))}
              {results.brokenLinks.brokenLinks.length > 5 && (
                <p className="text-sm text-gray-600 mt-2">
                  ... and {results.brokenLinks.brokenLinks.length - 5} more broken links
                </p>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm text-green-800">No broken links found - excellent!</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendations Section */}
      <Card className="p-6 mb-6">
        <CardContent className="p-0">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Lightbulb className="h-5 w-5 text-yellow-500 mr-2" />
            Recommendations
          </h4>
          <div className="space-y-4">
            {results.recommendations.map((rec, index) => (
              <div key={index} className={`flex items-start space-x-3 p-4 rounded-lg border ${getRecommendationBg(rec.type)}`}>
                <div className="flex-shrink-0 mt-0.5">
                  {getRecommendationIcon(rec.type)}
                </div>
                <div className="flex-1">
                  <h6 className="font-medium text-gray-900">{rec.title}</h6>
                  <p className="text-sm text-gray-700 mt-1">{rec.description}</p>
                  <div className="mt-2">
                    <span className={getRecommendationBadge(rec.type, rec.impact)}>
                      {rec.type === "success" ? rec.impact : `${rec.type.toUpperCase()} Impact: ${rec.impact}`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced SEO Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <MetaTagsAnalysis metaTags={results.metaTags} />
        <HeadingStructureAnalysis headingStructure={results.headingStructure} />
      </div>

      {/* Technical Analysis */}
      <div className="mb-8">
        <TechnicalAnalysis 
          technicalHeaders={results.technicalHeaders}
          imageOptimization={results.imageOptimization}
          contentAnalysis={results.contentAnalysis}
          webAppFeatures={results.webAppFeatures}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
        <Button onClick={onNewAudit} className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700">
          <RotateCcw className="h-4 w-4" />
          <span>Re-run Audit</span>
        </Button>
        <Button variant="outline" className="flex items-center justify-center space-x-2 px-6 py-3">
          <Share className="h-4 w-4" />
          <span>Share Results</span>
        </Button>
      </div>
    </div>
  );
}
