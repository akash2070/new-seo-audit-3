import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Globe, Star, Plus, Calendar, Activity } from 'lucide-react';
import type { Website, AuditResponse } from '@shared/schema';

interface DashboardStats {
  totalWebsites: number;
  totalAudits: number;
  averageScore: number;
  recentActivity: Array<{
    id: number;
    websiteName: string;
    score: number;
    date: string;
    improvement: number;
  }>;
}

interface TrendData {
  date: string;
  score: number;
  performance: number;
  seo: number;
  accessibility: number;
}

export function Dashboard() {
  const [selectedWebsite, setSelectedWebsite] = useState<number | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const { data: websites = [], isLoading: websitesLoading } = useQuery({
    queryKey: ['/api/websites'],
    enabled: true,
  });

  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    enabled: true,
  });

  const { data: trendData = [], isLoading: trendsLoading } = useQuery({
    queryKey: ['/api/dashboard/trends', selectedWebsite, timeRange],
    enabled: selectedWebsite !== null,
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['/api/websites/favorites'],
    enabled: true,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
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

  if (websitesLoading || statsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">SEO Dashboard</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SEO Dashboard</h1>
          <p className="text-muted-foreground">Monitor and analyze your website performance</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Website
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Websites</p>
                <p className="text-2xl font-bold">{dashboardStats?.totalWebsites || 0}</p>
              </div>
              <Globe className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Audits</p>
                <p className="text-2xl font-bold">{dashboardStats?.totalAudits || 0}</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(dashboardStats?.averageScore || 0)}`}>
                  {dashboardStats?.averageScore || 0}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Favorites</p>
                <p className="text-2xl font-bold">{favorites.length}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="websites">Websites</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest audit results from your websites</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardStats?.recentActivity?.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{activity.websiteName}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(activity.date)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getScoreBadgeVariant(activity.score)}>
                          {activity.score}
                        </Badge>
                        {activity.improvement !== 0 && (
                          <div className="flex items-center text-sm">
                            {activity.improvement > 0 ? (
                              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                            )}
                            <span className={activity.improvement > 0 ? 'text-green-600' : 'text-red-600'}>
                              {Math.abs(activity.improvement)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )) || (
                    <p className="text-center text-muted-foreground py-8">
                      No recent activity. Add a website to get started.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Distribution</CardTitle>
                <CardDescription>Score distribution across all websites</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Excellent (90-100)</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={30} className="w-20" />
                      <span className="text-sm font-medium">30%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Good (70-89)</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={45} className="w-20" />
                      <span className="text-sm font-medium">45%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Needs Work (0-69)</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={25} className="w-20" />
                      <span className="text-sm font-medium">25%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="websites" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Websites</CardTitle>
              <CardDescription>Manage and monitor all your websites</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {websites.map((website: Website) => (
                  <Card key={website.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-medium truncate">{website.name}</h3>
                          <p className="text-sm text-muted-foreground truncate">{website.url}</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Star className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {website.category && (
                        <Badge variant="outline" className="mb-2">
                          {website.category}
                        </Badge>
                      )}
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Last audit: {website.lastAuditAt ? formatDate(website.lastAuditAt) : 'Never'}
                        </span>
                        <Button variant="outline" size="sm">
                          Audit Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {websites.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No websites yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Add your first website to start monitoring its SEO performance
                    </p>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Website
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Performance Trends</h2>
              <p className="text-muted-foreground">Track your SEO performance over time</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={timeRange === '7d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('7d')}
              >
                7 Days
              </Button>
              <Button
                variant={timeRange === '30d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('30d')}
              >
                30 Days
              </Button>
              <Button
                variant={timeRange === '90d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('90d')}
              >
                90 Days
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Score Trends</CardTitle>
              <CardDescription>
                {selectedWebsite ? 'Selected website performance' : 'Select a website to view trends'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedWebsite && trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={formatDate} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="performance" stroke="#82ca9d" strokeWidth={2} />
                    <Line type="monotone" dataKey="seo" stroke="#ffc658" strokeWidth={2} />
                    <Line type="monotone" dataKey="accessibility" stroke="#ff7300" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {selectedWebsite 
                      ? 'No trend data available for this website'
                      : 'Select a website from the list above to view performance trends'
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Website Comparison</CardTitle>
              <CardDescription>Compare performance across your websites</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Comparison Analysis</h3>
                <p className="text-muted-foreground mb-4">
                  Compare SEO performance between multiple websites
                </p>
                <Button variant="outline">
                  Select Websites to Compare
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}