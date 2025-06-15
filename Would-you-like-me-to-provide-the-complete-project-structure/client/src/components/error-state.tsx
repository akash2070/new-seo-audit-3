import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "@/components/icons";

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Card className="p-8 mb-8 border-red-200 animate-fade-in">
        <CardContent className="p-0">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Audit Failed
            </h3>
            <p className="text-gray-600 mb-6">{message}</p>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-red-800 mb-2">Common Issues:</h4>
              <ul className="text-sm text-red-700 space-y-1 text-left">
                <li>• URL is not accessible or returns an error</li>
                <li>• Website blocks automated scanning</li>
                <li>• Invalid URL format</li>
                <li>• Network timeout or connectivity issues</li>
              </ul>
            </div>
            
            <Button
              onClick={onRetry}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700"
            >
              Try Different URL
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
