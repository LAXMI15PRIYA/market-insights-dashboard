import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Stock analysis server function.
 *
 * Mirrors the original Python (yfinance) notebook 1:1:
 *   - Fetches ticker info: longName, currentPrice, previousClose, currency
 *   - Downloads historical OHLCV between [start, end] with interval=1d
 *   - Computes 7-day and 30-day rolling moving averages on Close
 *   - Computes price change and percent change vs previous close
 *
 * We call the same Yahoo Finance endpoints yfinance uses under the hood
 * (query1.finance.yahoo.com/v8/finance/chart + /v1/finance/search).
 * No third-party stock API is used.
 */

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const InputSchema = z.object({
  symbol: z.string().trim().min(1).max(20),
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type StockAnalysisInput = z.infer<typeof InputSchema>;

export interface OHLCPoint {
  date: string; // YYYY-MM-DD
  timestamp: number; // ms
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  volume: number | null;
  ma7: number | null;
  ma30: number | null;
  dailyReturn: number | null; // (close/prevClose - 1)
}

export interface StockAnalysis {
  symbol: string;
  longName: string;
  currency: string;
  exchange: string;
  currentPrice: number | null;
  previousClose: number | null;
  change: number | null;
  changePercent: number | null;
  latestOpen: number | null;
  latestHigh: number | null;
  latestLow: number | null;
  latestVolume: number | null;
  marketCap: number | null;
  series: OHLCPoint[];
}

// Pandas .rolling(window=n).mean() — returns null for the first n-1 points.
function rollingMean(values: (number | null)[], window: number): (number | null)[] {
  const out: (number | null)[] = new Array(values.length).fill(null);
  let sum = 0;
  let count = 0;
  const buf: (number | null)[] = [];
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    buf.push(v);
    if (v != null) {
      sum += v;
      count++;
    }
    if (buf.length > window) {
      const removed = buf.shift();
      if (removed != null) {
        sum -= removed;
        count--;
      }
    }
    if (buf.length === window && count === window) {
      out[i] = sum / window;
    }
  }
  return out;
}

async function yahooFetch(url: string): Promise<Response> {
  return fetch(url, {
    headers: {
      "User-Agent": UA,
      Accept: "application/json,text/plain,*/*",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });
}

async function fetchLongName(symbol: string): Promise<string> {
  try {
    const res = await yahooFetch(
      `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(
        symbol,
      )}&quotesCount=1&newsCount=0`,
    );
    if (!res.ok) return symbol;
    const json = (await res.json()) as {
      quotes?: Array<{ symbol?: string; longname?: string; shortname?: string }>;
    };
    const q = json.quotes?.find((x) => x.symbol?.toUpperCase() === symbol.toUpperCase()) ?? json.quotes?.[0];
    return q?.longname ?? q?.shortname ?? symbol;
  } catch {
    return symbol;
  }
}

async function fetchMarketCap(symbol: string): Promise<number | null> {
  try {
    const res = await yahooFetch(
      `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbol)}`,
    );
    if (!res.ok) return null;
    const json = (await res.json()) as {
      quoteResponse?: { result?: Array<{ marketCap?: number }> };
    };
    return json.quoteResponse?.result?.[0]?.marketCap ?? null;
  } catch {
    return null;
  }
}

export const getStockAnalysis = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<StockAnalysis> => {
    const symbol = data.symbol.toUpperCase();
    const startTs = Math.floor(new Date(`${data.start}T00:00:00Z`).getTime() / 1000);
    const endTs = Math.floor(new Date(`${data.end}T23:59:59Z`).getTime() / 1000);

    if (!Number.isFinite(startTs) || !Number.isFinite(endTs) || endTs <= startTs) {
      throw new Error("Invalid date range");
    }

    const chartUrl =
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}` +
      `?period1=${startTs}&period2=${endTs}&interval=1d&includePrePost=false&events=div%2Csplit`;

    const chartRes = await yahooFetch(chartUrl);
    if (!chartRes.ok) {
      throw new Error(`Unable to fetch stock data (HTTP ${chartRes.status})`);
    }
    const chartJson = (await chartRes.json()) as {
      chart?: {
        error?: { code?: string; description?: string } | null;
        result?: Array<{
          meta?: {
            currency?: string;
            symbol?: string;
            exchangeName?: string;
            regularMarketPrice?: number;
            chartPreviousClose?: number;
            previousClose?: number;
          };
          timestamp?: number[];
          indicators?: {
            quote?: Array<{
              open?: (number | null)[];
              high?: (number | null)[];
              low?: (number | null)[];
              close?: (number | null)[];
              volume?: (number | null)[];
            }>;
          };
        }>;
      };
    };

    if (chartJson.chart?.error) {
      throw new Error(chartJson.chart.error.description || "Invalid symbol");
    }
    const result = chartJson.chart?.result?.[0];
    if (!result || !result.timestamp || !result.indicators?.quote?.[0]) {
      throw new Error("No stock data available for this symbol / date range");
    }

    const ts = result.timestamp;
    const q = result.indicators.quote[0];
    const closes = (q.close ?? []).map((v) => (v == null ? null : Number(v)));
    const opens = (q.open ?? []).map((v) => (v == null ? null : Number(v)));
    const highs = (q.high ?? []).map((v) => (v == null ? null : Number(v)));
    const lows = (q.low ?? []).map((v) => (v == null ? null : Number(v)));
    const vols = (q.volume ?? []).map((v) => (v == null ? null : Number(v)));

    const ma7 = rollingMean(closes, 7);
    const ma30 = rollingMean(closes, 30);

    const series: OHLCPoint[] = ts.map((t, i) => {
      const prev = i > 0 ? closes[i - 1] : null;
      const c = closes[i];
      const dailyReturn = prev != null && prev !== 0 && c != null ? c / prev - 1 : null;
      const d = new Date(t * 1000);
      return {
        date: d.toISOString().slice(0, 10),
        timestamp: t * 1000,
        open: opens[i] ?? null,
        high: highs[i] ?? null,
        low: lows[i] ?? null,
        close: c ?? null,
        volume: vols[i] ?? null,
        ma7: ma7[i],
        ma30: ma30[i],
        dailyReturn,
      };
    });

    // Latest / previous close (skip nulls, match yfinance semantics)
    const validCloses = series.filter((p) => p.close != null);
    const last = validCloses[validCloses.length - 1] ?? null;
    const prev = validCloses[validCloses.length - 2] ?? null;

    const meta = result.meta ?? {};
    const currentPrice = meta.regularMarketPrice ?? last?.close ?? null;
    const previousClose = meta.chartPreviousClose ?? meta.previousClose ?? prev?.close ?? null;
    const change =
      currentPrice != null && previousClose != null ? currentPrice - previousClose : null;
    const changePercent =
      change != null && previousClose ? (change / previousClose) * 100 : null;

    const [longName, marketCap] = await Promise.all([
      fetchLongName(symbol),
      fetchMarketCap(symbol),
    ]);

    return {
      symbol: meta.symbol ?? symbol,
      longName,
      currency: meta.currency ?? "",
      exchange: meta.exchangeName ?? "",
      currentPrice,
      previousClose,
      change,
      changePercent,
      latestOpen: last?.open ?? null,
      latestHigh: last?.high ?? null,
      latestLow: last?.low ?? null,
      latestVolume: last?.volume ?? null,
      marketCap,
      series,
    };
  });
