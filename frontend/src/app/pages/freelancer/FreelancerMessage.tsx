
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Search,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  Users,
  Plus,
  Image,
  File,
  Smile,
  Check,
  CheckCheck,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
} from "lucide-react";

 // TODO: ajustez le chemin réel
import {
  fetchConversations,
  fetchMessages,
  sendMessageApi,
  markConversationRead,
  type ConversationSummaryApi,
  type MessageApi,
} from "../../../services/messagingService"; // TODO: ajustez le chemin réel
import { useAuth } from "../../../hooks/useAuth";

// Accusé de lecture — à terme, à remonter dans le design system comme token `--info`.
const READ_RECEIPT_COLOR = "#2563EB";
// Échec d'envoi — à remonter comme token `--danger`.
const ERROR_COLOR = "#DC2626";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[var(--navy)]";

// Fréquence de rafraîchissement des messages en l'absence de canal temps
// réel (WebSocket/STOMP). À remplacer si un canal temps réel est branché,
// comme sur la précédente version Angular du produit.
const POLL_INTERVAL_MS = 5000;

type MessageStatus = "sending" | "sent" | "read" | "error";
type UiMessage = {
  id: number | string; // string pour les messages optimistes non confirmés par le serveur
  from: "me" | "them";
  text: string;
  time: string;
  status?: MessageStatus; // uniquement pertinent pour les messages "me"
  senderName?: string;
};
type UiConversation = ConversationSummaryApi & { avatar: string };

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function errorMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

// ── Sous-composants ──────────────────────────────────────────────────────────

function MessageStatusIcon({ status }: { status: Exclude<MessageStatus, "error"> }) {
  if (status === "sending") {
    return <Clock size={13} style={{ color: "var(--muted-foreground)" }} aria-label="Envoi en cours" />;
  }
  if (status === "read") {
    return <CheckCheck size={13} style={{ color: READ_RECEIPT_COLOR }} aria-label="Lu" />;
  }
  return <Check size={13} style={{ color: "var(--muted-foreground)" }} aria-label="Envoyé" />;
}

function ConversationListSkeleton() {
  return (
    <div className="p-4 space-y-4" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-3 animate-pulse">
          <div className="w-11 h-11 rounded-xl shrink-0" style={{ background: "var(--secondary)" }} />
          <div className="flex-1 space-y-2">
            <div className="h-3 rounded" style={{ background: "var(--secondary)", width: "55%" }} />
            <div className="h-2.5 rounded" style={{ background: "var(--secondary)", width: "80%" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function MessagesSkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"} animate-pulse`}>
          <div
            className="h-10 rounded-2xl"
            style={{ background: "var(--card)", width: `${140 + i * 30}px` }}
          />
        </div>
      ))}
    </div>
  );
}

// ── Composant principal ──────────────────────────────────────────────────────

