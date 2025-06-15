import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// Lightweight data visualization using CSS and HTML elements
import { Search, TrendingUp, Target, Hash, BookOpen, Eye } from '@/components/icons';

interface KeywordData {
  keyword: string;
  density: number;
  count: number;
  isOptimal: boolean;
  position?: number;
  difficulty?: string;
}

interface ContentQualityMetrics {
  readabilityScore: number;
  readingLevel: string;
  averageSentenceLength: number;
  contentFreshness: number;
  socialSharingOptimization: number;
  wordCount: number;
  uniqueWords: number;
  keywordDensityScore: number;
}

interface KeywordAnalysisProps {
  keywordData: KeywordData[];
  contentMetrics: ContentQualityMetrics;
  recommendedKeywords: string[];
}

export function KeywordAnalysis({ keywordData, contentMetrics, recommendedKeywords }: KeywordAnalysisProps) {
  const getKeywordColor = (density: number) => {
    if (density >= 1 && density <= 3) return '#22c55e'; // Green - optimal
    if (density >= 0.5 && density < 1) return '#f59e0b'; // Yellow - low
    if (density > 3 && density <= 5) return '#f59e0b'; // Yellow - high
    return '#ef4444'; // Red - too low or too high
  };

  const getReadabilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getReadabilityLabel = (score: number) => {
    if (score >= 90) return 'Very Easy';
    if (score >= 80) return 'Easy';
    if (score >= 70) return 'Fairly Easy';
    if (score >= 60) return 'Standard';
    if (score >= 50) return 'Fairly Difficult';
    if (score >= 30) return 'Difficult';
    return 'Very Difficult';
  };

  const densityDistribution = [
    { name: 'Optimal (1-3%)', value: keywordData.filter(k => k.density >= 1 && k.density <= 3).length, color: '#22c55e' },
    { name: 'Low (0.5-1%)', value: keywordData.filter(k => k.density >= 0.5 && k.density < 1).length, color: '#f59e0b' },
    { name: 'High (3-5%)', value: keywordData.filter(k => k.density > 3 && k.density <= 5).length, color: '#f59e0b' },
    { name: 'Poor (>5% or <0.5%)', value: keywordData.filter(k => k.density > 5 || k.density < 0.5).length, color: '#ef4444' },
  ];

  const topKeywords = keywordData
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const contentQualityData = [
    { metric: 'Readability', score: contentMetrics.readabilityScore, target: 80 },
    { metric: 'Content Freshness', score: contentMetrics.contentFreshness, target: 85 },
    { metric: 'Social Optimization', score: contentMetrics.socialSharingOptimization, target: 90 },
    { metric: 'Keyword Density', score: contentMetrics.keywordDensityScore, target: 75 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Keywords</p>
                <p className="text-2xl font-bold">{keywordData.length}</p>
              </div>
              <Hash className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Word Count</p>
                <p className="text-2xl font-bold">{contentMetrics.wordCount}</p>
              </div>
              <BookOpen className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Readability</p>
                <p className={`text-2xl font-bold ${getReadabilityColor(contentMetrics.readabilityScore)}`}>
                  {contentMetrics.readabilityScore}
                </p>
              </div>
              <Eye className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Sentence</p>
                <p className="text-2xl font-bold">{contentMetrics.averageSentenceLength}</p>
              </div>
              <Target className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="keywords" className="space-y-6">
        <TabsList>
          <TabsTrigger value="keywords">Keyword Analysis</TabsTrigger>
          <TabsTrigger value="content">Content Quality</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="keywords" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Keywords by Frequency</CardTitle>
                <CardDescription>Most frequently used keywords in your content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topKeywords.slice(0, 10).map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium truncate">{item.keyword}</span>
                        <span className="text-sm text-muted-foreground">{item.count}</span>
                      </div>
                      <Progress 
                        value={(item.count / Math.max(...topKeywords.map(k => k.count))) * 100} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Keyword Density Distribution</CardTitle>
                <CardDescription>Distribution of keyword density ranges</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {densityDistribution.map((item, index) => (
                    <div key={index} className="text-center p-4 rounded-lg border" style={{ backgroundColor: `${item.color}10` }}>
                      <div className="text-2xl font-bold" style={{ color: item.color }}>
                        {item.value}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {item.name}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Keyword Details</CardTitle>
              <CardDescription>Detailed analysis of all identified keywords</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {keywordData.map((keyword, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{keyword.keyword}</span>
                        {keyword.isOptimal && (
                          <Badge variant="default">Optimal</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Found {keyword.count} times
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{keyword.density.toFixed(2)}%</p>
                        <div className="w-20 h-2 bg-gray-200 rounded-full mt-1">
                          <div 
                            className="h-full rounded-full" 
                            style={{ 
                              width: `${Math.min(keyword.density * 20, 100)}%`,
                              backgroundColor: getKeywordColor(keyword.density)
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {keywordData.length === 0 && (
                  <div className="text-center py-8">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No keywords analyzed yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Quality Metrics</CardTitle>
                <CardDescription>Overall content quality assessment</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={contentQualityData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="metric" type="category" />
                    <Tooltip />
                    <Bar dataKey="score" fill="#3b82f6" />
                    <Bar dataKey="target" fill="#e5e7eb" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Readability Analysis</CardTitle>
                <CardDescription>Content readability and accessibility</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getReadabilityColor(contentMetrics.readabilityScore)}`}>
                    {contentMetrics.readabilityScore}
                  </div>
                  <p className="text-lg font-medium">{getReadabilityLabel(contentMetrics.readabilityScore)}</p>
                  <p className="text-sm text-muted-foreground">Flesch Reading Ease Score</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Reading Level:</span>
                    <span className="text-sm font-medium">{contentMetrics.readingLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg Sentence Length:</span>
                    <span className="text-sm font-medium">{contentMetrics.averageSentenceLength} words</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Unique Words:</span>
                    <span className="text-sm font-medium">{contentMetrics.uniqueWords}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Content Performance Scores</CardTitle>
              <CardDescription>Detailed breakdown of content metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Content Freshness</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={contentMetrics.contentFreshness} className="w-32" />
                    <span className="text-sm font-medium w-12">{contentMetrics.contentFreshness}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Social Sharing Optimization</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={contentMetrics.socialSharingOptimization} className="w-32" />
                    <span className="text-sm font-medium w-12">{contentMetrics.socialSharingOptimization}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Keyword Density Score</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={contentMetrics.keywordDensityScore} className="w-32" />
                    <span className="text-sm font-medium w-12">{contentMetrics.keywordDensityScore}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recommended Keywords</CardTitle>
                <CardDescription>Suggested keywords to improve SEO performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recommendedKeywords.map((keyword, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">{keyword}</span>
                      <Badge variant="outline">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Opportunity
                      </Badge>
                    </div>
                  ))}
                  
                  {recommendedKeywords.length === 0 && (
                    <div className="text-center py-8">
                      <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No keyword recommendations available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Improvement Tips</CardTitle>
                <CardDescription>Actionable suggestions to enhance your content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900">Readability</h4>
                    <p className="text-sm text-blue-700">
                      {contentMetrics.readabilityScore < 60 
                        ? 'Use shorter sentences and simpler words to improve readability.'
                        : 'Great readability score! Your content is easy to understand.'
                      }
                    </p>
                  </div>

                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-900">Word Count</h4>
                    <p className="text-sm text-green-700">
                      {contentMetrics.wordCount < 300 
                        ? 'Consider adding more content. Aim for at least 300 words for better SEO.'
                        : contentMetrics.wordCount > 2000
                        ? 'Consider breaking this into multiple pages or sections.'
                        : 'Good content length for SEO optimization.'
                      }
                    </p>
                  </div>

                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-medium text-yellow-900">Keyword Optimization</h4>
                    <p className="text-sm text-yellow-700">
                      {contentMetrics.keywordDensityScore < 50
                        ? 'Focus on including more relevant keywords naturally in your content.'
                        : 'Good keyword usage! Maintain natural keyword placement.'
                      }
                    </p>
                  </div>

                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <h4 className="font-medium text-purple-900">Social Sharing</h4>
                    <p className="text-sm text-purple-700">
                      {contentMetrics.socialSharingOptimization < 70
                        ? 'Add engaging headings, images, and meta descriptions for better social sharing.'
                        : 'Well optimized for social media sharing!'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}