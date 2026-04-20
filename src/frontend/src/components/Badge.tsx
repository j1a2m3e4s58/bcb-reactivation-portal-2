import { cn } from "@/lib/utils";

type BadgeVariant =
  | "pending"
  | "activated"
  | "exported"
  | "dormant"
  | "success"
  | "warning"
  | "destructive";

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  pending: "badge-warning",
  activated: "badge-success",
  exported: "badge-success",
  dormant: "badge-warning",
  success: "badge-success",
  warning: "badge-warning",
  destructive: "badge-destructive",
};

export function StatusBadge({ variant, children, className }: BadgeProps) {
  return (
    <span className={cn(variantClasses[variant], className)}>{children}</span>
  );
}
