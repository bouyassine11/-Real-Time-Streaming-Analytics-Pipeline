import { useTheme } from "../context/ThemeContext";

interface FunnelRow {
  stage: string;
  user_count: string;
}

const STAGE_CONFIG: Record<string, { label: string; gradient: string; icon: React.ReactNode }> = {
  page_view: {
    label: "Page Views",
    gradient: "from-cyan-500 to-blue-500",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  add_to_cart: {
    label: "Add to Cart",
    gradient: "from-violet-500 to-purple-500",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    ),
  },
  purchase: {
    label: "Purchase",
    gradient: "from-emerald-500 to-green-400",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
};

export default function ConversionFunnel({ data }: { data: FunnelRow[] }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (!data.length) {
    return <p className="text-center py-10" style={{ color: "var(--color-text-muted)" }}>Waiting for data...</p>;
  }

  const maxCount = Math.max(...data.map((d) => parseInt(d.user_count)), 1);
  const totalViews = parseInt(data.find((d) => d.stage === "page_view")?.user_count || "0") || 1;

  return (
    <div className="flex flex-col gap-4 py-2">
      {data.map((row, index) => {
        const count = parseInt(row.user_count);
        const widthPct = Math.max((count / maxCount) * 100, 8);
        const conversionRate = ((count / totalViews) * 100).toFixed(1);
        const config = STAGE_CONFIG[row.stage] || { label: row.stage, gradient: "from-gray-500 to-gray-400", icon: null };

        return (
          <div key={row.stage} className="group">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white shadow-sm`}>
                  {config.icon}
                </div>
                <span className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                  {config.label}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold tabular-nums" style={{ color: "var(--color-text-primary)" }}>
                  {count.toLocaleString()}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background: isDark ? "rgba(148,163,184,0.1)" : "rgba(71,85,105,0.08)",
                        color: "var(--color-text-muted)",
                      }}>
                  {conversionRate}%
                </span>
              </div>
            </div>
            <div className="h-3 rounded-full overflow-hidden"
                 style={{ background: isDark ? "rgba(148,163,184,0.08)" : "rgba(71,85,105,0.06)" }}>
              <div
                className={`h-full rounded-full bg-gradient-to-r ${config.gradient} transition-all duration-700 ease-out`}
                style={{
                  width: `${widthPct}%`,
                  boxShadow: isDark ? `0 0 12px ${config.gradient.includes("cyan") ? "rgba(6,182,212,0.3)" : config.gradient.includes("violet") ? "rgba(139,92,246,0.3)" : "rgba(16,185,129,0.3)"}` : "none",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
