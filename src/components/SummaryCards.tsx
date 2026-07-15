import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Building2,
  Layers,
  Landmark,
} from "lucide-react";
import type { StockAnalysis } from "@/lib/stocks.functions";
import { cn } from "@/lib/utils";

interface Props {
  data: StockAnalysis;
}

function fmtNum(v: number | null | undefined, digits = 2): string {
  if (v == null || !Number.isFinite(v)) return "—";
  return v.toLocaleString(undefined, { maximumFractionDigits: digits, minimumFractionDigits: digits });
}
function fmtInt(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return "—";
  return Math.round(v).toLocaleString();
}
function fmtCompact(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return "—";
  const abs = Math.abs(v);
  if (abs >= 1e12) return (v / 1e12).toFixed(2) + "T";
  if (abs >= 1e9) return (v / 1e9).toFixed(2) + "B";
  if (abs >= 1e6) return (v / 1e6).toFixed(2) + "M";
  if (abs >= 1e3) return (v / 1e3).toFixed(2) + "K";
  return v.toString();
}

export function SummaryCards({ data }: Props) {
  const positive = (data.change ?? 0) >= 0;
  const cur = data.currency || "";

  const cards: Array<{
    icon: React.ReactNode;
    label: string;
    value: string;
    sub?: string;
    tone?: "success" | "danger" | "default";
  }> = [
    {
      icon: <DollarSign className="h-4 w-4" />,
      label: "Latest Close",
      value: `${fmtNum(data.currentPrice)} ${cur}`,
      sub: `Prev: ${fmtNum(data.previousClose)}`,
    },
    {
      icon: positive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />,
      label: "Change",
      value: `${data.change != null ? (data.change >= 0 ? "+" : "") + fmtNum(data.change) : "—"}`,
      sub:
        data.changePercent != null
          ? `${data.changePercent >= 0 ? "+" : ""}${fmtNum(data.changePercent)}%`
          : undefined,
      tone: positive ? "success" : "danger",
    },
    {
      icon: <TrendingUp className="h-4 w-4" />,
      label: "Open",
      value: fmtNum(data.latestOpen),
    },
    {
      icon: <TrendingUp className="h-4 w-4" />,
      label: "High",
      value: fmtNum(data.latestHigh),
      tone: "success",
    },
    {
      icon: <TrendingDown className="h-4 w-4" />,
      label: "Low",
      value: fmtNum(data.latestLow),
      tone: "danger",
    },
    {
      icon: <Activity className="h-4 w-4" />,
      label: "Volume",
      value: fmtInt(data.latestVolume),
    },
    {
      icon: <Layers className="h-4 w-4" />,
      label: "Market Cap",
      value: data.marketCap != null ? `${fmtCompact(data.marketCap)} ${cur}` : "—",
    },
    {
      icon: <Landmark className="h-4 w-4" />,
      label: "Exchange",
      value: data.exchange || "—",
      sub: data.currency ? `Currency: ${data.currency}` : undefined,
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-5 flex flex-wrap items-end justify-between gap-3"
      >
        <div>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <Building2 className="h-3.5 w-3.5" />
            Company
          </div>
          <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            {data.longName}
          </h2>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <BarChart3 className="h-3.5 w-3.5" />
            <span className="font-mono font-semibold text-foreground">{data.symbol}</span>
            {data.exchange && <span>· {data.exchange}</span>}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Current Price</div>
          <div className="mt-1 text-3xl font-bold sm:text-4xl">
            {fmtNum(data.currentPrice)} <span className="text-base font-medium text-muted-foreground">{cur}</span>
          </div>
          <div
            className={cn(
              "mt-1 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-sm font-semibold",
              positive ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive",
            )}
          >
            {positive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            {data.change != null ? (data.change >= 0 ? "+" : "") + fmtNum(data.change) : "—"}
            {data.changePercent != null && (
              <span>({data.changePercent >= 0 ? "+" : ""}{fmtNum(data.changePercent)}%)</span>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 * i }}
            whileHover={{ y: -3 }}
            className="glass-card rounded-xl p-4 transition-shadow hover:shadow-elegant"
          >
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-md",
                  c.tone === "success" && "bg-success/15 text-success",
                  c.tone === "danger" && "bg-destructive/15 text-destructive",
                  (!c.tone || c.tone === "default") && "bg-primary/15 text-primary",
                )}
              >
                {c.icon}
              </span>
              {c.label}
            </div>
            <div
              className={cn(
                "mt-2 text-xl font-bold tracking-tight sm:text-2xl",
                c.tone === "success" && "text-success",
                c.tone === "danger" && "text-destructive",
              )}
            >
              {c.value}
            </div>
            {c.sub && <div className="mt-0.5 text-xs text-muted-foreground">{c.sub}</div>}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
