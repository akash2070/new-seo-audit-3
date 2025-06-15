import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Download, Play, Pause, RotateCcw, FileText, AlertCircle, CheckCircle, Clock } from '@/components/icons';
import { apiRequest } from '@/lib/queryClient';

interface BulkAnalysisResult {
  url: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  overallScore?: number;
  performance?: number;
  seo?: number;
  accessibility?: number;
  bestPractices?: number;
  error?: string;
  completedAt?: string;
}

interface BulkAnalysisJob {
  id: string;
  urls: string[];
  status: 'pending' | 'running' | 'completed' | 'paused' | 'failed';
  progress: number;
  results: BulkAnalysisResult[];
  startedAt: string;
  estimatedTimeRemaining?: number;
}

export function BulkAnalysis() {
  const [urls, setUrls] = useState<string>('');
  const [currentJob, setCurrentJob] = useState<BulkAnalysisJob | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bulkAnalysisMutation = useMutation({
    mutationFn: async (urlList: string[]) => {
      return apiRequest('/api/audit/bulk', 'POST', { urls: urlList });
    },
    onSuccess: (job: BulkAnalysisJob) => {
      setCurrentJob(job);
      startPolling(job.id);
    },
  });

  const startPolling = (jobId: string) => {
    const interval = setInterval(async () => {
      try {
        const updatedJob = await apiRequest(`/api/audit/bulk/${jobId}`, 'GET');
        setCurrentJob(updatedJob);
        
        if (updatedJob.status === 'completed' || updatedJob.status === 'failed') {
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Polling error:', error);
        clearInterval(interval);
      }
    }, 2000);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const lines = content.split('\n').filter(line => line.trim());
      setUrls(lines.join('\n'));
    };
    reader.readAsText(file);
  };

  const parseUrls = (urlString: string): string[] => {
    return urlString
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0)
      .filter(url => {
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      });
  };

  const startBulkAnalysis = () => {
    const urlList = parseUrls(urls);
    if (urlList.length === 0) {
      alert('Please enter valid URLs');
      return;
    }
    if (urlList.length > 100) {
      alert('Maximum 100 URLs allowed per batch');
      return;
    }
    
    bulkAnalysisMutation.mutate(urlList);
  };

  const pauseAnalysis = async () => {
    if (!currentJob) return;
    
    try {
      await apiRequest(`/api/audit/bulk/${currentJob.id}/pause`, 'POST');
      setIsPaused(true);
    } catch (error) {
      console.error('Failed to pause analysis:', error);
    }
  };

  const resumeAnalysis = async () => {
    if (!currentJob) return;
    
    try {
      await apiRequest(`/api/audit/bulk/${currentJob.id}/resume`, 'POST');
      setIsPaused(false);
    } catch (error) {
      console.error('Failed to resume analysis:', error);
    }
  };

  const cancelAnalysis = async () => {
    if (!currentJob) return;
    
    try {
      await apiRequest(`/api/audit/bulk/${currentJob.id}/cancel`, 'POST');
      setCurrentJob(null);
      setIsPaused(false);
    } catch (error) {
      console.error('Failed to cancel analysis:', error);
    }
  };

  const exportResults = () => {
    if (!currentJob?.results.length) return;

    const csvContent = [
      ['URL', 'Status', 'Overall Score', 'Performance', 'SEO', 'Accessibility', 'Best Practices', 'Error'],
      ...currentJob.results.map(result => [
        result.url,
        result.status,
        result.overallScore?.toString() || '',
        result.performance?.toString() || '',
        result.seo?.toString() || '',
        result.accessibility?.toString() || '',
        result.bestPractices?.toString() || '',
        result.error || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seo-audit-bulk-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return 'default' as const;
    if (score >= 70) return 'secondary' as const;
    return 'destructive' as const;
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Bulk URL Analysis</h2>
          <p className="text-muted-foreground">Analyze multiple websites simultaneously</p>
        </div>
      </div>

      <Tabs defaultValue="setup" className="space-y-6">
        <TabsList>
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="progress" disabled={!currentJob}>Progress</TabsTrigger>
          <TabsTrigger value="results" disabled={!currentJob?.results.length}>Results</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>URL Input</CardTitle>
              <CardDescription>
                Enter URLs to analyze (one per line) or upload a CSV file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-2"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload CSV</span>
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <span className="text-sm text-muted-foreground">
                  or paste URLs below
                </span>
              </div>

              <Textarea
                placeholder="https://example1.com&#10;https://example2.com&#10;https://example3.com"
                value={urls}
                onChange={(e) => setUrls(e.target.value)}
                rows={10}
                className="font-mono text-sm"
              />

              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {parseUrls(urls).length} valid URLs detected (max 100)
                </div>
                <Button
                  onClick={startBulkAnalysis}
                  disabled={bulkAnalysisMutation.isPending || parseUrls(urls).length === 0}
                  className="flex items-center space-x-2"
                >
                  <Play className="h-4 w-4" />
                  <span>Start Analysis</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analysis Options</CardTitle>
              <CardDescription>Configure your bulk analysis settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Device Type</label>
                  <div className="flex space-x-2">
                    <Badge variant="default">Mobile</Badge>
                    <Badge variant="outline">Desktop</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Concurrent Requests</label>
                  <Input type="number" value={3} min={1} max={5} className="w-20" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Delay Between Requests</label>
                  <div className="flex items-center space-x-2">
                    <Input type="number" value={2} min={0} max={10} className="w-20" />
                    <span className="text-sm text-muted-foreground">seconds</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Retry Failed URLs</label>
                  <div className="flex items-center space-x-2">
                    <Input type="number" value={1} min={0} max={3} className="w-20" />
                    <span className="text-sm text-muted-foreground">times</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          {currentJob && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Analysis Progress</span>
                    <div className="flex items-center space-x-2">
                      {currentJob.status === 'running' && !isPaused && (
                        <Button variant="outline" size="sm" onClick={pauseAnalysis}>
                          <Pause className="h-4 w-4 mr-2" />
                          Pause
                        </Button>
                      )}
                      {isPaused && (
                        <Button variant="outline" size="sm" onClick={resumeAnalysis}>
                          <Play className="h-4 w-4 mr-2" />
                          Resume
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={cancelAnalysis}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    {currentJob.results.filter(r => r.status === 'completed').length} of{' '}
                    {currentJob.urls.length} URLs completed
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.round(currentJob.progress)}%</span>
                    </div>
                    <Progress value={currentJob.progress} className="w-full" />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <Badge 
                        variant={currentJob.status === 'completed' ? 'default' : 'secondary'}
                        className="ml-2"
                      >
                        {currentJob.status}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Started:</span>
                      <span className="ml-2">
                        {new Date(currentJob.startedAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Remaining:</span>
                      <span className="ml-2">
                        {currentJob.estimatedTimeRemaining 
                          ? formatTime(currentJob.estimatedTimeRemaining)
                          : 'Calculating...'
                        }
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Failed:</span>
                      <span className="ml-2 text-red-600">
                        {currentJob.results.filter(r => r.status === 'failed').length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Real-time Results</CardTitle>
                  <CardDescription>Live updates as analysis completes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {currentJob.results.map((result, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3 flex-1">
                          {getStatusIcon(result.status)}
                          <span className="font-mono text-sm truncate">{result.url}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {result.overallScore && (
                            <Badge variant={getScoreBadgeVariant(result.overallScore)}>
                              {result.overallScore}
                            </Badge>
                          )}
                          {result.error && (
                            <Badge variant="destructive" className="text-xs">
                              Error
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {currentJob?.results.length > 0 && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Analysis Results</span>
                    <Button onClick={exportResults} className="flex items-center space-x-2">
                      <Download className="h-4 w-4" />
                      <span>Export CSV</span>
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Complete results for all analyzed URLs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>URL</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Overall</TableHead>
                        <TableHead>Performance</TableHead>
                        <TableHead>SEO</TableHead>
                        <TableHead>Accessibility</TableHead>
                        <TableHead>Best Practices</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentJob.results.map((result, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono text-sm max-w-xs truncate">
                            {result.url}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(result.status)}
                              <span className="capitalize">{result.status}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {result.overallScore && (
                              <Badge variant={getScoreBadgeVariant(result.overallScore)}>
                                {result.overallScore}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{result.performance || '-'}</TableCell>
                          <TableCell>{result.seo || '-'}</TableCell>
                          <TableCell>{result.accessibility || '-'}</TableCell>
                          <TableCell>{result.bestPractices || '-'}</TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                            {result.error || (result.completedAt ? 
                              `Completed at ${new Date(result.completedAt).toLocaleTimeString()}` : 
                              '-'
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Summary Statistics</CardTitle>
                  <CardDescription>Overview of your bulk analysis results</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {currentJob.results.filter(r => r.status === 'completed').length}
                      </div>
                      <p className="text-sm text-muted-foreground">Successful</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {currentJob.results.filter(r => r.status === 'failed').length}
                      </div>
                      <p className="text-sm text-muted-foreground">Failed</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.round(
                          currentJob.results
                            .filter(r => r.overallScore)
                            .reduce((sum, r) => sum + (r.overallScore || 0), 0) /
                          currentJob.results.filter(r => r.overallScore).length || 0
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">Avg Score</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {currentJob.results.filter(r => r.overallScore && r.overallScore >= 90).length}
                      </div>
                      <p className="text-sm text-muted-foreground">Excellent (90+)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}