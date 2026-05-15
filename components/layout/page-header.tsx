import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between mb-6", className)}>
      <div>
        <div className="flex items-center gap-2 mb-0.5">
          <div className="w-1.5 h-5 bg-[#ff6b6b] border border-[#1a1a1a] rounded-full" />
          <h1 className="text-xl font-black text-[#1a1a1a] tracking-tight">{title}</h1>
        </div>
        {description && (
          <p className="text-sm text-[#a8a29e] font-medium ml-3.5">{description}</p>
        )}
      </div>
      {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
    </div>
  );
}
