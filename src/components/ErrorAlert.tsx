import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorAlert({ title = "Unable to fetch stock data", message, onRetry }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto mt-8 max-w-3xl px-4 sm:px-6 lg:px-8"
    >
      <div className="glass-card rounded-2xl border-destructive/40 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-destructive/15 text-destructive">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{message}</p>
            {onRetry && (
              <Button onClick={onRetry} variant="outline" size="sm" className="mt-4">
                <RefreshCw className="mr-2 h-3.5 w-3.5" />
                Try again
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
