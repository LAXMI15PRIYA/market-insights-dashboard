import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn, ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense, useRef, useState } from "react";
import { format } from "date-fns";
import {
  Activity,
  BarChart3,
  CandlestickChart as CandlestickIcon,
  LineChart as LineIcon,
  Percent,
  TrendingUp,
} from "lucide-react";

import { getStockAnalysis, type StockAnalysis } from "@/lib/stocks.functions";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { SearchPanel, type SearchPanelHandle, type SearchValues } from "@/components/SearchPanel";
import { SummaryCards } from "@/components/SummaryCards";
import { EmptyState } from "@/components/EmptyState";
import { ErrorAlert } from "@/components/ErrorAlert";
import { DashboardSkeleton } from "@/components/DashboardSkeleton";
import { ChartCard } from "@/components/charts/ChartCard";
import {
  ClosingPriceChart,
  DailyReturnsChart,
  MovingAverageChart,
  VolumeChart,
} from "@/components/charts/RechartsCharts";
import { Skeleton } from "@/components/ui/skeleton";

// Apex loads client-side only (browser-only globals during module init).
const CandlestickChart = lazy(() => import("@/components/charts/CandlestickChart"));

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
  const searchRef = useRef<SearchPanelHandle>(null);
  const [lastSubmitted, setLastSubmitted] = useState<SearchValues | null>(null);

  const analyze = useServerFn(getStockAnalysis);
  const mutation = useMutation<StockAnalysis, Error, SearchValues>({
    mutationFn: async (v) =>
      analyze({
        data: {
          symbol: v.symbol,
          start: format(v.start, "yyyy-MM-dd"),
          end: format(v.end, "yyyy-MM-dd"),
        },
      }),
  });

  const onAnalyze = (v: SearchValues) => {
    setLastSubmitted(v);
    mutation.mutate(v);
  };

  const data = mutation.data;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header onSearchShortcut={() => searchRef.current?.focus()} />
      <Hero />

      <SearchPanel ref={searchRef} onAnalyze={onAnalyze} loading={mutation.isPending} />

      <main className="pb-20">
        {mutation.isPending && <DashboardSkeleton />}

        {!mutation.isPending && mutation.isError && (
          <ErrorAlert
            title="Unable to fetch stock data"
            message={
              mutation.error?.message?.includes("No stock data")
                ? "No data available for this symbol or date range. Try another ticker (e.g. AAPL, RELIANCE.NS) or a wider window."
                : mutation.error?.message?.includes("Invalid")
                  ? "That symbol looks invalid. International tickers use plain symbols (AAPL); Indian NSE tickers append .NS (TCS.NS)."
                  : (mutation.error?.message ?? "Unknown error contacting Yahoo Finance.")
            }
            onRetry={lastSubmitted ? () => mutation.mutate(lastSubmitted) : undefined}
          />
        )}

        {!mutation.isPending && !mutation.isError && !data && <EmptyState />}

        {!mutation.isPending && data && (
          <>
            <SummaryCards data={data} />

            <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
              <div className="grid gap-4 lg:grid-cols-2">
                <ChartCard
                  title="Closing Price Trend"
                  subtitle="Daily close over the selected range"
                  icon={<LineIcon className="h-4 w-4" />}
                  delay={0}
                >
                  <ClosingPriceChart data={data.series} currency={data.currency} />
                </ChartCard>

                <ChartCard
                  title="Candlestick (OHLC)"
                  subtitle="Interactive open · high · low · close"
                  icon={<CandlestickIcon className="h-4 w-4" />}
                  delay={0.05}
                >
                  <ClientOnly fallback={<Skeleton className="h-full w-full" />}>
                    <Suspense fallback={<Skeleton className="h-full w-full" />}>
                      <CandlestickChart data={data.series} currency={data.currency} />
                    </Suspense>
                  </ClientOnly>
                </ChartCard>

                <ChartCard
                  title="Moving Averages"
                  subtitle="Close · 7-day MA · 30-day MA"
                  icon={<TrendingUp className="h-4 w-4" />}
                  delay={0.1}
                >
                  <MovingAverageChart data={data.series} currency={data.currency} />
                </ChartCard>

                <ChartCard
                  title="Volume"
                  subtitle="Green = up day, red = down day"
                  icon={<BarChart3 className="h-4 w-4" />}
                  delay={0.15}
                >
                  <VolumeChart data={data.series} />
                </ChartCard>

                <ChartCard
                  title="Daily Returns"
                  subtitle="Percentage change vs. previous close"
                  icon={<Percent className="h-4 w-4" />}
                  className="lg:col-span-2"
                  delay={0.2}
                >
                  <DailyReturnsChart data={data.series} />
                </ChartCard>
              </div>
            </section>

            <section className="mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="glass-card rounded-2xl p-5 sm:p-6">
                <div className="mb-4 flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <Activity className="h-4 w-4" />
                  </span>
                  <h3 className="text-base font-semibold">Technical Snapshot</h3>
                </div>
                <TechnicalSnapshot data={data} />
              </div>
            </section>
          </>
        )}
      </main>

      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        Market data via Yahoo Finance. For research use only — not investment advice.
      </footer>
    </div>
  );
}

function TechnicalSnapshot({ data }: { data: StockAnalysis }) {
  const series = data.series.filter((p) => p.close != null);
  const last = series[series.length - 1];
  const ma7 = last?.ma7 ?? null;
  const ma30 = last?.ma30 ?? null;
  const close = last?.close ?? null;

  const trend =
    ma7 != null && ma30 != null
      ? ma7 > ma30
        ? { label: "Bullish", tone: "success" as const }
        : ma7 < ma30
          ? { label: "Bearish", tone: "danger" as const }
          : { label: "Neutral", tone: "default" as const }
      : { label: "—", tone: "default" as const };

  const priceVsMa30 =
    close != null && ma30 != null
      ? close > ma30
        ? "Price above 30-day MA"
        : "Price below 30-day MA"
      : "Insufficient history";

  const items = [
    {
      label: "Trend Signal",
      value: trend.label,
      tone: trend.tone,
      hint: "7-day vs 30-day MA crossover",
    },
    { label: "7-Day MA", value: ma7 != null ? ma7.toFixed(2) : "—", hint: `${data.currency}` },
    { label: "30-Day MA", value: ma30 != null ? ma30.toFixed(2) : "—", hint: `${data.currency}` },
    { label: "Momentum", value: priceVsMa30, hint: "Current close vs. baseline MA" },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((it) => (
        <div key={it.label} className="rounded-xl border border-border bg-background/40 p-4">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {it.label}
          </div>
          <div
            className={
              "mt-2 text-lg font-bold " +
              (it.tone === "success"
                ? "text-success"
                : it.tone === "danger"
                  ? "text-destructive"
                  : "")
            }
          >
            {it.value}
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground">{it.hint}</div>
        </div>
      ))}
    </div>
  );
}
