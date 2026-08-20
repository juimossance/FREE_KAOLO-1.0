import { useState, useRef } from "react";
import { Bot, Send, Loader2, Star, Users, FileText, BarChart2, Sparkles, RefreshCw, Copy, ThumbsUp, ThumbsDown, Briefcase, TrendingUp } from "lucide-react";
import { sendMessage as sendMessageApi } from "../../../services/sendMessage";

type AITab = "assistant" | "recommendations" | "reports" | "analysis";

const suggestedQuestions = [
  "Analyse mon profil et suggère des améliorations",
  "Quels projets correspondent à mon profil ?",
  "Rédige une lettre de motivation pour un projet React",
  "Comment augmenter ma note sur la plateforme ?",
  "Génère un résumé de mes candidatures ce mois",
];

const recommendedProfiles = [
  { name: "Kofi Mensah", specialty: "Full Stack React", score: 98, rating: 4.9, price: "60k/j", tags: ["React", "Node.js"], reason: "Correspond à 100% des compétences requises et a livré 5 projets similaires" },
  { name: "Jean-Marc Konan", specialty: "Frontend Vue.js", score: 92, rating: 4.8, price: "65k/j", tags: ["Vue.js", "React"], reason: "Expérience confirmée sur des projets de même envergure, délais respectés" },
  { name: "Ama Nkrumah", specialty: "Backend Node.js", score: 89, rating: 4.7, price: "55k/j", tags: ["Node.js", "Express"], reason: "Spécialisée backend avec expertise API REST et PostgreSQL" },
];

type Message = { role: "user" | "assistant"; content: string; loading?: boolean };

