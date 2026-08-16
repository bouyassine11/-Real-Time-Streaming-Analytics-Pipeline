import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useChartTheme } from "../hooks/useChartTheme";

interface CategoryRow {
  category: string;
  view_count: string;
  purchase_count: string;
  total_revenue: string;
}

export default function TopCategoriesChart({ data }: { data: CategoryRow[] }) {
  const theme = useChartTheme();

  if (!data.length) {
    return <p className="text-center py-10" style={{ color: "var(--color-text-muted)" }}>Waiting for data...</p>;
  }

  const chartData = data.map((d) => ({
    name: d.category.charAt(0).toUpperCase() + d.category.slice(1),
    views: parseInt(d.view_count),
    purchases: parseInt(d.purchase_count),
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.gridColor} vertical={false} />
        <XAxis dataKey="name" tick={{ fill: theme.textColor, fontSize: 11 }} axisLine={false} tickLine={false} />
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
        />
        <Legend wrapperStyle={{ fontSize: 12, color: theme.labelColor }} iconType="circle" iconSize={8} />
        <Bar dataKey="views" fill={theme.colors.cyan} radius={[6, 6, 0, 0]} maxBarSize={32} />
        <Bar dataKey="purchases" fill={theme.colors.green} radius={[6, 6, 0, 0]} maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  );
}
