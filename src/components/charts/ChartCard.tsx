import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function ChartCard({ title, subtitle, icon, children, className, delay = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      className={cn(
        "glass-card rounded-2xl p-5 shadow-card transition-shadow hover:shadow-elegant",
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {icon && (
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
              {icon}
            </span>
          )}
          <div>
            <h3 className="text-sm font-semibold sm:text-base">{title}</h3>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
      </div>
      <div className="h-72 w-full sm:h-80">{children}</div>
    </motion.div>
  );
}
