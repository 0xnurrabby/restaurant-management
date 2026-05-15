import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center",
        className
      )}
    >
      {icon && (
        <div className="p-4 bg-stone-100 rounded-2xl mb-4 text-stone-400">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-stone-900 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-stone-500 max-w-xs mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}
