import { AlertCircleIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function AlertDestructive({
  title = "Error",
  errorText = "Something went wrong",
}: {
  title?: string;
  errorText?: string;
}) {
  return (
    <Alert variant="destructive" className="max-w-md">
      <AlertCircleIcon />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{errorText}</AlertDescription>
    </Alert>
  );
}
