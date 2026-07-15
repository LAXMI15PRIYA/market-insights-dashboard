import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  AreaChart,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import type { OHLCPoint } from "@/lib/stocks.functions";
import { format } from "date-fns";

const axisTick = { fill: "var(--color-muted-foreground)", fontSize: 11 };
const gridStroke = "var(--color-border)";

function formatDateShort(d: string) {
  const dt = new Date(d);
  return format(dt, "MMM d");
}

const tooltipContent = (
  props: { active?: boolean; payload?: Array<{ name?: string; value?: number; color?: string; dataKey?: string }>; label?: string },
  currency?: string,
) => {
  const { active, payload, label } = props;
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover/95 px-3 py-2 text-xs shadow-elegant backdrop-blur">
      <div className="mb-1 font-semibold">{label ? format(new Date(label), "PPP") : ""}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-medium">
            {typeof p.value === "number" ? p.value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : p.value}
            {currency ? ` ${currency}` : ""}
          </span>
        </div>
      ))}
    </div>
  );
};

interface CommonProps {
  data: OHLCPoint[];
  currency?: string;
}

export function ClosingPriceChart({ data, currency }: CommonProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="closeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.4} />
            <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
        <XAxis dataKey="date" tick={axisTick} tickFormatter={formatDateShort} minTickGap={40} />
        <YAxis tick={axisTick} domain={["auto", "auto"]} width={60} />
        <Tooltip content={(p) => tooltipContent(p as never, currency)} />
        <Area
          type="monotone"
          dataKey="close"
          name="Close"
          stroke="var(--color-chart-1)"
          fill="url(#closeGrad)"
          strokeWidth={2}
          isAnimationActive
          animationDuration={800}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function MovingAverageChart({ data, currency }: CommonProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
        <XAxis dataKey="date" tick={axisTick} tickFormatter={formatDateShort} minTickGap={40} />
        <YAxis tick={axisTick} domain={["auto", "auto"]} width={60} />
        <Tooltip content={(p) => tooltipContent(p as never, currency)} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line
          type="monotone"
          dataKey="close"
          name="Close"
          stroke="var(--color-chart-1)"
          strokeWidth={2}
          dot={false}
          isAnimationActive
          animationDuration={700}
        />
        <Line
          type="monotone"
          dataKey="ma7"
          name="7-Day MA"
          stroke="var(--color-chart-5)"
          strokeWidth={1.75}
          dot={false}
          isAnimationActive
          animationDuration={800}
        />
        <Line
          type="monotone"
          dataKey="ma30"
          name="30-Day MA"
          stroke="var(--color-chart-3)"
          strokeWidth={1.75}
          dot={false}
          isAnimationActive
          animationDuration={900}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function VolumeChart({ data }: CommonProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
        <XAxis dataKey="date" tick={axisTick} tickFormatter={formatDateShort} minTickGap={40} />
        <YAxis
          tick={axisTick}
          width={60}
          tickFormatter={(v: number) => {
            if (v >= 1e9) return (v / 1e9).toFixed(1) + "B";
            if (v >= 1e6) return (v / 1e6).toFixed(1) + "M";
            if (v >= 1e3) return (v / 1e3).toFixed(1) + "K";
            return String(v);
          }}
        />
        <Tooltip content={(p) => tooltipContent(p as never)} />
        <Bar dataKey="volume" name="Volume" isAnimationActive animationDuration={700}>
          {data.map((d, i) => {
            const prev = i > 0 ? data[i - 1].close : null;
            const up = prev != null && d.close != null && d.close >= prev;
            return (
              <Cell
                key={i}
                fill={up ? "var(--color-chart-3)" : "var(--color-chart-4)"}
                fillOpacity={0.75}
              />
            );
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DailyReturnsChart({ data }: CommonProps) {
  const pct = data.map((d) => ({ ...d, returnPct: d.dailyReturn != null ? d.dailyReturn * 100 : null }));
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={pct} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
        <XAxis dataKey="date" tick={axisTick} tickFormatter={formatDateShort} minTickGap={40} />
        <YAxis tick={axisTick} width={60} tickFormatter={(v: number) => `${v.toFixed(1)}%`} />
        <Tooltip
          content={(p) => {
            const { active, payload, label } = p as { active?: boolean; payload?: Array<{ value?: number; color?: string }>; label?: string };
            if (!active || !payload?.length) return null;
            const v = payload[0].value ?? 0;
            const pos = v >= 0;
            return (
              <div className="rounded-lg border border-border bg-popover/95 px-3 py-2 text-xs shadow-elegant backdrop-blur">
                <div className="mb-1 font-semibold">{label ? format(new Date(label), "PPP") : ""}</div>
                <div className={pos ? "text-success" : "text-destructive"}>
                  Daily Return: {v.toFixed(2)}%
                </div>
              </div>
            );
          }}
        />
        <Line
          type="monotone"
          dataKey="returnPct"
          name="Daily Return"
          stroke="var(--color-chart-2)"
          strokeWidth={1.75}
          dot={false}
          isAnimationActive
          animationDuration={800}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