export function FreelancerMessage() {
  const { user } = useAuth();
  const currentUserId = user?.userId ?? null;

  const [conversations, setConversations] = useState<ConversationSummaryApi[]>([]);
  const [convLoading, setConvLoading] = useState(true);
  const [convError, setConvError] = useState<string | null>(null);
  const [activeConvId, setActiveConvId] = useState<number | null>(null);

  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [msgError, setMsgError] = useState<string | null>(null);

  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [showAttach, setShowAttach] = useState(false);
  const [showQuick, setShowQuick] = useState(false);
  const [convTab, setConvTab] = useState<"Tous" | "Non lus" | "Groupes">("Tous");
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [announcement, setAnnouncement] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv: UiConversation | null = (() => {
    const conv = conversations.find((c) => c.id === activeConvId);
    return conv ? { ...conv, avatar: initials(conv.name) } : null;
  })();

  const toUiMessage = useCallback(
    (m: MessageApi): UiMessage => ({
      id: m.id,
      from: currentUserId !== null && m.senderId === currentUserId ? "me" : "them",
      text: m.content,
      time: formatTime(m.createdAt),
      status: m.read ? "read" : "sent",
      senderName: m.senderName,
    }),
    [currentUserId]
  );

  // ── Chargement des conversations ──────────────────────────────────────────

  const loadConversations = useCallback(() => {
    setConvLoading(true);
    setConvError(null);
    fetchConversations()
      .then((data) => {
        setConversations(data);
        setConvLoading(false);
      })
      .catch((err) => {
        setConvError(errorMessage(err, "Impossible de charger vos conversations."));
        setConvLoading(false);
      });
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (!convLoading && !convError && conversations.length > 0 && activeConvId === null) {
      setActiveConvId(conversations[0].id);
    }
  }, [convLoading, convError, conversations, activeConvId]);

  // ── Chargement + rafraîchissement des messages ────────────────────────────

  const loadMessages = useCallback(
    (conversationId: number, opts: { silent?: boolean } = {}) => {
      if (!opts.silent) {
        setMsgLoading(true);
        setMsgError(null);
      }
      fetchMessages(conversationId)
        .then((data) => {
          setMessages((prev) => {
            // Conserve les messages optimistes ("sending"/"error") pas encore confirmés par le serveur.
            const pending = prev.filter((m) => typeof m.id === "string");
            return [...data.map(toUiMessage), ...pending];
          });
          if (!opts.silent) setMsgLoading(false);
        })
        .catch((err) => {
          if (!opts.silent) {
            setMsgError(errorMessage(err, "Impossible de charger les messages."));
            setMsgLoading(false);
          }
        });
    },
    [toUiMessage]
  );

  useEffect(() => {
    if (activeConvId === null) return;
    loadMessages(activeConvId);
    markConversationRead(activeConvId).catch(() => {
      // Non bloquant pour l'affichage : le compteur non-lu se remettra à jour au prochain chargement.
    });
  }, [activeConvId, loadMessages]);

  useEffect(() => {
    if (activeConvId === null) return;
    const interval = setInterval(() => loadMessages(activeConvId, { silent: true }), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [activeConvId, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const last = messages[messages.length - 1];
    if (last?.from === "them" && activeConv) {
      setAnnouncement(`Nouveau message de ${activeConv.name} : ${last.text}`);
    }
  }, [messages, activeConv]);

  // ── Envoi de message (optimiste + retry) ──────────────────────────────────

  const pushOptimistic = (content: string): string => {
    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        from: "me",
        text: content,
        time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        status: "sending",
      },
    ]);
    return tempId;
  };

  const confirmSent = (localId: string | number, saved: MessageApi) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === localId
          ? {
              id: saved.id,
              from: "me" as const,
              text: saved.content,
              time: formatTime(saved.createdAt),
              status: saved.read ? "read" : ("sent" as const),
            }
          : m
      )
    );
  };

  const markFailed = (localId: string | number) => {
    setMessages((prev) => prev.map((m) => (m.id === localId ? { ...m, status: "error" as const } : m)));
  };

  const sendMessage = async () => {
    if (!input.trim() || !activeConv) return;
    const content = input.trim();
    setInput("");
    setShowQuick(false);
    const tempId = pushOptimistic(content);
    try {
      const saved = await sendMessageApi(activeConv.id, content);
      confirmSent(tempId, saved);
    } catch {
      markFailed(tempId);
    }
  };

  const retrySend = async (failed: UiMessage) => {
    if (!activeConv) return;
    setMessages((prev) => prev.map((m) => (m.id === failed.id ? { ...m, status: "sending" } : m)));
    try {
      const saved = await sendMessageApi(activeConv.id, failed.text);
      confirmSent(failed.id, saved);
    } catch {
      markFailed(failed.id);
    }
  };

  const openConversation = (conv: ConversationSummaryApi) => {
    setActiveConvId(conv.id);
    setMobileView("chat");
  };

  const uiConversations: UiConversation[] = conversations.map((c) => ({ ...c, avatar: initials(c.name) }));

  const filteredConvs = uiConversations
    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    .filter((c) => {
      if (convTab === "Non lus") return c.unreadCount > 0;
      if (convTab === "Groupes") return c.type === "GROUP";
      return true;
    });

  const totalUnread = conversations.reduce((s, c) => s + c.unreadCount, 0);

  return (
    <div className="flex h-full min-h-0 overflow-hidden">
      {/* Conversations list — colonne scroll indépendante */}
      <div
        className={`${mobileView === "chat" ? "hidden" : "flex"} md:flex w-full md:w-80 flex-shrink-0 flex-col min-h-0 border-r bg-white`}
        style={{ borderColor: "var(--border)" }}
      >
        <div className="p-4 border-b shrink-0" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="font-bold" style={{ color: "var(--navy)" }}>
                Messages
              </h3>
              {totalUnread > 0 && (
                <span
                  className="px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white"
                  style={{ background: "var(--navy)" }}
                >
                  {totalUnread}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                className={`w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors ${FOCUS_RING}`}
                style={{ color: "var(--navy)" }}
                aria-label="Nouveau groupe"
              >
                <Users size={16} />
              </button>
              <button
                className={`w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors ${FOCUS_RING}`}
                style={{ color: "var(--navy)" }}
                aria-label="Nouvelle conversation"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher..."
              aria-label="Rechercher une conversation"
              className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-sm border outline-none ${FOCUS_RING}`}
              style={{ borderColor: "var(--border)", background: "var(--secondary)", color: "var(--foreground)" }}
            />
          </div>
        </div>

        <div className="flex border-b shrink-0" style={{ borderColor: "var(--border)" }}>
          {(["Tous", "Non lus", "Groupes"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setConvTab(t)}
              aria-pressed={convTab === t}
              className={`flex-1 py-2.5 text-xs font-medium border-b-2 transition-all ${FOCUS_RING}`}
              style={{
                borderColor: convTab === t ? "var(--navy)" : "transparent",
                color: convTab === t ? "var(--navy)" : "var(--muted-foreground)",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 overscroll-contain">
          {convLoading ? (
            <ConversationListSkeleton />
          ) : convError ? (
            <div className="flex flex-col items-center text-center gap-2 py-14 px-6">
              <AlertCircle size={22} style={{ color: ERROR_COLOR }} />
              <p className="text-sm font-medium" style={{ color: "var(--navy)" }}>
                Impossible de charger vos conversations
              </p>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                {convError}
              </p>
              <button
                onClick={loadConversations}
                className={`text-xs font-medium underline mt-1 ${FOCUS_RING}`}
                style={{ color: "var(--navy)" }}
              >
                Réessayer
              </button>
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center text-center gap-2 py-14 px-6">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}
              >
                <MessageSquare size={18} />
              </div>
              <p className="text-sm font-medium" style={{ color: "var(--navy)" }}>
                Aucune conversation pour le moment
              </p>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                Vos échanges avec les entreprises et freelances apparaîtront ici.
              </p>
            </div>
          ) : filteredConvs.length === 0 ? (
            <div className="flex flex-col items-center text-center gap-2 py-14 px-6">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}
              >
                <Search size={18} />
              </div>
              <p className="text-sm font-medium" style={{ color: "var(--navy)" }}>
                Aucune conversation trouvée
              </p>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                Essayez un autre nom, ou changez d'onglet.
              </p>
            </div>
          ) : (
            filteredConvs.map((conv) => (
              <button
                key={conv.id}
                onClick={() => openConversation(conv)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors text-left border-b ${FOCUS_RING}`}
                style={{
                  borderColor: "var(--border)",
                  background: activeConvId === conv.id ? "var(--secondary)" : "transparent",
                }}
              >
                <div className="relative flex-shrink-0">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xs font-bold"
                    style={{ background: "var(--secondary)", color: "var(--navy)" }}
                  >
                    {conv.avatar}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-semibold truncate" style={{ color: "var(--navy)" }}>
                      {conv.name}
                    </span>
                    <span className="text-xs flex-shrink-0" style={{ color: "var(--muted-foreground)" }}>
                      {conv.lastMessageAt ? formatTime(conv.lastMessageAt) : ""}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs truncate" style={{ color: "var(--muted-foreground)" }}>
                      {conv.lastMessage ?? "Aucun message"}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span
                        className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: "var(--navy)" }}
                      >
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat area — colonne scroll indépendante */}
      <div className={`${mobileView === "list" ? "hidden" : "flex"} md:flex flex-1 flex-col min-w-0 min-h-0`}>
        {!activeConv ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center px-6" style={{ background: "var(--secondary)" }}>
            <MessageSquare size={22} style={{ color: "var(--muted-foreground)" }} />
            <p className="text-sm font-medium" style={{ color: "var(--navy)" }}>
              {convLoading ? "Chargement..." : "Sélectionnez une conversation"}
            </p>
          </div>
        ) : (
          <>
            {/* Chat header (fixe) */}
            <div className="flex items-center gap-3 px-4 md:px-5 py-3.5 border-b bg-white shrink-0" style={{ borderColor: "var(--border)" }}>
              <button
                onClick={() => setMobileView("list")}
                className={`md:hidden p-1.5 -ml-1.5 rounded-lg hover:bg-slate-100 transition-colors ${FOCUS_RING}`}
                aria-label="Retour aux conversations"
              >
                <ArrowLeft size={19} style={{ color: "var(--navy)" }} />
              </button>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold"
                style={{ background: "var(--secondary)", color: "var(--navy)" }}
              >
                {activeConv.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate" style={{ color: "var(--navy)" }}>
                  {activeConv.name}
                </p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                  {activeConv.type === "GROUP" ? `Groupe · ${activeConv.memberCount ?? "?"} membres` : "Conversation privée"}
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-1">
                <button className={`p-2 rounded-lg hover:bg-slate-100 transition-colors ${FOCUS_RING}`} aria-label="Appeler">
                  <Phone size={18} style={{ color: "var(--navy)" }} />
                </button>
                <button className={`p-2 rounded-lg hover:bg-slate-100 transition-colors ${FOCUS_RING}`} aria-label="Appel vidéo">
                  <Video size={18} style={{ color: "var(--navy)" }} />
                </button>
              </div>
              <button className={`p-2 rounded-lg hover:bg-slate-100 transition-colors ${FOCUS_RING}`} aria-label="Plus d'options">
                <MoreVertical size={18} style={{ color: "var(--navy)" }} />
              </button>
            </div>

            {/* Messages — seule cette zone défile */}
            <div className="flex-1 overflow-y-auto min-h-0 overscroll-contain p-4 md:p-5 space-y-4" style={{ background: "var(--secondary)" }}>
              <div aria-live="polite" className="sr-only">
                {announcement}
              </div>

              {msgLoading ? (
                <MessagesSkeleton />
              ) : msgError ? (
                <div className="flex flex-col items-center text-center gap-2 py-10 px-6">
                  <AlertCircle size={20} style={{ color: ERROR_COLOR }} />
                  <p className="text-sm font-medium" style={{ color: "var(--navy)" }}>
                    Impossible de charger les messages
                  </p>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    {msgError}
                  </p>
                  <button
                    onClick={() => loadMessages(activeConv.id)}
                    className={`text-xs font-medium underline mt-1 ${FOCUS_RING}`}
                    style={{ color: "var(--navy)" }}
                  >
                    Réessayer
                  </button>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center text-center gap-2 py-10 px-6">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: "var(--card)", color: "var(--muted-foreground)" }}
                  >
                    <MessageSquare size={18} />
                  </div>
                  <p className="text-sm font-medium" style={{ color: "var(--navy)" }}>
                    Aucun message pour l'instant
                  </p>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    Écrivez le premier message à {activeConv.name}.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                    <span className="text-xs px-3 py-1 rounded-full" style={{ background: "var(--card)", color: "var(--muted-foreground)" }}>
                      Conversation
                    </span>
                    <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                  </div>

                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}>
                      {msg.from === "them" && (
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold mr-2.5 flex-shrink-0 self-end"
                          style={{ background: "var(--card)", color: "var(--navy)" }}
                        >
                          {activeConv.avatar}
                        </div>
                      )}
                      <div className="max-w-[85%] sm:max-w-sm">
                        {msg.from === "them" && activeConv.type === "GROUP" && msg.senderName && (
                          <span className="text-xs font-medium mb-1 block" style={{ color: "var(--navy)" }}>
                            {msg.senderName}
                          </span>
                        )}
                        <div
                          className="px-4 py-3 rounded-2xl text-sm whitespace-pre-line leading-relaxed"
                          style={{
                            background: msg.from === "me" ? "var(--navy)" : "var(--card)",
                            color: msg.from === "me" ? "#FFF" : "var(--foreground)",
                            borderBottomRightRadius: msg.from === "me" ? 4 : undefined,
                            borderBottomLeftRadius: msg.from === "them" ? 4 : undefined,
                            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                            opacity: msg.status === "error" ? 0.6 : 1,
                          }}
                        >
                          {msg.text}
                        </div>
                        <div className={`flex items-center gap-1 mt-1 ${msg.from === "me" ? "justify-end" : "justify-start"}`}>
                          <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                            {msg.time}
                          </span>
                          {msg.from === "me" && msg.status && msg.status !== "error" && <MessageStatusIcon status={msg.status} />}
                        </div>
                        {msg.status === "error" && (
                          <button
                            onClick={() => retrySend(msg)}
                            className={`text-xs mt-1 underline block ${FOCUS_RING}`}
                            style={{ color: ERROR_COLOR }}
                          >
                            Échec de l'envoi — réessayer
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick responses */}
            {showQuick && (
              <div className="px-4 py-2 border-t shrink-0 flex gap-2 overflow-x-auto" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
                {[
                  { text: "Bien reçu !", icon: null },
                  { text: "Je reviens vers vous sous peu.", icon: null },
                  { text: "Pouvez-vous préciser ?", icon: null },
                  { text: "C'est en cours.", icon: Clock },
                  { text: "Confirmé", icon: CheckCircle2 },
                ].map((q) => (
                  <button
                    key={q.text}
                    onClick={() => {
                      setInput(q.text);
                      setShowQuick(false);
                    }}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border hover:bg-slate-50 transition-colors ${FOCUS_RING}`}
                    style={{ borderColor: "var(--border)", color: "var(--navy)" }}
                  >
                    {q.icon && <q.icon size={12} />}
                    {q.text}
                  </button>
                ))}
              </div>
            )}

            {/* Attachment picker */}
            {showAttach && (
              <div className="px-4 py-3 border-t shrink-0" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
                <div className="flex gap-3">
                  {[
                    { icon: Image, label: "Photo" },
                    { icon: File, label: "Document" },
                  ].map((a) => (
                    <button
                      key={a.label}
                      className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl border hover:border-slate-300 transition-colors ${FOCUS_RING}`}
                      style={{ borderColor: "var(--border)", background: "var(--secondary)" }}
                    >
                      <a.icon size={18} style={{ color: "var(--navy)" }} />
                      <span className="text-xs font-medium" style={{ color: "var(--navy)" }}>
                        {a.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input (fixe) */}
            <div className="px-3 md:px-4 py-3 md:py-4 border-t shrink-0 bg-white" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-end gap-2 md:gap-3">
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setShowAttach(!showAttach);
                      setShowQuick(false);
                    }}
                    className={`p-2.5 rounded-xl hover:bg-slate-100 transition-colors ${FOCUS_RING}`}
                    style={{ color: "var(--navy)" }}
                    aria-label="Joindre un fichier"
                  >
                    <Paperclip size={18} />
                  </button>
                  <button
                    onClick={() => {
                      setShowQuick(!showQuick);
                      setShowAttach(false);
                    }}
                    className={`p-2.5 rounded-xl hover:bg-slate-100 transition-colors ${FOCUS_RING}`}
                    style={{ color: "var(--navy)" }}
                    aria-label="Réponses rapides"
                  >
                    <Smile size={18} />
                  </button>
                </div>
                <div className="flex-1 relative">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Écrire un message..."
                    aria-label="Écrire un message"
                    rows={1}
                    className={`w-full px-4 py-3 rounded-xl text-sm border outline-none resize-none ${FOCUS_RING}`}
                    style={{
                      borderColor: "var(--border)",
                      background: "var(--secondary)",
                      color: "var(--foreground)",
                      maxHeight: "120px",
                      overflowY: "auto",
                    }}
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className={`p-3 rounded-xl flex-shrink-0 transition-all disabled:cursor-not-allowed ${FOCUS_RING}`}
                  style={{
                    background: input.trim() ? "var(--navy)" : "var(--secondary)",
                    color: input.trim() ? "#FFF" : "var(--muted-foreground)",
                  }}
                  aria-label="Envoyer"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}