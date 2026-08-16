import { useState, useEffect, useCallback } from "react";
import LiveCounter from "./components/LiveCounter";
import EventsPerMinuteChart from "./components/EventsPerMinuteChart";
import TopCategoriesChart from "./components/TopCategoriesChart";
import ConversionFunnel from "./components/ConversionFunnel";
import DeviceBreakdown from "./components/DeviceBreakdown";
import RevenueChart from "./components/RevenueChart";
import RecentEventsTable from "./components/RecentEventsTable";
import ThemeToggle from "./components/ThemeToggle";

const API_BASE = "/api";
const POLL_INTERVAL = 3000;

function App() {
  const [stats, setStats] = useState({ total_events: 0, total_users: 0, total_revenue: 0 });
  const [eventsPerMinute, setEventsPerMinute] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [conversionFunnel, setConversionFunnel] = useState([]);
  const [deviceBreakdown, setDeviceBreakdown] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, epmRes, catsRes, funnelRes, deviceRes, revRes, eventsRes] =
        await Promise.all([
          fetch(`${API_BASE}/stats`),
          fetch(`${API_BASE}/events-per-minute`),
          fetch(`${API_BASE}/top-categories`),
          fetch(`${API_BASE}/conversion-funnel`),
          fetch(`${API_BASE}/device-breakdown`),
          fetch(`${API_BASE}/revenue`),
          fetch(`${API_BASE}/recent-events`),
        ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (epmRes.ok) setEventsPerMinute(await epmRes.json());
      if (catsRes.ok) setTopCategories(await catsRes.json());
      if (funnelRes.ok) setConversionFunnel(await funnelRes.json());
      if (deviceRes.ok) setDeviceBreakdown(await deviceRes.json());
      if (revRes.ok) setRevenue(await revRes.json());
      if (eventsRes.ok) setRecentEvents(await eventsRes.json());
      setLastUpdate(new Date());
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: "var(--color-bg-primary)" }}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
                  Clickstream Analytics
                </h1>
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                  Real-time e-commerce pipeline monitoring
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {lastUpdate && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium"
                   style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)", color: "var(--color-text-muted)" }}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Live
              </div>
            )}
            <ThemeToggle />
          </div>
        </header>

        <LiveCounter stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
          <div className="card p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--color-text-muted)" }}>
              Events Per Minute
            </h2>
            <EventsPerMinuteChart data={eventsPerMinute} />
          </div>

          <div className="card p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--color-text-muted)" }}>
              Top Categories
            </h2>
            <TopCategoriesChart data={topCategories} />
          </div>

          <div className="card p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--color-text-muted)" }}>
              Conversion Funnel
            </h2>
            <ConversionFunnel data={conversionFunnel} />
          </div>

          <div className="card p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--color-text-muted)" }}>
              Device Breakdown
            </h2>
            <DeviceBreakdown data={deviceBreakdown} />
          </div>

          <div className="card p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--color-text-muted)" }}>
              Revenue Over Time
            </h2>
            <RevenueChart data={revenue} />
          </div>

          <div className="card p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--color-text-muted)" }}>
              Recent Events
            </h2>
            <RecentEventsTable data={recentEvents} />
          </div>
        </div>

        <footer className="mt-8 pb-4 text-center text-xs" style={{ color: "var(--color-text-muted)" }}>
          Kafka → PySpark Structured Streaming → PostgreSQL → React
        </footer>
      </div>
    </div>
  );
}

export default App;
