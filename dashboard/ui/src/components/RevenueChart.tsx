import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useChartTheme } from "../hooks/useChartTheme";

interface RevenueRow {
  window_start: string;
  total_revenue: string;
  purchase_count: string;
  avg_order_value: string;
}

export default function RevenueChart({ data }: { data: RevenueRow[] }) {
  const theme = useChartTheme();

  if (!data.length) {
    return <p className="text-center py-10" style={{ color: "var(--color-text-muted)" }}>Waiting for data...</p>;
  }

  const chartData = [...data].reverse().map((d) => ({
    time: new Date(d.window_start).toLocaleTimeString(),
    revenue: parseFloat(d.total_revenue),
    avgOrder: parseFloat(d.avg_order_value),
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f59e0b" stopOpacity={theme.isDark ? 0.3 : 0.2} />
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.gridColor} vertical={false} />
        <XAxis dataKey="time" tick={{ fill: theme.textColor, fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: theme.textColor, fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: theme.tooltipBg,
            border: `1px solid ${theme.tooltipBorder}`,
            borderRadius: "12px",
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
          }}
          labelStyle={{ color: theme.tooltipLabel, fontWeight: 600 }}
          itemStyle={{ color: theme.tooltipText, fontSize: 13 }}
          formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#f59e0b"
          strokeWidth={2.5}
          fill="url(#revenueGradient)"
          dot={false}
          activeDot={{ r: 5, strokeWidth: 2, stroke: "#f59e0b", fill: theme.tooltipBg }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
