import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
// Lightweight SVG charts - no external dependencies
import { TrendingUp, TrendingDown, Users, Search, Globe, Plus, Minus, AlertCircle } from '@/components/icons';

interface CompetitorData {
  url: string;
  name: string;
  overallScore: number;
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  loadTime: number;
  mobileScore: number;
  industryRank?: number;
  marketShare?: number;
}

interface CompetitorInsights {
  industryBenchmark: number;
  yourPosition: number;
  totalCompetitors: number;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

interface CompetitorAnalysisProps {
  currentSite: {
    url: string;
    name: string;
    scores: CompetitorData;
  };
}

export function CompetitorAnalysis({ currentSite }: CompetitorAnalysisProps) {
  const [competitors, setCompetitors] = useState<string[]>([]);
  const [newCompetitorUrl, setNewCompetitorUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { data: competitorData = [], isLoading } = useQuery({
    queryKey: ['/api/competitors/analyze', competitors],
    enabled: competitors.length > 0,
  });

  const { data: insights } = useQuery({
    queryKey: ['/api/competitors/insights', currentSite.url],
    enabled: true,
  });

  const addCompetitor = async () => {
    if (!newCompetitorUrl.trim()) return;
    
    try {
      new URL(newCompetitorUrl);
      setCompetitors(prev => [...prev, newCompetitorUrl]);
      setNewCompetitorUrl('');
    } catch {
      alert('Please enter a valid URL');
    }
  };

  const removeCompetitor = (url: string) => {
    setCompetitors(prev => prev.filter(c => c !== url));
  };

  const analyzeAllCompetitors = async () => {
    setIsAnalyzing(true);
    // Trigger analysis
    setIsAnalyzing(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return 'default' as const;
    if (score >= 70) return 'secondary' as const;
    return 'destructive' as const;
  };

  const getComparisonIcon = (yourScore: number, competitorScore: number) => {
    if (yourScore > competitorScore) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (yourScore < competitorScore) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return <div className="h-4 w-4" />;
  };

  // Prepare radar chart data
  const radarData = [
    {
      subject: 'Performance',
      'Your Site': currentSite.scores.performance,
      'Average Competitor': competitorData.length > 0 
        ? competitorData.reduce((sum: number, comp: CompetitorData) => sum + comp.performance, 0) / competitorData.length 
        : 0,
    },
    {
      subject: 'SEO',
      'Your Site': currentSite.scores.seo,
      'Average Competitor': competitorData.length > 0 
        ? competitorData.reduce((sum: number, comp: CompetitorData) => sum + comp.seo, 0) / competitorData.length 
        : 0,
    },
    {
      subject: 'Accessibility',
      'Your Site': currentSite.scores.accessibility,
      'Average Competitor': competitorData.length > 0 
        ? competitorData.reduce((sum: number, comp: CompetitorData) => sum + comp.accessibility, 0) / competitorData.length 
        : 0,
    },
    {
      subject: 'Best Practices',
      'Your Site': currentSite.scores.bestPractices,
      'Average Competitor': competitorData.length > 0 
        ? competitorData.reduce((sum: number, comp: CompetitorData) => sum + comp.bestPractices, 0) / competitorData.length 
        : 0,
    },
  ];

  // Prepare comparison chart data
  const comparisonData = [
    { name: 'Your Site', ...currentSite.scores },
    ...competitorData.map((comp: CompetitorData, index: number) => ({
      name: `Competitor ${index + 1}`,
      ...comp,
    })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Competitor Analysis</h2>
          <p className="text-muted-foreground">Compare your SEO performance against competitors</p>
        </div>
        <Button onClick={analyzeAllCompetitors} disabled={isAnalyzing || competitors.length === 0}>
          {isAnalyzing ? 'Analyzing...' : 'Analyze All'}
        </Button>
      </div>

      {/* Add Competitors Section */}
      <Card>
        <CardHeader>
          <CardTitle>Add Competitors</CardTitle>
          <CardDescription>Enter competitor URLs to analyze and compare</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-4">
            <Input
              placeholder="https://competitor-website.com"
              value={newCompetitorUrl}
              onChange={(e) => setNewCompetitorUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCompetitor()}
            />
            <Button onClick={addCompetitor}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>

          <div className="space-y-2">
            {competitors.map((url, index) => (
              <div key={url} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline">Competitor {index + 1}</Badge>
                  <span className="font-medium">{url}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeCompetitor(url)}>
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {competitors.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4" />
                <p>No competitors added yet. Add competitor URLs to start analysis.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {competitors.length > 0 && (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="comparison">Detailed Comparison</TabsTrigger>
            <TabsTrigger value="insights">Strategic Insights</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Radar</CardTitle>
                  <CardDescription>Your site vs average competitor performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {radarData.map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{item.subject}</span>
                          <span className="font-medium">{item['Your Site']}%</span>
                        </div>
                        <Progress value={item['Your Site']} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Avg Competitor: {item['Average Competitor']}%</span>
                          {item['Your Site'] > item['Average Competitor'] ? (
                            <TrendingUp className="h-3 w-3 text-green-500" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Market Position</CardTitle>
                  <CardDescription>Your ranking in the competitive landscape</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-blue-600">
                        #{insights?.yourPosition || 'N/A'}
                      </div>
                      <p className="text-lg font-medium">Your Position</p>
                      <p className="text-sm text-muted-foreground">
                        Out of {insights?.totalCompetitors || 0} analyzed sites
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {insights?.industryBenchmark || 0}
                        </div>
                        <p className="text-sm text-muted-foreground">Industry Avg</p>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${getScoreColor(currentSite.scores.overallScore)}`}>
                          {currentSite.scores.overallScore}
                        </div>
                        <p className="text-sm text-muted-foreground">Your Score</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quick Comparison</CardTitle>
                <CardDescription>Side-by-side performance comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="overallScore" fill="#3b82f6" name="Overall Score" />
                    <Bar dataKey="performance" fill="#10b981" name="Performance" />
                    <Bar dataKey="seo" fill="#f59e0b" name="SEO" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Score Comparison</CardTitle>
                <CardDescription>Comprehensive performance breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Website</TableHead>
                      <TableHead>Overall</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead>SEO</TableHead>
                      <TableHead>Accessibility</TableHead>
                      <TableHead>Best Practices</TableHead>
                      <TableHead>Load Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="bg-blue-50">
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <Badge variant="default">Your Site</Badge>
                          <span>{currentSite.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getScoreBadgeVariant(currentSite.scores.overallScore)}>
                          {currentSite.scores.overallScore}
                        </Badge>
                      </TableCell>
                      <TableCell>{currentSite.scores.performance}</TableCell>
                      <TableCell>{currentSite.scores.seo}</TableCell>
                      <TableCell>{currentSite.scores.accessibility}</TableCell>
                      <TableCell>{currentSite.scores.bestPractices}</TableCell>
                      <TableCell>{currentSite.scores.loadTime}s</TableCell>
                    </TableRow>

                    {competitorData.map((competitor: CompetitorData, index: number) => (
                      <TableRow key={competitor.url}>
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">Competitor {index + 1}</Badge>
                            <span className="truncate max-w-xs">{competitor.name || competitor.url}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Badge variant={getScoreBadgeVariant(competitor.overallScore)}>
                              {competitor.overallScore}
                            </Badge>
                            {getComparisonIcon(currentSite.scores.overallScore, competitor.overallScore)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span>{competitor.performance}</span>
                            {getComparisonIcon(currentSite.scores.performance, competitor.performance)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span>{competitor.seo}</span>
                            {getComparisonIcon(currentSite.scores.seo, competitor.seo)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span>{competitor.accessibility}</span>
                            {getComparisonIcon(currentSite.scores.accessibility, competitor.accessibility)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span>{competitor.bestPractices}</span>
                            {getComparisonIcon(currentSite.scores.bestPractices, competitor.bestPractices)}
                          </div>
                        </TableCell>
                        <TableCell>{competitor.loadTime}s</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span>Strengths</span>
                  </CardTitle>
                  <CardDescription>Areas where you outperform competitors</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {insights?.strengths?.map((strength: string, index: number) => (
                      <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800">{strength}</p>
                      </div>
                    )) || (
                      <p className="text-muted-foreground">No specific strengths identified yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                    <span>Areas for Improvement</span>
                  </CardTitle>
                  <CardDescription>Where competitors are ahead</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {insights?.weaknesses?.map((weakness: string, index: number) => (
                      <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">{weakness}</p>
                      </div>
                    )) || (
                      <p className="text-muted-foreground">No specific weaknesses identified yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="opportunities" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Search className="h-5 w-5 text-blue-600" />
                    <span>Growth Opportunities</span>
                  </CardTitle>
                  <CardDescription>Potential areas for competitive advantage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {insights?.opportunities?.map((opportunity: string, index: number) => (
                      <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">{opportunity}</p>
                      </div>
                    )) || (
                      <p className="text-muted-foreground">Analyzing opportunities...</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    <span>Competitive Threats</span>
                  </CardTitle>
                  <CardDescription>Monitor these competitor advantages</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {insights?.threats?.map((threat: string, index: number) => (
                      <div key={index} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <p className="text-sm text-orange-800">{threat}</p>
                      </div>
                    )) || (
                      <p className="text-muted-foreground">No immediate threats identified.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}