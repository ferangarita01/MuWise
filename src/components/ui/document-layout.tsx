
import { cn } from "@/lib/utils"

export function DocumentLayout({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-background rounded-md w-full max-w-4xl mx-auto print:shadow-none print:rounded-none text-foreground",
        className
      )}
    >
      <div 
        className="p-1 md:p-2 lg:p-4 space-y-8"
      >
        {children}
      </div>
    </div>
  );
}
