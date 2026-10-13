import { useState } from "react";
import { Bell, CheckCircle, MessageSquare, CreditCard, Award, Briefcase, Trash2, Settings, Check } from "lucide-react";

type NotifType = "all" | "payment" | "message" | "project" | "system";
type Notif = {
  id: number; type: NotifType; icon: React.ReactNode; iconBg: string;
  title: string; description: string; time: string; read: boolean; action?: string;
};

const initialNotifs: Notif[] = [
  { id: 1, type: "project", icon: <CheckCircle size={16} />, iconBg: "#DCFCE7", title: "Candidature acceptée", description: "TechCorp a accepté votre candidature pour « Refonte Site Corporate »", time: "Il y a 30min", read: false, action: "/messages" },
  { id: 2, type: "payment", icon: <CreditCard size={16} />, iconBg: "#DBEAFE", title: "Paiement reçu", description: "Vous avez reçu 180 000 FCFA de TechCorp pour « Refonte Site Corporate »", time: "Il y a 2h", read: false, action: "/payments" },
  { id: 3, type: "message", icon: <MessageSquare size={16} />, iconBg: "#F3E8FF", title: "Nouveau message", description: "FinanceApp: « Pouvez-vous nous envoyer une proposition de délai ? »", time: "Il y a 3h", read: false, action: "/messages" },
  { id: 4, type: "system", icon: <Award size={16} />, iconBg: "#FEF9C3", title: "Certification validée", description: "Votre certification « AWS Cloud Practitioner » a été validée avec succès", time: "Il y a 5h", read: true },
  { id: 5, type: "project", icon: <Briefcase size={16} />, iconBg: "#F0FDF4", title: "Nouveau projet correspondant", description: "3 nouveaux projets React correspondent à votre profil", time: "Il y a 1j", read: true, action: "/enterprise/search" },
  { id: 6, type: "payment", icon: <CreditCard size={16} />, iconBg: "#DBEAFE", title: "Retrait traité", description: "Votre retrait de 200 000 FCFA vers Orange Money a été effectué", time: "Il y a 2j", read: true },
  { id: 7, type: "system", icon: <Bell size={16} />, iconBg: "#F1F5F9", title: "Profil vu par une entreprise", description: "DataTech a consulté votre profil", time: "Il y a 2j", read: true },
  { id: 8, type: "message", icon: <MessageSquare size={16} />, iconBg: "#F3E8FF", title: "Nouveau message", description: "StartupCI: « Votre devis est bien reçu, nous vous revenons sous 48h »", time: "Il y a 3j", read: true, action: "/messages" },
];

const typeLabels: Record<NotifType, string> = {
  all: "Toutes", payment: "Paiements", message: "Messages", project: "Projets", system: "Système",
};
const typeIcons: Record<NotifType, React.ReactNode> = {
  all: <Bell size={14} />, payment: <CreditCard size={14} />, message: <MessageSquare size={14} />,
  project: <Briefcase size={14} />, system: <Settings size={14} />,
};

