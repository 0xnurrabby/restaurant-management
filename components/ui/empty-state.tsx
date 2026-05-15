import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-4 text-center", className)}>
      {icon && (
        <div className="w-14 h-14 bg-[#f5f0e8] border-2 border-[#1a1a1a] rounded-2xl flex items-center justify-center mb-4 text-[#a8a29e]">
          {icon}
        </div>
      )}
      <h3 className="text-base font-black text-[#1a1a1a] mb-1">{title}</h3>
      {description && <p className="text-sm text-[#a8a29e] font-medium max-w-xs mb-4">{description}</p>}
      {action}
    </div>
  );
}
