import { motion } from "framer-motion";
import { LineChart, Search } from "lucide-react";

export function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto mt-16 max-w-2xl px-4 text-center sm:px-6 lg:px-8"
    >
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full gradient-primary shadow-glow">
        <LineChart className="h-11 w-11 text-primary-foreground" />
      </div>
      <h3 className="mt-6 text-2xl font-bold tracking-tight">
        Search a stock symbol to begin analysis
      </h3>
      <p className="mt-2 text-muted-foreground">
        Enter a ticker like <span className="font-mono font-semibold">AAPL</span>,{" "}
        <span className="font-mono font-semibold">TSLA</span>, or{" "}
        <span className="font-mono font-semibold">RELIANCE.NS</span> above and hit Analyze.
      </p>
      <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
        <Search className="h-3.5 w-3.5" />
        Data provided by Yahoo Finance
      </div>
    </motion.div>
  );
}
