import { useState, forwardRef, useImperativeHandle, useRef } from "react";
import { Search, CalendarIcon, Loader2, TrendingUp } from "lucide-react";
import { format, subYears } from "date-fns";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface SearchValues {
  symbol: string;
  start: Date;
  end: Date;
}

interface SearchPanelProps {
  onAnalyze: (v: SearchValues) => void;
  loading: boolean;
}

export interface SearchPanelHandle {
  focus: () => void;
}

export const SearchPanel = forwardRef<SearchPanelHandle, SearchPanelProps>(
  function SearchPanel({ onAnalyze, loading }, ref) {
    const inputRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => ({ focus: () => inputRef.current?.focus() }));

    const today = new Date();
    const [symbol, setSymbol] = useState("");
    const [start, setStart] = useState<Date>(subYears(today, 1));
    const [end, setEnd] = useState<Date>(today);
    const [localError, setLocalError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const s = symbol.trim().toUpperCase();
      if (!s) return setLocalError("Please enter a stock symbol.");
      if (end < start) return setLocalError("End date must be after start date.");
      setLocalError(null);
      onAnalyze({ symbol: s, start, end });
    };

    return (
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mx-auto -mt-12 max-w-6xl px-4 sm:-mt-16 sm:px-6 lg:px-8"
      >
        <div className="glass-card rounded-2xl p-5 shadow-elegant sm:p-7">
          <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr_auto] lg:items-end">
            <div>
              <Label htmlFor="symbol" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Stock Symbol
              </Label>
              <div className="relative mt-1.5">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="symbol"
                  ref={inputRef}
                  autoComplete="off"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  placeholder="AAPL, MSFT, GOOG, TSLA, TCS.NS, INFY.NS, RELIANCE.NS"
                  className="h-11 pl-9 text-base font-medium uppercase tracking-wide"
                />
              </div>
            </div>

            <DateField label="Start Date" value={start} onChange={setStart} max={end} />
            <DateField label="End Date" value={end} onChange={setEnd} min={start} />

            <Button
              type="submit"
              disabled={loading}
              size="lg"
              className="group relative h-11 overflow-hidden gradient-primary text-primary-foreground shadow-elegant transition-all hover:scale-[1.02] hover:shadow-glow disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing…
                </>
              ) : (
                <>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Analyze
                </>
              )}
            </Button>
          </form>

          {localError && (
            <p className="mt-3 text-sm font-medium text-destructive">{localError}</p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-muted-foreground">
            <span>
              <strong className="text-foreground">Indian stocks:</strong> use <code className="rounded bg-muted px-1.5 py-0.5">.NS</code> — e.g. TCS.NS, INFY.NS, RELIANCE.NS
            </span>
            <span>
              <strong className="text-foreground">International:</strong> plain ticker — e.g. AAPL, MSFT, TSLA, GOOG
            </span>
          </div>
        </div>
      </motion.section>
    );
  },
);

function DateField({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: Date;
  onChange: (d: Date) => void;
  min?: Date;
  max?: Date;
}) {
  return (
    <div>
      <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "mt-1.5 h-11 w-full justify-start text-left font-normal",
              !value && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "PPP") : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(d) => d && onChange(d)}
            disabled={(d) =>
              (min ? d < min : false) || (max ? d > max : false) || d > new Date()
            }
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
