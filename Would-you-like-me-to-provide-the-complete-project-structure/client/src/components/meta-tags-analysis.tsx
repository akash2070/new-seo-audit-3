import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle, Eye, Share2, Globe } from "@/components/icons";
import type { AuditResponse } from "@shared/schema";

interface MetaTagsAnalysisProps {
  metaTags: AuditResponse['metaTags'];
}

export function MetaTagsAnalysis({ metaTags }: MetaTagsAnalysisProps) {
  const getOptimizationStatus = (isOptimal: boolean, value: string | null) => {
    if (!value) return { icon: XCircle, color: "text-red-500", status: "Missing" };
    if (isOptimal) return { icon: CheckCircle, color: "text-green-500", status: "Optimal" };
    return { icon: AlertTriangle, color: "text-yellow-500", status: "Needs Improvement" };
  };

  const titleStatus = getOptimizationStatus(metaTags.titleOptimal, metaTags.title);
  const descStatus = getOptimizationStatus(metaTags.descriptionOptimal, metaTags.description);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Meta Tags Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Title Analysis */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">Title Tag</span>
            <div className="flex items-center gap-2">
              <titleStatus.icon className={`h-4 w-4 ${titleStatus.color}`} />
              <Badge variant={titleStatus.status === "Optimal" ? "default" : "secondary"}>
                {titleStatus.status}
              </Badge>
            </div>
          </div>
          {metaTags.title ? (
            <div className="space-y-1">
              <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                "{metaTags.title}"
              </p>
              <p className="text-xs text-gray-500">
                Length: {metaTags.titleLength} characters (Optimal: 30-60)
              </p>
            </div>
          ) : (
            <p className="text-sm text-red-600 dark:text-red-400">No title tag found</p>
          )}
        </div>

        {/* Description Analysis */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">Meta Description</span>
            <div className="flex items-center gap-2">
              <descStatus.icon className={`h-4 w-4 ${descStatus.color}`} />
              <Badge variant={descStatus.status === "Optimal" ? "default" : "secondary"}>
                {descStatus.status}
              </Badge>
            </div>
          </div>
          {metaTags.description ? (
            <div className="space-y-1">
              <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                "{metaTags.description}"
              </p>
              <p className="text-xs text-gray-500">
                Length: {metaTags.descriptionLength} characters (Optimal: 120-160)
              </p>
            </div>
          ) : (
            <p className="text-sm text-red-600 dark:text-red-400">No meta description found</p>
          )}
        </div>

        {/* Social Media Tags */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Social Media Tags
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <span className="text-sm font-medium">Open Graph</span>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  {metaTags.ogTitle ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-500" />
                  )}
                  <span>og:title {metaTags.ogTitle ? "✓" : "✗"}</span>
                </div>
                <div className="flex items-center gap-2">
                  {metaTags.ogDescription ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-500" />
                  )}
                  <span>og:description {metaTags.ogDescription ? "✓" : "✗"}</span>
                </div>
                <div className="flex items-center gap-2">
                  {metaTags.ogImage ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-500" />
                  )}
                  <span>og:image {metaTags.ogImage ? "✓" : "✗"}</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-sm font-medium">Twitter Cards</span>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  {metaTags.twitterCard ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-500" />
                  )}
                  <span>twitter:card {metaTags.twitterCard ? "✓" : "✗"}</span>
                </div>
                <div className="flex items-center gap-2">
                  {metaTags.twitterSite ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-500" />
                  )}
                  <span>twitter:site {metaTags.twitterSite ? "✓" : "✗"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Tags */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Technical Tags
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center gap-2">
              {metaTags.viewport ? (
                <CheckCircle className="h-3 w-3 text-green-500" />
              ) : (
                <XCircle className="h-3 w-3 text-red-500" />
              )}
              <span>Viewport</span>
            </div>
            <div className="flex items-center gap-2">
              {metaTags.canonical ? (
                <CheckCircle className="h-3 w-3 text-green-500" />
              ) : (
                <XCircle className="h-3 w-3 text-red-500" />
              )}
              <span>Canonical</span>
            </div>
            <div className="flex items-center gap-2">
              {metaTags.language ? (
                <CheckCircle className="h-3 w-3 text-green-500" />
              ) : (
                <XCircle className="h-3 w-3 text-red-500" />
              )}
              <span>Language</span>
            </div>
            <div className="flex items-center gap-2">
              {metaTags.charset ? (
                <CheckCircle className="h-3 w-3 text-green-500" />
              ) : (
                <XCircle className="h-3 w-3 text-red-500" />
              )}
              <span>Charset</span>
            </div>
          </div>
        </div>

        {/* Overall Score */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="font-medium">Overall Meta Tags Score</span>
            <Badge variant={metaTags.hasAllRequiredTags ? "default" : "secondary"}>
              {metaTags.hasAllRequiredTags ? "Complete" : "Incomplete"}
            </Badge>
          </div>
          {!metaTags.hasAllRequiredTags && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Ensure all required meta tags are present for optimal SEO performance.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}