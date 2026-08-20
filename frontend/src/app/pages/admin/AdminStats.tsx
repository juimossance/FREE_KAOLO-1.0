import { TrendingUp, Users, Briefcase, CreditCard, Award, Globe, MapPin } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, LineChart, Line } from "recharts";

const userGrowth = [
  { month: "Jan", freelancers: 80, entreprises: 40 }, { month: "Fév", freelancers: 120, entreprises: 60 },
  { month: "Mar", freelancers: 160, entreprises: 80 }, { month: "Avr", freelancers: 220, entreprises: 90 },
  { month: "Mai", freelancers: 310, entreprises: 110 }, { month: "Jun", freelancers: 420, entreprises: 160 },
];
const revenueData = [
  { month: "Jan", commissions: 220000, volume: 2200000 }, { month: "Fév", commissions: 310000, volume: 3100000 },
  { month: "Mar", commissions: 420000, volume: 4200000 }, { month: "Avr", commissions: 580000, volume: 5800000 },
  { month: "Mai", commissions: 710000, volume: 7100000 }, { month: "Jun", commissions: 940000, volume: 9400000 },
];
const categoryData = [
  { name: "Dev Web", value: 38 }, { name: "Mobile", value: 22 }, { name: "Design", value: 15 },
  { name: "Data", value: 12 }, { name: "DevOps", value: 8 }, { name: "Autre", value: 5 },
];
const countryData = [
  { country: "Côte d'Ivoire", users: 1840, flag: "🇨🇮" }, { country: "Sénégal", users: 420, flag: "🇸🇳" },
  { country: "Ghana", users: 280, flag: "🇬🇭" }, { country: "Mali", users: 190, flag: "🇲🇱" },
  { country: "Cameroun", users: 117, flag: "🇨🇲" },
];
const COLORS = ["var(--navy)", "#3B82F6", "#8B5CF6", "var(--gold)", "#22C55E", "#F59E0B"];

export function AdminStats() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold" style={{ color: "var(--navy)" }}>Statistiques Plateforme</h2>
        <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
          Vue globale des performances — Janvier à Juin 2026
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total utilisateurs", value: "2 847", growth: "+580 ce mois", icon: <Users size={20} />, color: "#3B82F6" },
          { label: "Projets publiés", value: "1 284", growth: "+148 ce mois", icon: <Briefcase size={20} />, color: "#8B5CF6" },
          { label: "Volume transactions", value: "94M FCFA", growth: "+41%", icon: <CreditCard size={20} />, color: "var(--gold)" },
          { label: "Certifications actives", value: "847", growth: "+94 ce mois", icon: <Award size={20} />, color: "var(--success)" },
        ].map(s => (
          <div key={s.label} className="p-5 rounded-2xl border bg-white" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: `${s.color}18`, color: s.color }}>
                {s.icon}
              </div>
              <TrendingUp size={14} style={{ color: "var(--success)" }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: "var(--navy)" }}>{s.value}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{s.label}</p>
            <p className="text-xs mt-1 font-medium" style={{ color: "var(--success)" }}>{s.growth}</p>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 p-5 rounded-2xl border bg-white" style={{ borderColor: "var(--border)" }}>
          <h3 className="font-semibold mb-4" style={{ color: "var(--navy)" }}>Croissance des utilisateurs</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={userGrowth}>
              <defs>
                <linearGradient id="freelancers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0F172A" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0F172A" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="entreprises" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }} />
              <Area type="monotone" dataKey="freelancers" stroke="#0F172A" strokeWidth={2.5} fill="url(#freelancers)" name="Freelancers" />
              <Area type="monotone" dataKey="entreprises" stroke="#D4AF37" strokeWidth={2.5} fill="url(#entreprises)" name="Entreprises" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted-foreground)" }}>
              <div className="w-3 h-3 rounded-sm" style={{ background: "var(--navy)" }} /> Freelancers
            </div>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted-foreground)" }}>
              <div className="w-3 h-3 rounded-sm" style={{ background: "var(--gold)" }} /> Entreprises
            </div>
          </div>
        </div>
        <div className="p-5 rounded-2xl border bg-white" style={{ borderColor: "var(--border)" }}>
          <h3 className="font-semibold mb-4" style={{ color: "var(--navy)" }}>Projets par catégorie</h3>
          <div className="flex justify-center mb-4">
            <PieChart width={180} height={180}>
              <Pie data={categoryData} cx={85} cy={85} innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
            </PieChart>
          </div>
          <div className="space-y-2">
            {categoryData.map((cat, i) => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span style={{ color: "var(--navy)" }}>{cat.name}</span>
                </div>
                <span className="font-semibold" style={{ color: "var(--navy)" }}>{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue */}
      <div className="p-5 rounded-2xl border bg-white" style={{ borderColor: "var(--border)" }}>
        <h3 className="font-semibold mb-4" style={{ color: "var(--navy)" }}>Volume transactions & Commissions (FCFA)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={revenueData} barSize={14}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false}
              tickFormatter={v => `${(v / 1000000).toFixed(1)}M`} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false}
              tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }}
              formatter={(v: number, name) => [
                name === "volume" ? `${(v / 1000000).toFixed(2)}M FCFA` : `${(v / 1000).toFixed(0)}k FCFA`,
                name === "volume" ? "Volume total" : "Commissions (8%)",
              ]} />
            <Bar yAxisId="left" dataKey="volume" fill="#E2E8F0" radius={[4, 4, 0, 0]} name="volume" />
            <Bar yAxisId="right" dataKey="commissions" fill="var(--gold)" radius={[4, 4, 0, 0]} name="commissions" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Geographic distribution */}
      <div className="p-5 rounded-2xl border bg-white" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2 mb-5">
          <Globe size={18} style={{ color: "var(--navy)" }} />
          <h3 className="font-semibold" style={{ color: "var(--navy)" }}>Distribution géographique</h3>
        </div>
        <div className="space-y-4">
          {countryData.map(c => (
            <div key={c.country} className="flex items-center gap-4">
              <span className="text-xl">{c.flag}</span>
              <div className="flex items-center gap-2 w-32">
                <MapPin size={12} style={{ color: "var(--muted-foreground)" }} />
                <span className="text-sm font-medium" style={{ color: "var(--navy)" }}>{c.country}</span>
              </div>
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--secondary)" }}>
                <div className="h-full rounded-full" style={{
                  width: `${(c.users / countryData[0].users) * 100}%`,
                  background: "var(--navy)",
                }} />
              </div>
              <span className="text-sm font-bold w-16 text-right" style={{ color: "var(--navy)" }}>
                {c.users.toLocaleString()}
              </span>
              <span className="text-xs w-10 text-right" style={{ color: "var(--muted-foreground)" }}>
                {((c.users / 2847) * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
