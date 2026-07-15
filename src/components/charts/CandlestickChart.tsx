import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import type { OHLCPoint } from "@/lib/stocks.functions";

interface Props {
  data: OHLCPoint[];
  currency?: string;
}

function readCssVar(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

/**
 * Client-only ApexCharts candlestick.
 * Lazy-loaded from Dashboard behind <ClientOnly /> so Apex never runs on SSR.
 */
export default function CandlestickChart({ data }: Props) {
  const [isDark, setIsDark] = useState<boolean>(
    typeof document !== "undefined" && document.documentElement.classList.contains("dark"),
  );

  useEffect(() => {
    const obs = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const series = [
    {
      name: "OHLC",
      data: data
        .filter((d) => d.open != null && d.high != null && d.low != null && d.close != null)
        .map((d) => ({
          x: new Date(d.timestamp),
          y: [d.open as number, d.high as number, d.low as number, d.close as number],
        })),
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: "candlestick",
      background: "transparent",
      toolbar: { show: true, tools: { download: false } },
      zoom: { enabled: true },
      animations: { enabled: true, speed: 500 },
      foreColor: readCssVar("--color-muted-foreground", "#64748b"),
    },
    theme: { mode: isDark ? "dark" : "light" },
    grid: { borderColor: readCssVar("--color-border", "#e5e7eb"), strokeDashArray: 3 },
    xaxis: { type: "datetime", labels: { style: { colors: readCssVar("--color-muted-foreground", "#64748b") } } },
    yaxis: {
      tooltip: { enabled: true },
      labels: {
        formatter: (v: number) => v?.toLocaleString(undefined, { maximumFractionDigits: 2 }) ?? "",
        style: { colors: readCssVar("--color-muted-foreground", "#64748b") },
      },
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: readCssVar("--color-chart-3", "#10b981"),
          downward: readCssVar("--color-chart-4", "#ef4444"),
        },
        wick: { useFillColor: true },
      },
    },
    tooltip: { theme: isDark ? "dark" : "light" },
  };

  return (
    <div className="h-full w-full">
      <Chart options={options} series={series} type="candlestick" height="100%" />
    </div>
  );
}
