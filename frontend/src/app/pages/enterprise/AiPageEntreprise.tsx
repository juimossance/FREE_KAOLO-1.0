// src/app/pages/enterprise/AIPageEnterprise.tsx
import { useState, useRef } from "react";
import { Bot, Send, Loader2, Users, FileText, BarChart2, Sparkles, RefreshCw, Copy, ThumbsUp, ThumbsDown, TrendingUp, Star, Download, CheckCircle, Briefcase, Code, Award, Clock, MapPin, UserPlus } from "lucide-react";
import { Link } from "react-router";
import { aiService, type AIMessage } from "../../../services/aiService";

type AITab = "assistant" | "idealProfile" | "reports" | "analysis";

const suggestedQuestions = [
  "Rédige une offre de projet attractive pour un développeur React",
  "Comment évaluer les candidatures de freelancers ?",
  "Aide-moi à définir le budget pour mon projet mobile",
  "Génère un cahier des charges pour une app e-commerce",
  "Quels critères pour choisir le bon freelancer ?",
];

const inputClass = "w-full px-4 py-3 rounded-xl text-sm border outline-none transition-all";
const inputStyle = { borderColor: "var(--border)", background: "var(--card)", color: "var(--foreground)" };

export function AIPageEnterprise() {
  const [tab, setTab] = useState<AITab>("assistant");

  // Assistant
  const [messages, setMessages] = useState<AIMessage[]>([{
    role: "assistant",
    content: "Bonjour. Je suis votre assistant IA dédié aux entreprises. Je vous aide à rédiger des offres, évaluer des profils, définir des budgets et optimiser vos recrutements. Comment puis-je vous assister ?",
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = async (text?: string) => {
    const msg = text || input;
    if (!msg.trim() || loading) return;
    setInput("");
    const newMessages: AIMessage[] = [...messages, { role: "user", content: msg }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const res = await aiService.chat(
        newMessages,
        "Tu es un assistant IA pour les entreprises sur la plateforme free-kaolo en Afrique de l'Ouest. Tu aides à rédiger des offres de projets, évaluer des freelancers, définir des budgets. Réponds en français, de façon professionnelle, concise et actionnable. Évite les émojis et les tableaux complexes."
      );
      setMessages(prev => [...prev, { role: "assistant", content: res.content }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Désolé, une erreur est survenue. Veuillez réessayer." }]);
    } finally {
      setLoading(false);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  };

  // Profil idéal
  const [recoForm, setRecoForm] = useState({
    projet: "", competences: "", budget: "", duree: "", niveau: "intermediate",
  });
  const [recoLoading, setRecoLoading] = useState(false);
  const [recoResult, setRecoResult] = useState("");
  const [freelancersTrouves, setFreelancersTrouves] = useState<any[]>([]);

  const generateIdealProfile = async () => {
    setRecoLoading(true);
    setRecoResult("");
    setFreelancersTrouves([]);

    try {
      const res: any = await aiService.idealProfile(recoForm);
      setRecoResult(res.content);
      setFreelancersTrouves(res.freelancers ?? []);
    } catch (error) {
      console.error(error);
      setRecoResult("Erreur lors de la génération. Veuillez réessayer.");
      setFreelancersTrouves([]);
    } finally {
      setRecoLoading(false);
    }
  };

  // Rapports
  const [reportType, setReportType] = useState("recruitment");
  const [reportLoading, setReportLoading] = useState(false);
  const [reportContent, setReportContent] = useState("");
  const [dateDebut, setDateDebut] = useState("2026-01-01");
  const [dateFin, setDateFin] = useState("2026-06-30");

  const generateReport = async () => {
    setReportLoading(true);
    setReportContent("");
    try {
      const res = await aiService.generateReport({
        role: "ENTREPRISE", type: reportType, dateDebut, dateFin,
      });
      setReportContent(res.content);
    } catch {
      setReportContent("Erreur lors de la génération du rapport.");
    } finally {
      setReportLoading(false);
    }
  };

  // Analyse
  const [analyses, setAnalyses] = useState<Record<string, string>>({});
  const [analysisLoading, setAnalysisLoading] = useState<string | null>(null);

  const generateAnalysis = async (type: string) => {
    setAnalysisLoading(type);
    try {
      const res = await aiService.analysis(type, "ENTREPRISE");
      setAnalyses(prev => ({ ...prev, [type]: res.content }));
    } catch {
      setAnalyses(prev => ({ ...prev, [type]: "Erreur de génération." }));
    } finally {
      setAnalysisLoading(null);
    }
  };

  const tabs = [
    { key: "assistant" as AITab, label: "Assistant IA", icon: <Bot size={16} /> },
    { key: "idealProfile" as AITab, label: "Profil idéal", icon: <Users size={16} /> },
    { key: "reports" as AITab, label: "Rapports", icon: <FileText size={16} /> },
    { key: "analysis" as AITab, label: "Analyse marché", icon: <BarChart2 size={16} /> },
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
        {/* Assistant */}
        {tab === "assistant" && (
          <div className="h-full flex flex-col max-w-3xl mx-auto">
            <div className="flex-1 p-6 space-y-5 overflow-y-auto">
              <div className="flex items-center gap-3 justify-center py-2">
                <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}>
                  <Sparkles size={12} style={{ color: "var(--gold)" }} /> Alimenté par OpenRouter
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
                  <div className={`max-w-lg flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
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
                        <button onClick={() => navigator.clipboard.writeText(msg.content)}
                          className="p-1 rounded hover:bg-slate-100"><Copy size={12} className="text-slate-400" /></button>
                        <button className="p-1 rounded hover:bg-slate-100"><ThumbsUp size={12} className="text-slate-400" /></button>
                        <button className="p-1 rounded hover:bg-slate-100"><ThumbsDown size={12} className="text-slate-400" /></button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "var(--navy)" }}>
                    <Bot size={16} className="text-white" />
                  </div>
                  <div className="px-4 py-3.5 rounded-2xl border"
                    style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                    <div className="flex gap-1.5 items-center">
                      {[0, 150, 300].map(d => (
                        <div key={d} className="w-2 h-2 rounded-full animate-bounce"
                          style={{ background: "var(--navy)", animationDelay: `${d}ms` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {messages.length === 1 && (
              <div className="px-6 pb-4">
                <p className="text-xs font-semibold mb-2" style={{ color: "var(--muted-foreground)" }}>Suggestions :</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map(q => (
                    <button key={q} onClick={() => handleSend(q)}
                      className="px-3 py-2 rounded-xl text-xs font-medium border hover:bg-slate-50 transition-colors text-left"
                      style={{ borderColor: "var(--border)", color: "var(--navy)" }}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="px-6 pb-6">
              <div className="flex gap-3 items-end">
                <textarea value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Posez votre question à l'IA..." rows={1}
                  className="flex-1 px-4 py-3.5 rounded-xl text-sm border outline-none resize-none"
                  style={inputStyle} />
                <button onClick={() => handleSend()} disabled={!input.trim() || loading}
                  className="p-3.5 rounded-xl flex-shrink-0 transition-all"
                  style={{
                    background: input.trim() && !loading ? "var(--navy)" : "var(--secondary)",
                    color: input.trim() && !loading ? "#FFF" : "var(--muted-foreground)",
                  }}>
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </div>
              <p className="text-xs mt-2 text-center" style={{ color: "var(--muted-foreground)" }}>
                Alimenté par Mistral via OpenRouter. L'IA peut faire des erreurs.
              </p>
            </div>
          </div>
        )}

        {/* Profil idéal */}
        {tab === "idealProfile" && (
          <div className="p-6 max-w-6xl mx-auto space-y-6">
            {/* Formulaire */}
            <div className="p-6 rounded-2xl border bg-white" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" 
                  style={{ background: "var(--gold)" }}>
                  <UserPlus size={20} style={{ color: "var(--navy)" }} />
                </div>
                <div>
                  <h3 className="font-semibold" style={{ color: "var(--navy)" }}>Générer un profil idéal</h3>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    L'IA analyse votre projet et trouve les meilleurs freelancers dans notre base de données.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>
                    Nom du projet *
                  </label>
                  <input
                    type="text"
                    placeholder="Application mobile de livraison"
                    className={inputClass}
                    style={inputStyle}
                    value={recoForm.projet}
                    onChange={e => setRecoForm({ ...recoForm, projet: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>
                    Compétences requises *
                  </label>
                  <input
                    type="text"
                    placeholder="React, Node.js, MongoDB"
                    className={inputClass}
                    style={inputStyle}
                    value={recoForm.competences}
                    onChange={e => setRecoForm({ ...recoForm, competences: e.target.value })}
                  />
                  <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                    Séparez les compétences par des virgules.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>
                      Budget (FCFA)
                    </label>
                    <input
                      type="number"
                      placeholder="500000"
                      className={inputClass}
                      style={inputStyle}
                      value={recoForm.budget}
                      onChange={e => setRecoForm({ ...recoForm, budget: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>
                      Durée
                    </label>
                    <input
                      type="text"
                      placeholder="3 mois"
                      className={inputClass}
                      style={inputStyle}
                      value={recoForm.duree}
                      onChange={e => setRecoForm({ ...recoForm, duree: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>
                    Niveau requis
                  </label>
                  <select
                    className={inputClass}
                    style={inputStyle}
                    value={recoForm.niveau}
                    onChange={e => setRecoForm({ ...recoForm, niveau: e.target.value })}
                  >
                    <option value="junior">Junior (0-2 ans)</option>
                    <option value="intermediate">Intermédiaire (2-5 ans)</option>
                    <option value="senior">Senior (5+ ans)</option>
                    <option value="expert">Expert (8+ ans)</option>
                  </select>
                </div>

                <button
                  onClick={generateIdealProfile}
                  disabled={recoLoading || !recoForm.projet || !recoForm.competences}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: recoLoading || !recoForm.projet || !recoForm.competences 
                      ? "var(--secondary)" 
                      : "var(--navy)",
                    color: recoLoading || !recoForm.projet || !recoForm.competences 
                      ? "var(--muted-foreground)" 
                      : "#FFF",
                  }}
                >
                  {recoLoading ? (
                    <><Loader2 size={18} className="animate-spin" /> Génération en cours...</>
                  ) : (
                    <><Sparkles size={18} /> Générer le profil idéal</>
                  )}
                </button>
              </div>
            </div>

            {/* Résultat IA */}
            {recoResult && (
              <div className="p-6 rounded-2xl border bg-white" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold" style={{ color: "var(--navy)" }}>
                    <Sparkles size={16} style={{ color: "var(--gold)" }} /> Profil idéal généré
                  </h4>
                  <button
                    onClick={() => navigator.clipboard.writeText(recoResult)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border"
                    style={{ borderColor: "var(--border)", color: "var(--navy)" }}
                  >
                    <Copy size={12} /> Copier
                  </button>
                </div>
                <div
                  className="p-4 rounded-xl text-sm leading-relaxed whitespace-pre-line overflow-y-auto max-h-96"
                  style={{ background: "var(--secondary)", color: "var(--foreground)" }}
                >
                  {recoResult}
                </div>
              </div>
            )}

            {/* Grille des freelancers trouvés */}
            {freelancersTrouves.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" 
                      style={{ background: "var(--gold)" }}>
                      <Users size={20} style={{ color: "var(--navy)" }} />
                    </div>
                    <div>
                      <h4 className="font-semibold" style={{ color: "var(--navy)" }}>
                        {freelancersTrouves.length} freelancer{freelancersTrouves.length > 1 ? "s" : ""} disponible{freelancersTrouves.length > 1 ? "s" : ""}
                      </h4>
                      <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                        Correspondent à vos critères dans la base de données free-kaolo.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full" 
                    style={{ background: "var(--secondary)", color: "var(--navy)" }}>
                    <CheckCircle size={12} className="inline mr-1" /> 
                    {freelancersTrouves.length} trouvé{freelancersTrouves.length > 1 ? "s" : ""}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {freelancersTrouves.map((f: any) => {
                    const id = f.freelancerId;
                    const prenom = f.prenom || "Prénom";
                    const nom = f.nom || "Nom";
                    const specialite = f.specialite || "Spécialité";
                    const competences = f.competences || [];
                    const noteMoyenne = f.note || 0;
                    const tarifJournalier = f.tarif || 0;
                    const disponibilite = f.disponibilite || "Non renseigné";
                    const ville = f.ville || "Localisation";
                    const scoreIA = f.scoreIA || 0;
                    const nombreAvis = f.nombreAvis ?? 0;

                    return (
                      <Link
                        key={id}
                        to={`/enterprise/freelancer/${id}`}
                        className="group block p-5 rounded-2xl border bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                        style={{ borderColor: "var(--border)" }}
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold flex-shrink-0"
                            style={{ background: "var(--gold)", color: "var(--navy)" }}
                          >
                            {prenom[0]}{nom[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-semibold text-base truncate" style={{ color: "var(--navy)" }}>
                              {prenom} {nom}
                            </h5>
                            <div className="flex items-center gap-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
                              <Briefcase size={14} className="flex-shrink-0" />
                              <span className="truncate">{specialite}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-3 border-t" 
                          style={{ borderColor: "var(--border)" }}>
                          <div className="flex items-center gap-1">
                            <Star size={16} className="fill-current" style={{ color: "var(--gold)" }} />
                            <span className="font-semibold" style={{ color: "var(--navy)" }}>
                              {noteMoyenne.toFixed(1)}
                            </span>
                            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                              ({nombreAvis} avis)
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                            style={{ 
                              background: disponibilite === "Disponible" || disponibilite === true ? "#DCFCE7" : "#FEE2E2",
                              color: disponibilite === "Disponible" || disponibilite === true ? "#166534" : "#991B1B"
                            }}>
                            <Clock size={12} />
                            {typeof disponibilite === 'boolean' ? (disponibilite ? "Disponible" : "Indisponible") : disponibilite}
                          </div>
                        </div>

                        {competences.length > 0 && (
                          <div className="mt-3">
                            <div className="flex flex-wrap gap-1.5">
                              {competences.slice(0, 4).map((c: string, i: number) => (
                                <span key={i} className="px-2.5 py-1 rounded-full text-xs font-medium"
                                  style={{ background: "var(--secondary)", color: "var(--navy)" }}>
                                  <Code size={10} className="inline mr-1" />
                                  {c}
                                </span>
                              ))}
                              {competences.length > 4 && (
                                <span className="px-2.5 py-1 rounded-full text-xs font-medium"
                                  style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}>
                                  +{competences.length - 4}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-3 pt-3 border-t" 
                          style={{ borderColor: "var(--border)" }}>
                          <div className="flex items-center gap-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
                            <MapPin size={14} />
                            <span>{ville}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-bold" style={{ color: "var(--navy)" }}>
                              {tarifJournalier > 0 ? `${tarifJournalier.toLocaleString()} FCFA` : "—"}
                            </p>
                            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                              par jour
                            </p>
                          </div>
                        </div>

                        <div className="mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold"
                          style={{ background: "#DCFCE7", color: "#166534" }}>
                          Score IA : {scoreIA}%
                        </div>

                        <div className="mt-3 pt-3 border-t text-center" style={{ borderColor: "var(--border)" }}>
                          <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ color: "var(--navy)" }}>
                            Voir le profil complet →
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {freelancersTrouves.length === 0 && recoResult && (
              <div className="p-6 rounded-2xl border" style={{ background: "#FEFCE8", borderColor: "#FDE047" }}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "#FEF3C7" }}>
                    <Users size={20} style={{ color: "#D97706" }} />
                  </div>
                  <div>
                    <h5 className="font-semibold" style={{ color: "var(--navy)" }}>
                      Aucun freelancer trouvé
                    </h5>
                    <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                      Aucun freelancer ne correspond exactement à vos critères dans la base de données.
                      <br />
                      Suggestions : élargissez vos critères, modifiez les compétences requises, ou publiez une offre.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Rapports */}
        {tab === "reports" && (
          <div className="p-6 max-w-3xl mx-auto space-y-6">
            <div className="p-6 rounded-2xl border bg-white" style={{ borderColor: "var(--border)" }}>
              <h3 className="font-semibold mb-4" style={{ color: "var(--navy)" }}>Générer un rapport</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "recruitment", label: "Rapport recrutement", icon: <Users size={16} /> },
                    { id: "budget", label: "Analyse budgétaire", icon: <BarChart2 size={16} /> },
                    { id: "performance", label: "Performance projets", icon: <TrendingUp size={16} /> },
                    { id: "roi", label: "ROI projets freelance", icon: <Star size={16} /> },
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: "var(--navy)" }}>Début</label>
                    <input type="date" className={inputClass} style={inputStyle}
                      value={dateDebut} onChange={e => setDateDebut(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: "var(--navy)" }}>Fin</label>
                    <input type="date" className={inputClass} style={inputStyle}
                      value={dateFin} onChange={e => setDateFin(e.target.value)} />
                  </div>
                </div>

                <button onClick={generateReport} disabled={reportLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
                  style={{ background: "var(--navy)", color: "#FFF" }}>
                  {reportLoading
                    ? <><Loader2 size={16} className="animate-spin" /> Génération...</>
                    : <><Sparkles size={16} /> Générer le rapport IA</>}
                </button>
              </div>
            </div>

            {reportContent && (
              <div className="p-6 rounded-2xl border bg-white" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold" style={{ color: "var(--navy)" }}>Rapport généré</h3>
                  <div className="flex gap-2">
                    <button onClick={() => navigator.clipboard.writeText(reportContent)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border"
                      style={{ borderColor: "var(--border)", color: "var(--navy)" }}>
                      <Copy size={12} /> Copier
                    </button>
                    <button onClick={() => {
                        const blob = new Blob([reportContent], { type: "text/markdown" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url; a.download = `rapport_${reportType}.md`; a.click();
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium"
                      style={{ background: "var(--navy)", color: "#FFF" }}>
                      <Download size={12} /> .md
                    </button>
                  </div>
                </div>
                <div className="p-4 rounded-xl text-sm leading-relaxed whitespace-pre-line overflow-y-auto max-h-96"
                  style={{ background: "var(--secondary)", color: "var(--foreground)" }}>
                  {reportContent}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Analyse marché */}
        {tab === "analysis" && (
          <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { key: "market", title: "Marché freelance", icon: <TrendingUp size={20} />, color: "#DBEAFE" },
                { key: "budget", title: "Guide budgétaire", icon: <BarChart2 size={20} />, color: "#F0FDF4" },
                { key: "risk", title: "Gestion des risques", icon: <Sparkles size={20} />, color: "#FEF9C3" },
                { key: "trends", title: "Tendances 2026", icon: <Star size={20} />, color: "#F3E8FF" },
              ].map(card => (
                <div key={card.key} className="p-5 rounded-2xl border bg-white" style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: card.color }}>
                        <span style={{ color: "var(--navy)" }}>{card.icon}</span>
                      </div>
                      <h4 className="font-semibold" style={{ color: "var(--navy)" }}>{card.title}</h4>
                    </div>
                    <button onClick={() => generateAnalysis(card.key)}
                      disabled={analysisLoading === card.key}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium"
                      style={{ background: "var(--secondary)", color: "var(--navy)" }}>
                      {analysisLoading === card.key
                        ? <Loader2 size={12} className="animate-spin" />
                        : <RefreshCw size={12} />}
                      Générer
                    </button>
                  </div>
                  {analyses[card.key] ? (
                    <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
                      {analyses[card.key]}
                    </p>
                  ) : (
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                      Cliquez sur "Générer" pour une analyse IA personnalisée.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}