import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: "default" | "shimmer" | "tactical";
}

function Skeleton({ className, variant = "shimmer", ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "bg-white/5 relative overflow-hidden",
        variant === "shimmer" && "after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_2s_infinite] after:bg-gradient-to-r after:from-transparent after:via-white/10 after:to-transparent",
        variant === "tactical" && "border border-white/5",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
