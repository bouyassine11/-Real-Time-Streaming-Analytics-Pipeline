import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useChartTheme, EVENT_COLORS, EVENT_COLORS_LIGHT } from "../hooks/useChartTheme";

interface EpmRow {
  window_start: string;
  event_type: string;
  event_count: string;
}

export default function EventsPerMinuteChart({ data }: { data: EpmRow[] }) {
  const theme = useChartTheme();

  if (!data.length) {
    return <p className="text-center py-10" style={{ color: "var(--color-text-muted)" }}>Waiting for data...</p>;
  }

  const eventTypes = [...new Set(data.map((d) => d.event_type))];
  const windows = [...new Set(data.map((d) => d.window_start))].sort();

  const chartData = windows.map((ws) => {
    const row: Record<string, string> = { time: new Date(ws).toLocaleTimeString() };
    eventTypes.forEach((et) => {
      const match = data.find((d) => d.window_start === ws && d.event_type === et);
      row[et] = match ? match.event_count : "0";
    });
    return row;
  });

  const colorMap = theme.isDark ? EVENT_COLORS : EVENT_COLORS_LIGHT;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
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
        />
        <Legend
          wrapperStyle={{ fontSize: 12, color: theme.labelColor }}
          iconType="circle"
          iconSize={8}
        />
        {eventTypes.map((et) => (
          <Line
            key={et}
            type="monotone"
            dataKey={et}
            stroke={colorMap[et] || "#6b7280"}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
