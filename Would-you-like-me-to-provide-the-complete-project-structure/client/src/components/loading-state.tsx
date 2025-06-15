import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock } from "@/components/icons";

export function LoadingState() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Card className="p-8 mb-8 animate-fade-in">
        <CardContent className="p-0">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Analyzing Your Website...
            </h3>
            <p className="text-gray-600 mb-6">
              This may take a few moments while we gather performance data
            </p>
            
            <div className="max-w-md mx-auto space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Fetching page data</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Running performance tests</span>
                <div className="animate-pulse w-4 h-4 bg-blue-200 rounded-full"></div>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>Analyzing SEO factors</span>
                <Clock className="h-4 w-4 text-gray-400" />
              </div>
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>Generating report</span>
                <Clock className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
