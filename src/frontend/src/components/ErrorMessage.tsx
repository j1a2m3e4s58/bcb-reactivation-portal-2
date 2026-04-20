import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

interface ErrorMessageProps {
  title?: string;
  message: string;
  className?: string;
}

export function ErrorMessage({
  title = "Something went wrong",
  message,
  className,
}: ErrorMessageProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm",
        className,
      )}
      role="alert"
      data-ocid="error_state"
    >
      <AlertCircle
        className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0"
        aria-hidden="true"
      />
      <div className="min-w-0">
        <p className="font-semibold text-destructive">{title}</p>
        <p className="text-destructive/80 mt-0.5 break-words">{message}</p>
      </div>
    </div>
  );
}
