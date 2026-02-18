import { ReactNode } from "react";
import { FileText, Inbox, Search, Users } from "lucide-react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  variant?: "default" | "search" | "list" | "users";
}

const variantIcons = {
  default: Inbox,
  search: Search,
  list: FileText,
  users: Users,
};

export function EmptyState({ icon, title, description, action, variant = "default" }: EmptyStateProps) {
  const Icon = variantIcons[variant];

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        {icon || <Icon className="w-8 h-8 text-muted-foreground" />}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
