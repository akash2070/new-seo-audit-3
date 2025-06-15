import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { AuditForm } from "@/components/audit-form";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { AuditResults } from "@/components/audit-results";
import { Dashboard } from "@/components/dashboard/dashboard";
import { KeywordAnalysis } from "@/components/keyword-analysis";
import { CompetitorAnalysis } from "@/components/competitor-analysis";
import { BulkAnalysis } from "@/components/bulk-analysis";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, BarChart3, Users, Package, Target, Zap, TrendingUp, Globe, Star, Clock, Shield } from "@/components/icons";
import type { AuditRequest, AuditResponse } from "@shared/schema";

type ViewState = "form" | "loading" | "results" | "error";

export default function Home() {
  const [viewState, setViewState] = useState<ViewState>("form");
  const [auditResults, setAuditResults] = useState<AuditResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeTab, setActiveTab] = useState<string>("quick-audit");

  const auditMutation = useMutation({
    mutationFn: async (data: AuditRequest) => {
      const response = await apiRequest("POST", "/api/audit", data);
      return await response.json();
    },
    onSuccess: (data: AuditResponse) => {
      setAuditResults(data);
      setViewState("results");
    },
    onError: (error: Error) => {
      setErrorMessage(error.message || "An unexpected error occurred");
      setViewState("error");
    },
  });

  const handleAuditSubmit = (url: string) => {
    setViewState("loading");
    auditMutation.mutate({ url });
  };

  const handleRetry = () => {
    setViewState("form");
    setErrorMessage("");
    setAuditResults(null);
  };

  const handleNewAudit = () => {
    setViewState("form");
    setAuditResults(null);
    setErrorMessage("");
  };

  // Mock data for keyword analysis demo
  const mockKeywordData = [
    { keyword: "SEO audit", density: 2.5, count: 15, isOptimal: true },
    { keyword: "website analysis", density: 1.8, count: 12, isOptimal: true },
    { keyword: "performance optimization", density: 3.2, count: 8, isOptimal: true },
    { keyword: "technical SEO", density: 1.2, count: 6, isOptimal: false },
    { keyword: "page speed", density: 0.8, count: 4, isOptimal: false },
  ];

  const mockContentMetrics = {
    readabilityScore: 75,
    readingLevel: "College Level",
    averageSentenceLength: 18,
    contentFreshness: 85,
    socialSharingOptimization: 70,
    wordCount: 1250,
    uniqueWords: 450,
    keywordDensityScore: 82,
  };

  const mockRecommendedKeywords = [
    "SEO tools",
    "website optimization", 
    "search rankings",
    "digital marketing",
    "content strategy"
  ];

  const mockCurrentSite = {
    url: "https://example.com",
    name: "Your Website",
    scores: {
      url: "https://example.com",
      name: "Your Website",
      overallScore: 85,
      performance: 88,
      accessibility: 92,
      bestPractices: 85,
      seo: 90,
      loadTime: 2.3,
      mobileScore: 87,
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Professional SEO Analysis Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive website auditing, competitor analysis, keyword research, and bulk processing for professional SEO optimization
          </p>
        </header>

        {/* Platform Features Overview */}
        <section className="mb-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
            Professional SEO Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-blue-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <Search className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Instant Audits</h3>
                <p className="text-sm text-gray-600">Lightning-fast comprehensive SEO analysis</p>
              </CardContent>
            </Card>
            
            <Card className="border-green-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <BarChart3 className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Analytics Dashboard</h3>
                <p className="text-sm text-gray-600">Track performance trends over time</p>
              </CardContent>
            </Card>
            
            <Card className="border-purple-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Competitor Analysis</h3>
                <p className="text-sm text-gray-600">Compare against industry leaders</p>
              </CardContent>
            </Card>
            
            <Card className="border-orange-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <Package className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Bulk Processing</h3>
                <p className="text-sm text-gray-600">Analyze hundreds of URLs at once</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Main Platform Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-4xl grid-cols-5 h-12">
              <TabsTrigger value="quick-audit" className="flex items-center space-x-2">
                <Search className="h-4 w-4" />
                <span>Quick Audit</span>
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="keyword-analysis" className="flex items-center space-x-2">
                <Target className="h-4 w-4" />
                <span>Keywords</span>
              </TabsTrigger>
              <TabsTrigger value="competitor-analysis" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Competitors</span>
              </TabsTrigger>
              <TabsTrigger value="bulk-analysis" className="flex items-center space-x-2">
                <Package className="h-4 w-4" />
                <span>Bulk Analysis</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="quick-audit" className="space-y-6">
            <div className="max-w-4xl mx-auto">
              {viewState === "form" && (
                <>
                  <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-blue-50">
                    <CardHeader className="text-center pb-4">
                      <CardTitle className="text-2xl">Instant SEO Analysis</CardTitle>
                      <CardDescription className="text-lg">
                        Get comprehensive SEO insights in seconds
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="px-8 pb-8">
                      <AuditForm onSubmit={handleAuditSubmit} isLoading={auditMutation.isPending} />
                    </CardContent>
                  </Card>
                  
                  {/* Enhanced Feature Grid */}
                  <section className="mt-12">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
                      Why Choose Our SEO Analysis Platform
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
                        <CardContent className="p-8">
                          <div className="flex items-center mb-4">
                            <Zap className="h-10 w-10 text-blue-600 mr-4" />
                            <h3 className="text-xl font-bold">Lightning Fast Analysis</h3>
                          </div>
                          <p className="text-gray-700 leading-relaxed">
                            Advanced caching and optimization deliver comprehensive SEO analysis in under 30 seconds with real-time performance metrics and detailed technical insights.
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
                        <CardContent className="p-8">
                          <div className="flex items-center mb-4">
                            <TrendingUp className="h-10 w-10 text-green-600 mr-4" />
                            <h3 className="text-xl font-bold">Actionable SEO Insights</h3>
                          </div>
                          <p className="text-gray-700 leading-relaxed">
                            Prioritized recommendations with step-by-step implementation guides, ROI estimates, and industry benchmarking for measurable SEO improvements.
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
                        <CardContent className="p-8">
                          <div className="flex items-center mb-4">
                            <Shield className="h-10 w-10 text-purple-600 mr-4" />
                            <h3 className="text-xl font-bold">Enterprise Grade SEO Tools</h3>
                          </div>
                          <p className="text-gray-700 leading-relaxed">
                            Professional-level analysis based on latest Google guidelines, Core Web Vitals, and advanced technical SEO factors for enterprise websites.
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </section>

                  {/* Platform Stats */}
                  <Card className="mt-12 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
                    <CardContent className="p-8">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div>
                          <div className="text-3xl font-bold text-blue-400 mb-2">50K+</div>
                          <p className="text-gray-300">Websites Analyzed</p>
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-green-400 mb-2">98%</div>
                          <p className="text-gray-300">Accuracy Rate</p>
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-purple-400 mb-2">25s</div>
                          <p className="text-gray-300">Average Analysis Time</p>
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-orange-400 mb-2">24/7</div>
                          <p className="text-gray-300">Always Available</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {viewState === "loading" && <LoadingState />}

              {viewState === "results" && auditResults && (
                <AuditResults results={auditResults} onNewAudit={handleNewAudit} />
              )}

              {viewState === "error" && (
                <ErrorState message={errorMessage} onRetry={handleRetry} />
              )}
            </div>
          </TabsContent>

          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>

          <TabsContent value="keyword-analysis">
            <KeywordAnalysis 
              keywordData={mockKeywordData}
              contentMetrics={mockContentMetrics}
              recommendedKeywords={mockRecommendedKeywords}
            />
          </TabsContent>

          <TabsContent value="competitor-analysis">
            <CompetitorAnalysis currentSite={mockCurrentSite} />
          </TabsContent>

          <TabsContent value="bulk-analysis">
            <BulkAnalysis />
          </TabsContent>
        </Tabs>

        {/* Enhanced Footer */}
        <footer className="bg-gray-900 text-white mt-20 rounded-2xl">
          <div className="px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-2">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <Search className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xl font-bold">Professional SEO Platform</span>
                </div>
                <p className="text-gray-400 leading-relaxed max-w-md">
                  Comprehensive SEO analysis platform built for agencies, developers, and marketing professionals who demand enterprise-level insights.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Features</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>Instant SEO Audits</li>
                  <li>Competitor Analysis</li>
                  <li>Keyword Research</li>
                  <li>Bulk Processing</li>
                  <li>Historical Tracking</li>
                  <li>PDF Reports</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Technology</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>Google PageSpeed Insights</li>
                  <li>Core Web Vitals</li>
                  <li>Technical SEO Analysis</li>
                  <li>Real-time Processing</li>
                  <li>Advanced Algorithms</li>
                  <li>Cloud Infrastructure</li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2024 Professional SEO Platform. Built with cutting-edge technology.
              </p>
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-gray-400">Trusted by 10,000+ professionals</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
