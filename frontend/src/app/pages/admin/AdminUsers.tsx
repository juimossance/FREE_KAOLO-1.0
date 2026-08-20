import { useState } from "react";
import { Search, Filter, CheckCircle, XCircle, Eye, Shield, Ban, MoreVertical, UserPlus, Download } from "lucide-react";

type UserRole = "Freelancer" | "Entreprise";
type UserStatus = "Actif" | "En attente" | "Suspendu" | "Banni";

type PlatformUser = {
  id: number; name: string; email: string; role: UserRole; status: UserStatus;
  joinDate: string; projects: number; rating: number | null; certified: boolean; country: string;
};

const users: PlatformUser[] = [
  { id: 1, name: "Kofi Mensah", email: "kofi@exemple.com", role: "Freelancer", status: "Actif", joinDate: "15 Jan 2026", projects: 23, rating: 4.9, certified: true, country: "Côte d'Ivoire" },
  { id: 2, name: "TechCorp CI", email: "contact@techcorp.ci", role: "Entreprise", status: "Actif", joinDate: "20 Jan 2026", projects: 12, rating: null, certified: false, country: "Côte d'Ivoire" },
  { id: 3, name: "Fatou Diallo", email: "fatou@design.com", role: "Freelancer", status: "Actif", joinDate: "05 Feb 2026", projects: 15, rating: 4.7, certified: true, country: "Sénégal" },
  { id: 4, name: "Jean-Marc Konan", email: "jm@freelance.ci", role: "Freelancer", status: "En attente", joinDate: "01 Jun 2026", projects: 0, rating: null, certified: false, country: "Côte d'Ivoire" },
  { id: 5, name: "FinanceApp SARL", email: "info@financeapp.ci", role: "Entreprise", status: "En attente", joinDate: "08 Jun 2026", projects: 0, rating: null, certified: false, country: "Côte d'Ivoire" },
  { id: 6, name: "Emmanuel Brou", email: "ebrou@mobile.com", role: "Freelancer", status: "Suspendu", joinDate: "10 Mar 2026", projects: 8, rating: 3.2, certified: false, country: "Côte d'Ivoire" },
  { id: 7, name: "StartupCI", email: "hello@startupci.com", role: "Entreprise", status: "Actif", joinDate: "14 Feb 2026", projects: 5, rating: null, certified: false, country: "Côte d'Ivoire" },
  { id: 8, name: "Awa Traoré", email: "awa@data.ml", role: "Freelancer", status: "Actif", joinDate: "22 Mar 2026", projects: 18, rating: 4.6, certified: true, country: "Mali" },
];

const statusConfig: Record<UserStatus, { bg: string; color: string }> = {
  "Actif": { bg: "#DCFCE7", color: "#166534" },
  "En attente": { bg: "#FEF9C3", color: "#854D0E" },
  "Suspendu": { bg: "#FEE2E2", color: "#991B1B" },
  "Banni": { bg: "#1F2937", color: "#FFF" },
};

export function AdminUsers() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "Tous">("Tous");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "Tous">("Tous");
  const [statuses, setStatuses] = useState<Record<number, UserStatus>>(
    Object.fromEntries(users.map(u => [u.id, u.status]))
  );

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "Tous" || u.role === roleFilter;
    const matchStatus = statusFilter === "Tous" || statuses[u.id] === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const updateStatus = (id: number, status: UserStatus) => {
    setStatuses(s => ({ ...s, [id]: status }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--navy)" }}>Gestion des Utilisateurs</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>{users.length} utilisateurs</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border"
            style={{ borderColor: "var(--border)", color: "var(--navy)" }}>
            <Download size={15} /> Exporter CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: "var(--navy)", color: "#FFF" }}>
            <UserPlus size={15} /> Ajouter
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total", count: users.length, color: "var(--navy)" },
          { label: "Actifs", count: users.filter(u => u.status === "Actif").length, color: "#166534" },
          { label: "En attente", count: users.filter(u => u.status === "En attente").length, color: "#854D0E" },
          { label: "Suspendus", count: users.filter(u => u.status === "Suspendu").length, color: "#991B1B" },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-2xl border bg-white text-center" style={{ borderColor: "var(--border)" }}>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.count}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher utilisateur..."
            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm border outline-none"
            style={{ borderColor: "var(--border)", background: "var(--card)", color: "var(--foreground)" }} />
        </div>
        <div className="flex gap-2">
          {(["Tous", "Freelancer", "Entreprise"] as const).map(f => (
            <button key={f} onClick={() => setRoleFilter(f)}
              className="px-4 py-2 rounded-xl text-sm font-medium border transition-all"
              style={{
                background: roleFilter === f ? "var(--navy)" : "var(--card)",
                borderColor: roleFilter === f ? "var(--navy)" : "var(--border)",
                color: roleFilter === f ? "#FFF" : "var(--muted-foreground)",
              }}>
              {f}
            </button>
          ))}
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as UserStatus | "Tous")}
          className="px-4 py-2.5 rounded-xl text-sm border outline-none"
          style={{ borderColor: "var(--border)", background: "var(--card)", color: "var(--navy)" }}>
          <option value="Tous">Tous les statuts</option>
          <option>Actif</option>
          <option>En attente</option>
          <option>Suspendu</option>
          <option>Banni</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border bg-white overflow-hidden" style={{ borderColor: "var(--border)" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--border)", background: "var(--secondary)" }}>
                {["Utilisateur", "Rôle", "Pays", "Inscription", "Projets", "Note", "Certifié", "Statut", "Actions"].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold" style={{ color: "var(--muted-foreground)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
              {filtered.map(user => {
                const s = statusConfig[statuses[user.id]];
                return (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: "var(--secondary)", color: "var(--navy)" }}>
                          {user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: "var(--navy)" }}>{user.name}</p>
                          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{ background: user.role === "Freelancer" ? "#DBEAFE" : "#F3E8FF", color: user.role === "Freelancer" ? "#1E40AF" : "#7E22CE" }}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>{user.country}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>{user.joinDate}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-semibold" style={{ color: "var(--navy)" }}>{user.projects}</span>
                    </td>
                    <td className="px-5 py-4">
                      {user.rating ? (
                        <span className="text-sm font-bold" style={{ color: "var(--navy)" }}>⭐ {user.rating}</span>
                      ) : <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>—</span>}
                    </td>
                    <td className="px-5 py-4">
                      {user.certified ? (
                        <CheckCircle size={16} style={{ color: "var(--success)" }} />
                      ) : (
                        <XCircle size={16} className="text-slate-300" />
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <select value={statuses[user.id]} onChange={e => updateStatus(user.id, e.target.value as UserStatus)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold border outline-none cursor-pointer"
                        style={{ background: s.bg, color: s.color, borderColor: "transparent" }}>
                        {["Actif", "En attente", "Suspendu", "Banni"].map(st => (
                          <option key={st} style={{ background: "#FFF", color: "var(--navy)" }}>{st}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors" title="Voir profil">
                          <Eye size={14} style={{ color: "var(--navy)" }} />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="Suspendre">
                          <Ban size={14} style={{ color: "var(--destructive)" }} />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                          <MoreVertical size={14} style={{ color: "var(--navy)" }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
