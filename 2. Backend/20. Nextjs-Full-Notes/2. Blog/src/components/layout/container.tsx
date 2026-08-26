// Plain Server Component - a layout helper with no interactivity, used
// e.g. by src/app/post/edit/[slug]/page.tsx instead of the raw
// `<div className="max-w-4xl mx-auto">` pattern other pages use directly.
import { cn } from "@/lib/utils";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function Container({ children, className }: ContainerProps) {
  return (
    <div className={cn("container mx-auto px-4", className)}>{children}</div>
  );
}


