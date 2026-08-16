import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useChartTheme } from "../hooks/useChartTheme";

interface DeviceRow {
  device: string;
  event_count: string;
}

const DEVICE_ICONS: Record<string, string> = {
  desktop: "Desktop",
  mobile: "Mobile",
  tablet: "Tablet",
};

const COLORS = ["#06b6d4", "#8b5cf6", "#f59e0b"];

const RADIAN = Math.PI / 180;

function renderLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return percent > 0.05 ? (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  ) : null;
}

export default function DeviceBreakdown({ data }: { data: DeviceRow[] }) {
  const theme = useChartTheme();

  if (!data.length) {
    return <p className="text-center py-10" style={{ color: "var(--color-text-muted)" }}>Waiting for data...</p>;
  }

  const chartData = data.map((d) => ({
    name: DEVICE_ICONS[d.device] || d.device,
    value: parseInt(d.event_count),
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={5}
          dataKey="value"
          labelLine={false}
          label={renderLabel}
          stroke="none"
        >
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
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
        <Legend
          wrapperStyle={{ fontSize: 12, color: theme.labelColor }}
          iconType="circle"
          iconSize={8}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
