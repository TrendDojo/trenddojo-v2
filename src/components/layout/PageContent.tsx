import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageContentProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function PageContent({ children, className, noPadding = false }: PageContentProps) {
  return (
    <div className={cn(
      "w-full",
      !noPadding && "px-8 pb-6 lg:pb-8"
    )}>
      <div className={cn(
        "w-full max-w-[1300px] mx-auto",
        className
      )}>
        {children}
      </div>
    </div>
  );
}