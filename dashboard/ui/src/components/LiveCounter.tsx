interface Stats {
  total_events: number;
  total_users: number;
  total_revenue: number;
}

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  gradient: string;
  glow: string;
}

function StatCard({ label, value, icon, gradient, glow }: StatCardProps) {
  return (
    <div className="stat-card group">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
           style={{ background: glow }} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-2"
             style={{ color: "var(--color-text-muted)" }}>
            {label}
          </p>
          <p className={`text-3xl lg:text-4xl font-bold tracking-tight bg-clip-text text-transparent ${gradient}`}>
            {value}
          </p>
        </div>
        <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${gradient}`}
             style={{ opacity: 0.15 }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function LiveCounter({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard
        label="Total Events"
        value={stats.total_events.toLocaleString()}
        gradient="bg-gradient-to-r from-cyan-500 to-cyan-400"
        glow="linear-gradient(135deg, rgba(6,182,212,0.06) 0%, transparent 60%)"
        icon={
          <svg className="w-5 h-5 text-cyan-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
        }
      />
      <StatCard
        label="Unique Users"
        value={stats.total_users.toLocaleString()}
        gradient="bg-gradient-to-r from-violet-500 to-violet-400"
        glow="linear-gradient(135deg, rgba(139,92,246,0.06) 0%, transparent 60%)"
        icon={
          <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
        }
      />
      <StatCard
        label="Total Revenue"
        value={`$${stats.total_revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        gradient="bg-gradient-to-r from-amber-500 to-amber-400"
        glow="linear-gradient(135deg, rgba(245,158,11,0.06) 0%, transparent 60%)"
        icon={
          <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
    </div>
  );
}
