import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <img src="../../../public/favicon.ico" className="h-8 w-8"/>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark className="h-9 w-9" />
      <span className="font-display text-xl font-bold tracking-tight">tokeni</span>
    </div>
  );
}
