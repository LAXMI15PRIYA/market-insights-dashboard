import { LineChart as LineIcon, Search } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { motion } from "framer-motion";

interface HeaderProps {
  onSearchShortcut?: () => void;
}

export function Header({ onSearchShortcut }: HeaderProps) {
  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/70 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary shadow-glow">
            <LineIcon className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight sm:text-base">
              Stock Price Analyzer
            </div>
            <div className="hidden text-[11px] text-muted-foreground sm:block">
              Yahoo Finance market intelligence
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSearchShortcut}
            className="hidden items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground transition hover:bg-muted sm:flex"
          >
            <Search className="h-3.5 w-3.5" />
            Search symbol
            <kbd className="ml-2 rounded border border-border bg-background/70 px-1.5 py-0.5 font-mono text-[10px]">
              /
            </kbd>
          </button>
          <ThemeToggle />
        </div>
      </div>
    </motion.header>
  );
}
