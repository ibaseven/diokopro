import { AlertCircle, CircleCheckBig } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface FeedbackType {
  type?: string;
  message?: string;
}

export function AlertFeedback({ type, message }: FeedbackType) {
  if (!message) return null;

  return (
    <Alert variant={type === "error" ? "destructive" : "success"}>
      {type === "error" ? (
        <AlertCircle className="h-4 w-4" />
      ) : (
        <CircleCheckBig className="h-4 w-4" />
      )}
      {/* <AlertTitle>Error</AlertTitle> */}
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