export function FreelancerNotifications() {
  const [notifs, setNotifs] = useState(initialNotifs);
  const [filter, setFilter] = useState<NotifType>("all");

  const unreadCount = notifs.filter(n => !n.read).length;
  const filtered = filter === "all" ? notifs : notifs.filter(n => n.type === filter);

  const markAllRead = () => setNotifs(n => n.map(x => ({ ...x, read: true })));
  const markRead = (id: number) => setNotifs(n => n.map(x => x.id === id ? { ...x, read: true } : x));
  const deleteNotif = (id: number) => setNotifs(n => n.filter(x => x.id !== id));

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--navy)" }}>
            Notifications
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white"
                style={{ background: "var(--destructive)" }}>
                {unreadCount}
              </span>
            )}
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={markAllRead}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors hover:bg-slate-50"
            style={{ borderColor: "var(--border)", color: "var(--navy)" }}>
            <Check size={14} /> Tout marquer comme lu
          </button>
          <button className="p-2 rounded-xl border hover:bg-slate-50 transition-colors"
            style={{ borderColor: "var(--border)" }}>
            <Settings size={16} style={{ color: "var(--navy)" }} />
          </button>
        </div>
      </div>

      {/* Type filters */}
      <div className="flex gap-2 flex-wrap">
        {(Object.keys(typeLabels) as NotifType[]).map(type => {
          const count = type === "all" ? notifs.filter(n => !n.read).length : notifs.filter(n => n.type === type && !n.read).length;
          return (
            <button key={type} onClick={() => setFilter(type)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all"
              style={{
                background: filter === type ? "var(--navy)" : "var(--card)",
                borderColor: filter === type ? "var(--navy)" : "var(--border)",
                color: filter === type ? "#FFF" : "var(--muted-foreground)",
              }}>
              {typeIcons[type]} {typeLabels[type]}
              {count > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-xs font-bold"
                  style={{ background: filter === type ? "rgba(255,255,255,0.2)" : "var(--destructive)", color: "#FFF" }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Notifications list */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Bell size={36} className="mx-auto mb-3 text-slate-300" />
            <p className="font-semibold" style={{ color: "var(--navy)" }}>Aucune notification</p>
          </div>
        )}
        {/* Unread section */}
        {filtered.some(n => !n.read) && (
          <div className="mb-1">
            <p className="text-xs font-semibold uppercase tracking-wide mb-2 px-1"
              style={{ color: "var(--muted-foreground)" }}>Non lues</p>
            {filtered.filter(n => !n.read).map(notif => (
              <div key={notif.id}
                className="flex items-start gap-4 p-4 rounded-2xl mb-2 border cursor-pointer hover:shadow-sm transition-all"
                style={{ background: "#FFFBEB", borderColor: "#FCD34D" }}
                onClick={() => markRead(notif.id)}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: notif.iconBg, color: "var(--navy)" }}>
                  {notif.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: "var(--navy)" }}>{notif.title}</p>
                  <p className="text-sm mt-0.5" style={{ color: "var(--foreground)" }}>{notif.description}</p>
                  <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>{notif.time}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <div className="w-2 h-2 rounded-full" style={{ background: "var(--gold)" }} />
                  <button onClick={e => { e.stopPropagation(); deleteNotif(notif.id); }}
                    className="p-1.5 rounded-lg hover:bg-amber-100 transition-colors">
                    <Trash2 size={13} className="text-amber-800" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Read section */}
        {filtered.some(n => n.read) && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2 px-1"
              style={{ color: "var(--muted-foreground)" }}>Lues</p>
            {filtered.filter(n => n.read).map(notif => (
              <div key={notif.id}
                className="flex items-start gap-4 p-4 rounded-2xl mb-2 border hover:shadow-sm transition-all"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 opacity-70"
                  style={{ background: notif.iconBg, color: "var(--navy)" }}>
                  {notif.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: "var(--navy)" }}>{notif.title}</p>
                  <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>{notif.description}</p>
                  <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>{notif.time}</p>
                </div>
                <button onClick={() => deleteNotif(notif.id)}
                  className="flex-shrink-0 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                  <Trash2 size={13} className="text-slate-400" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notification settings */}
      <div className="p-5 rounded-2xl border bg-white" style={{ borderColor: "var(--border)" }}>
        <h3 className="font-semibold mb-4" style={{ color: "var(--navy)" }}>Préférences de notification</h3>
        <div className="space-y-3">
          {[
            { label: "Nouvelles candidatures acceptées", defaultChecked: true },
            { label: "Paiements reçus", defaultChecked: true },
            { label: "Nouveaux messages", defaultChecked: true },
            { label: "Projets correspondants à mon profil", defaultChecked: true },
            { label: "Certifications validées", defaultChecked: true },
            { label: "Notifications par email", defaultChecked: false },
            { label: "Notifications SMS", defaultChecked: false },
          ].map(pref => (
            <div key={pref.label} className="flex items-center justify-between py-2 border-b last:border-0"
              style={{ borderColor: "var(--border)" }}>
              <span className="text-sm" style={{ color: "var(--foreground)" }}>{pref.label}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked={pref.defaultChecked} className="sr-only peer" />
                <div className="w-10 h-5 rounded-full peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"
                  style={{ background: pref.defaultChecked ? "var(--navy)" : "#CBD5E1" }} />
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
