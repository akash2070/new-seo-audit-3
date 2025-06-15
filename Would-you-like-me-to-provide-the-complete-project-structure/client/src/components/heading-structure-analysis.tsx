import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle, Hash, List } from "@/components/icons";
import type { AuditResponse } from "@shared/schema";

interface HeadingStructureAnalysisProps {
  headingStructure: AuditResponse['headingStructure'];
}

export function HeadingStructureAnalysis({ headingStructure }: HeadingStructureAnalysisProps) {
  const getStatusColor = (hasIssue: boolean) => {
    return hasIssue ? "text-red-500" : "text-green-500";
  };

  const getStatusIcon = (hasIssue: boolean) => {
    return hasIssue ? XCircle : CheckCircle;
  };

  const totalHeadings = headingStructure.h1Count + headingStructure.h2Count + 
                       headingStructure.h3Count + headingStructure.h4Count + 
                       headingStructure.h5Count + headingStructure.h6Count;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="h-5 w-5" />
          Heading Structure Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{totalHeadings}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Headings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{headingStructure.h1Count}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">H1 Tags</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{headingStructure.h2Count}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">H2 Tags</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{headingStructure.h3Count + headingStructure.h4Count + headingStructure.h5Count + headingStructure.h6Count}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">H3-H6 Tags</div>
          </div>
        </div>

        {/* Heading Distribution */}
        <div className="space-y-3">
          <h4 className="font-medium">Heading Distribution</h4>
          <div className="space-y-2">
            {[
              { level: 'H1', count: headingStructure.h1Count },
              { level: 'H2', count: headingStructure.h2Count },
              { level: 'H3', count: headingStructure.h3Count },
              { level: 'H4', count: headingStructure.h4Count },
              { level: 'H5', count: headingStructure.h5Count },
              { level: 'H6', count: headingStructure.h6Count },
            ].map(({ level, count }) => (
              <div key={level} className="flex items-center gap-3">
                <span className="w-8 text-sm font-medium">{level}</span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: totalHeadings > 0 ? `${(count / Math.max(totalHeadings, 10)) * 100}%` : '0%' }}
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* H1 Content Analysis */}
        {headingStructure.h1Text.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">H1 Content</h4>
            <div className="space-y-2">
              {headingStructure.h1Text.map((text, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-sm">
                  "{text}"
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SEO Issues */}
        <div className="space-y-3">
          <h4 className="font-medium">SEO Assessment</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {headingStructure.hasH1 ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">H1 tag present</span>
              <Badge variant={headingStructure.hasH1 ? "default" : "destructive"}>
                {headingStructure.hasH1 ? "Pass" : "Fail"}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              {!headingStructure.multipleH1 ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">Single H1 tag</span>
              <Badge variant={!headingStructure.multipleH1 ? "default" : "destructive"}>
                {!headingStructure.multipleH1 ? "Pass" : "Fail"}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              {headingStructure.properHierarchy ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">Proper heading hierarchy</span>
              <Badge variant={headingStructure.properHierarchy ? "default" : "destructive"}>
                {headingStructure.properHierarchy ? "Pass" : "Fail"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Missing Levels */}
        {headingStructure.missingLevels.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-yellow-600 dark:text-yellow-400">Missing Heading Levels</h4>
            <div className="flex flex-wrap gap-2">
              {headingStructure.missingLevels.map((level) => (
                <Badge key={level} variant="outline" className="text-yellow-600 border-yellow-600">
                  {level}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {headingStructure.recommendations.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <List className="h-4 w-4" />
              Recommendations
            </h4>
            <div className="space-y-2">
              {headingStructure.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-blue-800 dark:text-blue-200">{recommendation}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Overall Score */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="font-medium">Heading Structure Score</span>
            <Badge variant={
              headingStructure.hasH1 && !headingStructure.multipleH1 && headingStructure.properHierarchy 
                ? "default" 
                : "destructive"
            }>
              {headingStructure.hasH1 && !headingStructure.multipleH1 && headingStructure.properHierarchy 
                ? "Excellent" 
                : "Needs Improvement"}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {headingStructure.hasH1 && !headingStructure.multipleH1 && headingStructure.properHierarchy
              ? "Your heading structure follows SEO best practices."
              : "Optimize your heading structure for better SEO and accessibility."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}