export function AIPage() {
  const [tab, setTab] = useState<AITab>("assistant");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Bonjour ! Je suis votre assistant IA free-kaolo. Je peux vous aider à optimiser votre profil, analyser vos candidatures, recommander des projets, rédiger des lettres de motivation et bien plus encore. Comment puis-je vous aider ?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState("performance");
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportReady, setReportReady] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async (text?: string) => {
    const msg = text || input;
    if (!msg.trim() || loading) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    setLoading(true);

    try {
      const responses = await sendMessageApi(msg);
      const answer = responses?.answer ?? "Désolé, aucune réponse de l'IA.";
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: answer,
        },
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "Erreur lors de la requête IA." },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  };

  const generateReport = async () => {
    setGeneratingReport(true);
    setReportReady(false);
    await new Promise(r => setTimeout(r, 2000));
    setGeneratingReport(false);
    setReportReady(true);
  };

  const tabs: { key: AITab; label: string; icon: React.ReactNode }[] = [
    { key: "assistant", label: "Assistant IA", icon: <Bot size={16} /> },
    { key: "recommendations", label: "Recommandations", icon: <Users size={16} /> },
    { key: "reports", label: "Rapports", icon: <FileText size={16} /> },
    { key: "analysis", label: "Analyse", icon: <BarChart2 size={16} /> },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Tab bar */}
      <div className="flex gap-1 px-6 pt-4 border-b bg-white" style={{ borderColor: "var(--border)" }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-sm font-medium border-b-2 transition-all"
            style={{
              borderColor: tab === t.key ? "var(--navy)" : "transparent",
              color: tab === t.key ? "var(--navy)" : "var(--muted-foreground)",
              background: tab === t.key ? "var(--secondary)" : "transparent",
            }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === "assistant" && (
          <div className="h-full flex flex-col max-w-3xl mx-auto">
            {/* Messages */}
            <div className="flex-1 p-6 space-y-5 overflow-y-auto">
              {/* AI Badge */}
              <div className="flex items-center gap-3 justify-center py-2">
                <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}>
                  <Sparkles size={12} style={{ color: "var(--gold)" }} />
                  Alimenté par IA free-kaolo
                </div>
                <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
              </div>

              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-3`}>
                  {msg.role === "assistant" && (
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "var(--navy)" }}>
                      <Bot size={16} className="text-white" />
                    </div>
                  )}
                  <div className={`max-w-lg ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                    <div className="px-4 py-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line"
                      style={{
                        background: msg.role === "user" ? "var(--navy)" : "var(--card)",
                        color: msg.role === "user" ? "#FFF" : "var(--foreground)",
                        border: msg.role === "assistant" ? "1px solid var(--border)" : "none",
                        borderBottomRightRadius: msg.role === "user" ? 4 : undefined,
                        borderBottomLeftRadius: msg.role === "assistant" ? 4 : undefined,
                      }}>
                      {msg.content}
                    </div>
                    {msg.role === "assistant" && i > 0 && (
                      <div className="flex gap-1.5">
                        <button className="p-1 rounded hover:bg-slate-100 transition-colors">
                          <Copy size={12} className="text-slate-400" />
                        </button>
                        <button className="p-1 rounded hover:bg-slate-100 transition-colors">
                          <ThumbsUp size={12} className="text-slate-400" />
                        </button>
                        <button className="p-1 rounded hover:bg-slate-100 transition-colors">
                          <ThumbsDown size={12} className="text-slate-400" />
                        </button>
                        <button className="p-1 rounded hover:bg-slate-100 transition-colors">
                          <RefreshCw size={12} className="text-slate-400" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--navy)" }}>
                    <Bot size={16} className="text-white" />
                  </div>
                  <div className="px-4 py-3.5 rounded-2xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                    <div className="flex gap-1.5 items-center">
                      <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: "var(--navy)", animationDelay: "0ms" }} />
                      <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: "var(--navy)", animationDelay: "150ms" }} />
                      <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: "var(--navy)", animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested questions */}
            {messages.length === 1 && (
              <div className="px-6 pb-4">
                <p className="text-xs font-semibold mb-2" style={{ color: "var(--muted-foreground)" }}>Suggestions :</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map(q => (
                    <button key={q} onClick={() => handleSendMessage(q)}
                      className="px-3 py-2 rounded-xl text-xs font-medium border hover:bg-slate-50 transition-colors text-left"
                      style={{ borderColor: "var(--border)", color: "var(--navy)" }}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="px-6 pb-6">
              <div className="flex gap-3 items-end">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                  placeholder="Posez votre question à l'IA..."
                  rows={1}
                  className="flex-1 px-4 py-3.5 rounded-xl text-sm border outline-none resize-none"
                  style={{ borderColor: "var(--border)", background: "var(--card)", color: "var(--foreground)" }}
                />
                <button onClick={() => handleSendMessage()} disabled={!input.trim() || loading}
                  className="p-3.5 rounded-xl flex-shrink-0 transition-all"
                  style={{
                    background: input.trim() && !loading ? "var(--navy)" : "var(--secondary)",
                    color: input.trim() && !loading ? "#FFF" : "var(--muted-foreground)",
                  }}>
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </div>
              <p className="text-xs mt-2 text-center" style={{ color: "var(--muted-foreground)" }}>
                L'IA peut faire des erreurs. Vérifiez les informations importantes.
              </p>
            </div>
          </div>
        )}

        {tab === "recommendations" && (
          <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-3 p-4 rounded-2xl border"
              style={{ background: "linear-gradient(135deg, var(--navy) 0%, #1E293B 100%)", borderColor: "transparent" }}>
              <Sparkles size={20} style={{ color: "var(--gold)" }} />
              <div>
                <p className="text-white font-semibold">Recommandations personnalisées par IA</p>
                <p className="text-white/60 text-xs">Basées sur votre projet « Refonte Site Corporate » et vos préférences</p>
              </div>
              <button className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-white hover:bg-white/10">
                <RefreshCw size={13} /> Actualiser
              </button>
            </div>

            <div className="space-y-4">
              {recommendedProfiles.map((profile, i) => (
                <div key={profile.name} className="p-5 rounded-2xl border bg-white" style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold"
                        style={{ background: "var(--secondary)", color: "var(--navy)" }}>
                        {profile.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: i === 0 ? "var(--gold)" : "var(--secondary)", color: i === 0 ? "var(--navy)" : "var(--muted-foreground)" }}>
                        {i + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-semibold" style={{ color: "var(--navy)" }}>{profile.name}</h4>
                          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{profile.specialty}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1.5">
                            <div className="w-24 h-2 rounded-full overflow-hidden" style={{ background: "var(--secondary)" }}>
                              <div className="h-full rounded-full" style={{ width: `${profile.score}%`, background: "var(--gold)" }} />
                            </div>
                            <span className="text-sm font-bold" style={{ color: "var(--navy)" }}>{profile.score}%</span>
                          </div>
                          <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>Score IA</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-1">
                          <Star size={12} fill="var(--gold)" style={{ color: "var(--gold)" }} />
                          <span className="text-xs font-bold" style={{ color: "var(--navy)" }}>{profile.rating}</span>
                        </div>
                        <span className="text-xs font-medium" style={{ color: "var(--navy)" }}>{profile.price} FCFA</span>
                      </div>
                      <div className="p-3 rounded-xl mb-3" style={{ background: "#F0F9FF", border: "1px solid #BAE6FD" }}>
                        <p className="text-xs text-blue-700">💡 <strong>Pourquoi IA recommande :</strong> {profile.reason}</p>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {profile.tags.map(t => (
                          <span key={t} className="px-2.5 py-1 rounded-lg text-xs font-medium"
                            style={{ background: "var(--secondary)", color: "var(--navy)" }}>{t}</span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <a href="/enterprise/freelancer/1"
                          className="px-4 py-2 rounded-xl text-xs font-semibold"
                          style={{ background: "var(--navy)", color: "#FFF" }}>
                          Voir le profil
                        </a>
                        <a href="/messages"
                          className="px-4 py-2 rounded-xl text-xs font-medium border"
                          style={{ borderColor: "var(--border)", color: "var(--navy)" }}>
                          Contacter
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "reports" && (
          <div className="p-6 max-w-3xl mx-auto space-y-6">
            <div className="p-6 rounded-2xl border bg-white" style={{ borderColor: "var(--border)" }}>
              <h3 className="font-semibold mb-4" style={{ color: "var(--navy)" }}>Générer un rapport</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--navy)" }}>Type de rapport</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: "performance", label: "Performance globale", icon: <TrendingUp size={16} /> },
                      { id: "applications", label: "Analyse candidatures", icon: <Briefcase size={16} /> },
                      { id: "earnings", label: "Rapport financier", icon: <BarChart2 size={16} /> },
                      { id: "profile", label: "Analyse profil", icon: <Users size={16} /> },
                    ].map(r => (
                      <button key={r.id} onClick={() => setReportType(r.id)}
                        className="flex items-center gap-3 p-4 rounded-xl border text-left transition-all"
                        style={{
                          background: reportType === r.id ? "var(--navy)" : "transparent",
                          borderColor: reportType === r.id ? "var(--navy)" : "var(--border)",
                          color: reportType === r.id ? "#FFF" : "var(--navy)",
                        }}>
                        {r.icon}
                        <span className="text-sm font-medium">{r.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>Période de début</label>
                    <input type="date" className="w-full px-4 py-3 rounded-xl text-sm border outline-none"
                      style={{ borderColor: "var(--border)", background: "var(--card)", color: "var(--foreground)" }}
                      defaultValue="2026-01-01" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>Période de fin</label>
                    <input type="date" className="w-full px-4 py-3 rounded-xl text-sm border outline-none"
                      style={{ borderColor: "var(--border)", background: "var(--card)", color: "var(--foreground)" }}
                      defaultValue="2026-06-11" />
                  </div>
                </div>
                <button onClick={generateReport} disabled={generatingReport}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
                  style={{ background: "var(--navy)", color: "#FFF" }}>
                  {generatingReport ? <><Loader2 size={16} className="animate-spin" /> Génération en cours...</> : <>
                    <Sparkles size={16} /> Générer le rapport IA
                  </>}
                </button>
              </div>
            </div>

            {reportReady && (
              <div className="p-6 rounded-2xl border bg-white" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-semibold" style={{ color: "var(--navy)" }}>Rapport de Performance — Jan-Jun 2026</h3>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border"
                    style={{ borderColor: "var(--border)", color: "var(--navy)" }}>
                    <FileText size={14} /> Télécharger PDF
                  </button>
                </div>
                <div className="space-y-5">
                  <div className="p-4 rounded-xl" style={{ background: "var(--secondary)" }}>
                    <p className="text-sm font-semibold mb-1" style={{ color: "var(--navy)" }}>📊 Résumé Exécutif</p>
                    <p className="text-sm" style={{ color: "var(--foreground)" }}>
                      Sur la période analysée, votre performance globale est <strong>excellente</strong> avec un score de 91/100.
                      Vous avez complété <strong>5 projets</strong> avec un taux de satisfaction de <strong>96%</strong>.
                      Vos revenus ont progressé de <strong>+41%</strong> par rapport à la même période l'année précédente.
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Revenus", value: "1.95M FCFA", trend: "+41%" },
                      { label: "Projets", value: "5", trend: "+2" },
                      { label: "Note moy.", value: "4.9/5", trend: "+0.2" },
                    ].map(s => (
                      <div key={s.label} className="p-4 rounded-xl text-center" style={{ background: "#DCFCE7" }}>
                        <p className="text-xl font-bold" style={{ color: "#166534" }}>{s.value}</p>
                        <p className="text-xs" style={{ color: "#166534" }}>{s.trend}</p>
                        <p className="text-xs mt-0.5" style={{ color: "#166534" }}>{s.label}</p>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-2" style={{ color: "var(--navy)" }}>🎯 Recommandations IA</p>
                    <ul className="space-y-2">
                      {[
                        "Augmentez votre tarif de 10% — votre taux d'acceptation justifie une valorisation plus haute",
                        "Ajoutez 2 projets portfolio dans la catégorie Mobile pour attirer plus de clients",
                        "Complétez la certification AWS Solutions Architect pour booster votre visibilité de 35%",
                      ].map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--foreground)" }}>
                          <Sparkles size={14} className="mt-0.5 flex-shrink-0" style={{ color: "var(--gold)" }} />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "analysis" && (
          <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { title: "Analyse du marché", icon: <TrendingUp size={20} />, content: "Les projets React sont en hausse de 34% ce trimestre. Votre profil correspond à 87% des offres actives. Les budgets moyens ont augmenté de 12% depuis janvier.", color: "#DBEAFE" },
                { title: "Analyse de votre profil", icon: <Users size={20} />, content: "Score de compétitivité: 91/100. Points forts: expertise technique, délais respectés. À améliorer: diversité portfolio, certifications cloud.", color: "#F0FDF4" },
                { title: "Analyse des concurrents", icon: <Star size={20} />, content: "Vous êtes dans le top 15% des freelancers React sur la plateforme. Votre tarif est 8% en dessous de la médiane — vous pouvez augmenter.", color: "#FEF9C3" },
                { title: "Prévisions", icon: <BarChart2 size={20} />, content: "Basé sur vos performances, l'IA prédit des revenus de 2.4M FCFA pour le second semestre si vous maintenez votre rythme de candidature.", color: "#F3E8FF" },
              ].map(card => (
                <div key={card.title} className="p-5 rounded-2xl border bg-white" style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: card.color }}>
                      <span style={{ color: "var(--navy)" }}>{card.icon}</span>
                    </div>
                    <h4 className="font-semibold" style={{ color: "var(--navy)" }}>{card.title}</h4>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>{card.content}</p>
                  <button className="mt-3 text-xs font-medium hover:underline" style={{ color: "var(--gold)" }}>
                    Voir l'analyse complète →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
