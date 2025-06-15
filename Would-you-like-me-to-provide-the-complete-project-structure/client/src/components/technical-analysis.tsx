import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle, Shield, Server, Image, FileText } from "@/components/icons";
import type { AuditResponse } from "@shared/schema";

interface TechnicalAnalysisProps {
  technicalHeaders: AuditResponse['technicalHeaders'];
  imageOptimization: AuditResponse['imageOptimization'];
  contentAnalysis: AuditResponse['contentAnalysis'];
  webAppFeatures: AuditResponse['webAppFeatures'];
}

export function TechnicalAnalysis({ 
  technicalHeaders, 
  imageOptimization, 
  contentAnalysis, 
  webAppFeatures 
}: TechnicalAnalysisProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Security Headers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Headers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Content Security Policy</span>
              {technicalHeaders.contentSecurityPolicy ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">X-Frame-Options</span>
              {technicalHeaders.xFrameOptions ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">HSTS</span>
              {technicalHeaders.strictTransportSecurity ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Compression</span>
              {technicalHeaders.isCompressed ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
          </div>
          
          {technicalHeaders.serverInfo && (
            <div className="pt-3 border-t">
              <div className="flex items-center gap-2 mb-2">
                <Server className="h-4 w-4" />
                <span className="text-sm font-medium">Server Info</span>
              </div>
              <Badge variant="outline">{technicalHeaders.serverInfo}</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Optimization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Image Optimization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{imageOptimization.totalImages}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Images</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{imageOptimization.imagesWithoutAlt}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Missing Alt Text</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Images with Alt Text</span>
              <Badge variant={imageOptimization.imagesWithoutAlt === 0 ? "default" : "destructive"}>
                {imageOptimization.totalImages - imageOptimization.imagesWithoutAlt}/{imageOptimization.totalImages}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Modern Format Usage</span>
              <Badge variant={imageOptimization.suboptimalFormats === 0 ? "default" : "secondary"}>
                {imageOptimization.suboptimalFormats === 0 ? "Optimal" : `${imageOptimization.suboptimalFormats} to optimize`}
              </Badge>
            </div>
          </div>

          {imageOptimization.recommendations.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Recommendations</h4>
              {imageOptimization.recommendations.map((rec, index) => (
                <div key={index} className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                  {rec}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Content Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{contentAnalysis.wordCount}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Word Count</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{contentAnalysis.externalLinksCount}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">External Links</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Content Length</span>
              <Badge variant={!contentAnalysis.isThinContent ? "default" : "destructive"}>
                {contentAnalysis.isThinContent ? "Thin Content" : "Adequate"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Language Attribute</span>
              {contentAnalysis.hasLangAttribute ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">External Links with Nofollow</span>
              <Badge variant="outline">
                {contentAnalysis.externalLinksWithNofollow}/{contentAnalysis.externalLinksCount}
              </Badge>
            </div>
          </div>

          {contentAnalysis.recommendations.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Recommendations</h4>
              {contentAnalysis.recommendations.map((rec, index) => (
                <div key={index} className="text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
                  {rec}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Web App Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Web App Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              {webAppFeatures.hasFavicon ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">Favicon</span>
            </div>
            <div className="flex items-center gap-2">
              {webAppFeatures.hasManifest ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">Web Manifest</span>
            </div>
            <div className="flex items-center gap-2">
              {webAppFeatures.hasHreflang ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-gray-400" />
              )}
              <span className="text-sm">Hreflang</span>
            </div>
            <div className="flex items-center gap-2">
              {webAppFeatures.httpsRedirect ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              )}
              <span className="text-sm">HTTPS Redirect</span>
            </div>
          </div>

          {webAppFeatures.recommendations.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Recommendations</h4>
              {webAppFeatures.recommendations.map((rec, index) => (
                <div key={index} className="text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 p-2 rounded">
                  {rec}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}