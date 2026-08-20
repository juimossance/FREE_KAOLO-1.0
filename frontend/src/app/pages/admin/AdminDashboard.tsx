import { Link } from "react-router";
import { Users, Briefcase, CreditCard, AlertTriangle, TrendingUp, ArrowRight, CheckCircle, Shield } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const growthData = [
  { month: "Jan", users: 120, projects: 45, revenue: 2200000 }, { month: "Fév", users: 180, projects: 62, revenue: 3100000 },
  { month: "Mar", users: 240, projects: 78, revenue: 4200000 }, { month: "Avr", users: 310, projects: 95, revenue: 5800000 },
  { month: "Mai", users: 420, projects: 112, revenue: 7100000 }, { month: "Jun", users: 580, projects: 148, revenue: 9400000 },
];

const recentActivity = [
  { type: "user", text: "Nouveau freelancer inscrit : Kofi Mensah", time: "Il y a 5min", icon: "👤" },
  { type: "cert", text: "Certification AWS validée pour Ama Nkrumah", time: "Il y a 12min", icon: "🏆" },
  { type: "payment", text: "Transaction de 320 000 FCFA (TechCorp → Kofi)", time: "Il y a 25min", icon: "💳" },
  { type: "report", text: "Signalement reçu : profil suspect #4521", time: "Il y a 1h", icon: "⚠️" },
  { type: "project", text: "Nouveau projet publié : « App Mobile E-commerce »", time: "Il y a 2h", icon: "📋" },
];

const pendingActions = [
  { label: "Certifications à valider", count: 14, href: "/admin/certifications", urgency: "high" },
  { label: "Signalements en attente", count: 7, href: "/admin/reports", urgency: "high" },
  { label: "Comptes en attente d'activation", count: 23, href: "/admin/users", urgency: "medium" },
  { label: "Paiements à traiter", count: 5, href: "/admin/payments", urgency: "low" },
];

export function AdminDashboard() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--navy)" }}>
            <Shield size={20} style={{ color: "var(--gold)" }} />
            Dashboard Administration
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            Vue globale de la plateforme — Jeudi 11 Juin 2026
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/reports"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: "#FEE2E2", color: "#991B1B" }}>
            <AlertTriangle size={15} /> 7 signalements
          </Link>
          <Link to="/admin/certifications"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: "var(--navy)", color: "#FFF" }}>
            <CheckCircle size={15} /> 14 à valider
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Utilisateurs total", value: "2 847", change: "+12%", icon: <Users size={18} />, color: "#3B82F6" },
          { label: "Projets actifs", value: "384", change: "+8%", icon: <Briefcase size={18} />, color: "#8B5CF6" },
          { label: "Volume paiements", value: "94M FCFA", change: "+41%", icon: <CreditCard size={18} />, color: "var(--gold)" },
          { label: "Signalements", value: "7", change: "-3", icon: <AlertTriangle size={18} />, color: "var(--destructive)" },
        ].map(s => (
          <div key={s.label} className="p-5 rounded-2xl border bg-white" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${s.color}18`, color: s.color }}>
                {s.icon}
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded-full"
                style={{ background: s.color === "var(--destructive)" ? "#FEE2E2" : "#DCFCE7", color: s.color === "var(--destructive)" ? "#991B1B" : "#166534" }}>
                {s.change}
              </span>
            </div>
            <p className="text-2xl font-bold" style={{ color: "var(--navy)" }}>{s.value}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 p-5 rounded-2xl border bg-white" style={{ borderColor: "var(--border)" }}>
          <h3 className="font-semibold mb-4" style={{ color: "var(--navy)" }}>Croissance de la plateforme</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={growthData}>
              <defs>
                <linearGradient id="users" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }} />
              <Area type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2} fill="url(#users)" name="Utilisateurs" />
              <Area type="monotone" dataKey="projects" stroke="#D4AF37" strokeWidth={2} fill="none" name="Projets" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="lg:col-span-2 p-5 rounded-2xl border bg-white" style={{ borderColor: "var(--border)" }}>
          <h3 className="font-semibold mb-4" style={{ color: "var(--navy)" }}>Revenue mensuel</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={growthData} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false}
                tickFormatter={v => `${(v / 1000000).toFixed(0)}M`} />
              <Tooltip formatter={(v: number) => [`${(v / 1000000).toFixed(2)} M FCFA`]}
                contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }} />
              <Bar dataKey="revenue" fill="var(--gold)" radius={[4, 4, 0, 0]} name="Revenus" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pending actions + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2 p-5 rounded-2xl border bg-white" style={{ borderColor: "var(--border)" }}>
          <h3 className="font-semibold mb-4" style={{ color: "var(--navy)" }}>Actions requises</h3>
          <div className="space-y-3">
            {pendingActions.map(action => (
              <Link key={action.label} to={action.href}
                className="flex items-center gap-3 p-3 rounded-xl border hover:border-slate-300 transition-all group"
                style={{ borderColor: "var(--border)" }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0"
                  style={{
                    background: action.urgency === "high" ? "#FEE2E2" : action.urgency === "medium" ? "#FEF9C3" : "#DCFCE7",
                    color: action.urgency === "high" ? "#991B1B" : action.urgency === "medium" ? "#854D0E" : "#166534",
                  }}>
                  {action.count}
                </div>
                <span className="text-sm flex-1" style={{ color: "var(--navy)" }}>{action.label}</span>
                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: "var(--gold)" }} />
              </Link>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 rounded-2xl border bg-white overflow-hidden" style={{ borderColor: "var(--border)" }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
            <h3 className="font-semibold" style={{ color: "var(--navy)" }}>Activité récente</h3>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                <span className="text-xl flex-shrink-0">{a.icon}</span>
                <div className="flex-1">
                  <p className="text-sm" style={{ color: "var(--navy)" }}>{a.text}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Platform health */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Uptime", value: "99.97%", color: "#DCFCE7", textColor: "#166534" },
          { label: "Taux de satisfaction", value: "94.2%", color: "#DBEAFE", textColor: "#1E40AF" },
          { label: "Litiges résolus", value: "98.1%", color: "#F0FDF4", textColor: "#166534" },
          { label: "Temps réponse support", value: "< 2h", color: "#FEF9C3", textColor: "#854D0E" },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-2xl text-center" style={{ background: s.color }}>
            <p className="text-2xl font-bold" style={{ color: s.textColor }}>{s.value}</p>
            <p className="text-xs mt-1 font-medium" style={{ color: s.textColor }}>{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
