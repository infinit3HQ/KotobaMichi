import { AlertCircle, RotateCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/atoms/alert";
import { Button } from "@/components/atoms/button";

/** Destructive alert for a failed request, with an optional retry button. */
export function QueryError({
  title,
  description,
  onRetry,
  retryLabel,
}: {
  title: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  return (
    <Alert variant="destructive">
      <AlertCircle />
      <AlertTitle>{title}</AlertTitle>
      {description || onRetry ? (
        <AlertDescription>
          {description ? <p>{description}</p> : null}
          {onRetry ? (
            <Button variant="outline" size="sm" className="mt-2" onClick={onRetry}>
              <RotateCw />
              {retryLabel}
            </Button>
          ) : null}
        </AlertDescription>
      ) : null}
    </Alert>
  );
}
