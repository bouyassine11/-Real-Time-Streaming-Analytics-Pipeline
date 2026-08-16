import { useTheme } from "../context/ThemeContext";

interface EventRow {
  event_id: string;
  user_id: string;
  event_type: string;
  product_id: string | null;
  category: string;
  page_url: string;
  referrer: string;
  device: string;
  price: string | null;
  timestamp: string;
}

const EVENT_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  page_view: { label: "VIEW", bg: "bg-cyan-500/10", text: "text-cyan-600 dark:text-cyan-400" },
  click: { label: "CLICK", bg: "bg-violet-500/10", text: "text-violet-600 dark:text-violet-400" },
  search: { label: "SEARCH", bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" },
  add_to_cart: { label: "CART", bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" },
  purchase: { label: "BUY", bg: "bg-red-500/10", text: "text-red-600 dark:text-red-400" },
  remove_from_cart: { label: "REMOVE", bg: "bg-orange-500/10", text: "text-orange-600 dark:text-orange-400" },
};

const DEVICE_ICON: Record<string, React.ReactNode> = {
  desktop: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 7.41A2.25 2.25 0 012.25 5.496V5.25" />
    </svg>
  ),
  mobile: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
    </svg>
  ),
  tablet: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5h3m-6.75 2.25h10.5a2.25 2.25 0 002.25-2.25v-15a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 4.5v15a2.25 2.25 0 002.25 2.25z" />
    </svg>
  ),
};

export default function RecentEventsTable({ data }: { data: EventRow[] }) {
  const { theme } = useTheme();

  if (!data.length) {
    return <p className="text-center py-10" style={{ color: "var(--color-text-muted)" }}>Waiting for data...</p>;
  }

  return (
    <div className="overflow-auto max-h-[280px] scrollbar-thin rounded-xl">
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10" style={{ background: "var(--table-header-bg)" }}>
          <tr style={{ color: "var(--color-text-muted)" }} className="text-left text-xs font-semibold uppercase tracking-wider">
            <th className="pb-3 pl-3 pr-2">Time</th>
            <th className="pb-3 pr-2">Event</th>
            <th className="pb-3 pr-2">User</th>
            <th className="pb-3 pr-2">Category</th>
            <th className="pb-3 pr-2">Device</th>
            <th className="pb-3 pr-3">Price</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => {
            const badge = EVENT_BADGE[row.event_type] || { label: row.event_type, bg: "bg-gray-500/10", text: "text-gray-600" };
            return (
              <tr
                key={row.event_id}
                className="transition-colors duration-150"
                style={{
                  borderTop: `1px solid var(--table-border)`,
                  background: i % 2 === 0 ? "transparent" : undefined,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--table-row-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 0 ? "transparent" : undefined)}
              >
                <td className="py-2.5 pl-3 pr-2 font-mono text-xs whitespace-nowrap" style={{ color: "var(--color-text-muted)" }}>
                  {new Date(row.timestamp).toLocaleTimeString()}
                </td>
                <td className="py-2.5 pr-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${badge.bg} ${badge.text}`}>
                    {badge.label}
                  </span>
                </td>
                <td className="py-2.5 pr-2 font-mono text-xs" style={{ color: "var(--color-text-secondary)" }}>
                  {row.user_id.slice(0, 12)}
                </td>
                <td className="py-2.5 pr-2" style={{ color: "var(--color-text-secondary)" }}>
                  {row.category}
                </td>
                <td className="py-2.5 pr-2">
                  <div className="flex items-center gap-1.5" style={{ color: "var(--color-text-muted)" }}>
                    {DEVICE_ICON[row.device] || null}
                    <span className="text-xs">{row.device}</span>
                  </div>
                </td>
                <td className="py-2.5 pr-3 font-mono text-xs font-medium" style={{ color: "var(--color-text-primary)" }}>
                  {row.price ? `$${parseFloat(row.price).toFixed(2)}` : "---"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
