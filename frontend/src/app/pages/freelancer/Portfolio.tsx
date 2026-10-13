// src/app/pages/freelancer/Portfolio.tsx
import { useEffect, useState, useMemo, useRef } from "react";
import {
  Plus, ExternalLink, Edit3, Trash2, Upload, X, Star, Loader2,
  Code2, ShoppingCart, Landmark, HeartPulse, Building2, Smartphone,
  Users, Palette, Wrench, BarChart3, FolderOpen, AlertCircle,
  LayoutGrid, Cloud, Webhook, type LucideIcon,
} from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import {
  portfolioService,
  type PortfolioItem,
  type PortfolioFormData,
} from "../../../services/portfolioService";

const CATEGORIES = ["Tous", "Web App", "Mobile", "Fintech", "SaaS", "API"];

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "Tous": LayoutGrid,
  "Web App": Code2,
  "Mobile": Smartphone,
  "Fintech": Landmark,
  "SaaS": Cloud,
  "API": Webhook,
};

const COLORS = ["#E0F2FE", "#F0FDF4", "#FDF4FF", "#FFFBEB", "#FEF2F2", "#F0F9FF"];

// Sélecteur d'icône : remplace l'ancien tableau d'emojis.
// "key" est la valeur stockée en base (champ `icone`), l'icône Lucide n'est utilisée que côté affichage.
const ICON_OPTIONS: { key: string; label: string; Icon: LucideIcon }[] = [
  { key: "code",     label: "Web",        Icon: Code2 },
  { key: "cart",     label: "E-commerce", Icon: ShoppingCart },
  { key: "bank",     label: "Fintech",    Icon: Landmark },
  { key: "health",   label: "Santé",      Icon: HeartPulse },
  { key: "building", label: "Immobilier", Icon: Building2 },
  { key: "mobile",   label: "Mobile",     Icon: Smartphone },
  { key: "users",    label: "Communauté", Icon: Users },
  { key: "design",   label: "Design",     Icon: Palette },
  { key: "tools",    label: "Outils",     Icon: Wrench },
  { key: "chart",    label: "Data",       Icon: BarChart3 },
];

function getIcon(key: string): LucideIcon {
  return ICON_OPTIONS.find((o) => o.key === key)?.Icon ?? Code2;
}

const inputClass = "w-full px-4 py-3 rounded-xl text-sm border outline-none transition-all";
const inputStyle = {
  borderColor: "var(--border)",
  background:  "var(--card)",
  color:       "var(--foreground)",
};

// ── Composant ─────────────────────────────────────────────────────────────────

export function Portfolio() {
  const { user } = useAuth();
  const freelancerId = user?.userId;

  const [items,          setItems]          = useState<PortfolioItem[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [showModal,      setShowModal]      = useState(false);
  const [editItem,       setEditItem]       = useState<PortfolioItem | null>(null);
  const [saving,         setSaving]         = useState(false);
  const [deleteTarget,   setDeleteTarget]   = useState<PortfolioItem | null>(null);
  const [deleting,       setDeleting]       = useState(false);
const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);

  // Upload d'image
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError,     setImageError]     = useState<string | null>(null);
  const [dragActive,     setDragActive]     = useState(false);

  const [form, setForm] = useState<{
    titre: string; description: string; tech: string;
    categorie: string; annee: string; icone: string; couleur: string;
    imageUrl?: string;
  }>({
    titre: "", description: "", tech: "",
    categorie: "Web App", annee: String(new Date().getFullYear()),
    icone: "code", couleur: "#E0F2FE", imageUrl: undefined,
  });

  // ── Chargement ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!freelancerId) return;
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await portfolioService.getAll(freelancerId);
        setItems(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [freelancerId]);

  // ── Filtrage ──────────────────────────────────────────────────────────────

  const filtered = useMemo(() =>
    activeCategory === "Tous"
      ? items
      : items.filter(p => p.categorie === activeCategory),
    [items, activeCategory]
  );

  const featured    = items.filter(p => p.featured);
  const nonFeatured = filtered.filter(p => activeCategory !== "Tous" || !p.featured);

  // ── Actions ───────────────────────────────────────────────────────────────

  const openAdd = () => {
    setEditItem(null);
    setImageError(null);
    setForm({
      titre: "", description: "", tech: "",
      categorie: "Web App", annee: String(new Date().getFullYear()),
      icone: "code", couleur: "#E0F2FE", imageUrl: undefined,
    });
    setShowModal(true);
  };

  const openEdit = (item: PortfolioItem) => {
    setEditItem(item);
    setImageError(null);
    setForm({
      titre:       item.titre,
      description: item.description,
      tech:        item.technologies.join(", "),
      categorie:   item.categorie,
      annee:       item.annee,
      icone:       item.icone,
      couleur:     item.couleur,
      imageUrl:    item.imageUrl,
    });
    setShowModal(true);
  };

  // ── Upload d'image ───────────────────────────────────────────────────────

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setImageError(null);

    if (!file.type.startsWith("image/")) {
      setImageError("Format non supporté. Utilise une image (jpg, png, webp, gif).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError("L'image dépasse 5 Mo. Choisis un fichier plus léger.");
      return;
    }

    setUploadingImage(true);
    try {
      const { url } = await portfolioService.uploadImage(file);
      setForm(f => ({ ...f, imageUrl: url }));
    } catch (err) {
      console.error("Erreur upload image:", err);
      setImageError("L'envoi de l'image a échoué. Réessaie.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setForm(f => ({ ...f, imageUrl: undefined }));
    setImageError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async () => {
    if (!freelancerId || !form.titre.trim()) return;
    setSaving(true);
    try {
      const payload: PortfolioFormData = {
        titre:        form.titre,
        description:  form.description,
        technologies: form.tech.split(",").map(t => t.trim()).filter(Boolean),
        categorie:    form.categorie,
        annee:        form.annee,
        icone:        form.icone,
        couleur:      form.couleur,
        imageUrl:     form.imageUrl,
        featured:     editItem?.featured ?? false,
      };

      if (editItem) {
        const updated = await portfolioService.update(editItem.id, payload);
        setItems(prev => prev.map(x => x.id === editItem.id ? updated : x));
      } else {
        const created = await portfolioService.create(freelancerId, payload);
        setItems(prev => [created, ...prev]);
      }
      setShowModal(false);
    } catch (err) {
      console.error("Erreur sauvegarde portfolio:", err);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await portfolioService.delete(deleteTarget.id);
      setItems(prev => prev.filter(x => x.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error("Erreur suppression:", err);
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleFeatured = async (item: PortfolioItem) => {
    try {
      const updated = await portfolioService.toggleFeatured(item.id, !item.featured);
      setItems(prev => prev.map(x => x.id === item.id ? updated : x));
    } catch (err) {
      console.error("Erreur toggle featured:", err);
    }
  };

  // ── Rendu ─────────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="flex items-center justify-center p-16">
      <Loader2 size={28} className="animate-spin" style={{ color: "var(--navy)" }} />
    </div>
  );

  if (error) return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 p-4 rounded-xl border" style={{ borderColor: "var(--destructive)", background: "#FEF2F2" }}>
        <AlertCircle size={18} style={{ color: "var(--destructive)" }} />
        <p className="text-sm font-medium" style={{ color: "var(--destructive)" }}>{error}</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--navy)" }}>Mon portfolio</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            {items.length} projet{items.length > 1 ? "s" : ""} réalisé{items.length > 1 ? "s" : ""}
          </p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: "var(--navy)", color: "#FFF" }}>
          <Plus size={16} /> Ajouter un projet
        </button>
      </div>

      {/* ── Filtres catégorie ── */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(cat => {
          const CatIcon = CATEGORY_ICONS[cat];
          const active = activeCategory === cat;
          return (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all border"
              style={{
                background:  active ? "var(--navy)" : "var(--card)",
                color:       active ? "#FFF" : "var(--muted-foreground)",
                borderColor: active ? "var(--navy)" : "var(--border)",
              }}>
              {CatIcon && <CatIcon size={14} />}
              {cat}
            </button>
          );
        })}
      </div>

      {/* ── Featured ── */}
      {activeCategory === "Tous" && featured.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"
            style={{ color: "var(--navy)" }}>
            <Star size={14} style={{ color: "var(--gold)" }} fill="var(--gold)" />
            Projets mis en avant
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featured.map(p => {
              const Icon = getIcon(p.icone);
              return (
                <div key={p.id}
                  className="rounded-2xl border bg-white overflow-hidden hover:shadow-lg transition-shadow group"
                  style={{ borderColor: "var(--border)" }}>
                  <div className="h-36 flex items-center justify-center relative overflow-hidden"
                    style={{ background: p.imageUrl ? undefined : p.couleur }}>
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Icon size={48} style={{ color: "var(--navy)" }} strokeWidth={1.5} />
                    )}
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(p)}
                        className="p-1.5 rounded-lg bg-white/80 backdrop-blur-sm hover:bg-white"
                        aria-label="Modifier le projet">
                        <Edit3 size={13} style={{ color: "var(--navy)" }} />
                      </button>
                      <button className="p-1.5 rounded-lg bg-white/80 backdrop-blur-sm hover:bg-white"
                        aria-label="Ouvrir le lien du projet">
                        <ExternalLink size={13} style={{ color: "var(--navy)" }} />
                      </button>
                    </div>
                    <span className="absolute top-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-white/80 backdrop-blur-sm"
                      style={{ color: "var(--navy)" }}>
                      <Star size={11} fill="var(--gold)" style={{ color: "var(--gold)" }} />
                      Mis en avant
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold" style={{ color: "var(--navy)" }}>{p.titre}</h4>
                      <span className="text-xs px-2 py-0.5 rounded-full ml-2 flex-shrink-0"
                        style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}>
                        {p.annee}
                      </span>
                    </div>
                    <p className="text-sm mb-3" style={{ color: "var(--muted-foreground)" }}>{p.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {p.technologies.map(t => (
                        <span key={t} className="px-2 py-0.5 rounded-md text-xs font-medium"
                          style={{ background: "var(--secondary)", color: "var(--navy)" }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Grille principale ── */}
      <div>
        {activeCategory === "Tous" && nonFeatured.length > 0 && (
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--navy)" }}>
            Tous les projets
          </h3>
        )}

        {nonFeatured.length === 0 && items.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: "var(--secondary)" }}>
              <FolderOpen size={26} style={{ color: "var(--navy)" }} />
            </div>
            <p className="font-semibold" style={{ color: "var(--navy)" }}>Portfolio vide</p>
            <p className="text-sm mt-1 mb-4" style={{ color: "var(--muted-foreground)" }}>
              Ajoutez vos projets pour attirer des clients
            </p>
            <button onClick={openAdd}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: "var(--navy)", color: "#FFF" }}>
              Ajouter un premier projet
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nonFeatured.map(p => {
              const Icon = getIcon(p.icone);
              return (
                <div key={p.id}
                  className="rounded-2xl border bg-white overflow-hidden hover:shadow-lg transition-shadow group"
                  style={{ borderColor: "var(--border)" }}>
                  <div className="h-28 flex items-center justify-center relative overflow-hidden"
                    style={{ background: p.imageUrl ? undefined : p.couleur }}>
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Icon size={34} style={{ color: "var(--navy)" }} strokeWidth={1.5} />
                    )}
                    <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleToggleFeatured(p)}
                        className="p-1.5 rounded-lg bg-white/80 backdrop-blur-sm hover:bg-white"
                        aria-label={p.featured ? "Retirer de la mise en avant" : "Mettre en avant"}>
                        <Star size={12}
                          style={{ color: p.featured ? "var(--gold)" : "var(--navy)" }}
                          fill={p.featured ? "var(--gold)" : "none"} />
                      </button>
                      <button onClick={() => openEdit(p)}
                        className="p-1.5 rounded-lg bg-white/80 backdrop-blur-sm hover:bg-white"
                        aria-label="Modifier le projet">
                        <Edit3 size={12} style={{ color: "var(--navy)" }} />
                      </button>
                      <button onClick={() => setDeleteTarget(p)}
                        className="p-1.5 rounded-lg bg-white/80 backdrop-blur-sm hover:bg-white"
                        aria-label="Supprimer le projet">
                        <Trash2 size={12} style={{ color: "var(--destructive)" }} />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="text-sm font-semibold truncate" style={{ color: "var(--navy)" }}>
                        {p.titre}
                      </h4>
                      <span className="text-xs ml-2 flex-shrink-0" style={{ color: "var(--muted-foreground)" }}>
                        {p.annee}
                      </span>
                    </div>
                    <p className="text-xs mb-3" style={{ color: "var(--muted-foreground)" }}>
                      {p.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {p.technologies.slice(0, 3).map(t => (
                        <span key={t} className="px-2 py-0.5 rounded-md text-xs"
                          style={{ background: "var(--secondary)", color: "var(--navy)" }}>
                          {t}
                        </span>
                      ))}
                      {p.technologies.length > 3 && (
                        <span className="px-2 py-0.5 rounded-md text-xs"
                          style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}>
                          +{p.technologies.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Modal ajout/édition ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg" style={{ color: "var(--navy)" }}>
                {editItem ? "Modifier le projet" : "Nouveau projet"}
              </h3>
              <button onClick={() => setShowModal(false)} aria-label="Fermer">
                <X size={20} className="text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>
                  Titre *
                </label>
                <input className={inputClass} style={inputStyle}
                  placeholder="ex: Application E-commerce"
                  value={form.titre}
                  onChange={e => setForm(f => ({ ...f, titre: e.target.value }))} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>
                  Description
                </label>
                <textarea className={inputClass} style={inputStyle} rows={3}
                  placeholder="Décrivez le projet..."
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>
                    Catégorie
                  </label>
                  <select className={inputClass} style={inputStyle}
                    value={form.categorie}
                    onChange={e => setForm(f => ({ ...f, categorie: e.target.value }))}>
                    {["Web App", "Mobile", "Fintech", "SaaS", "API"].map(c => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>
                    Année
                  </label>
                  <input className={inputClass} style={inputStyle} type="number"
                    value={form.annee}
                    onChange={e => setForm(f => ({ ...f, annee: e.target.value }))} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>
                  Technologies (séparées par virgule)
                </label>
                <input className={inputClass} style={inputStyle}
                  placeholder="React, Node.js, PostgreSQL"
                  value={form.tech}
                  onChange={e => setForm(f => ({ ...f, tech: e.target.value }))} />
              </div>

              {/* Sélecteur d'icône */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>
                  Icône
                </label>
                <div className="flex gap-2 flex-wrap">
                  {ICON_OPTIONS.map(({ key, label, Icon }) => (
                    <button key={key} type="button" onClick={() => setForm(f => ({ ...f, icone: key }))}
                      className="w-10 h-10 rounded-xl flex items-center justify-center border transition-all"
                      aria-label={label}
                      title={label}
                      style={{
                        borderColor: form.icone === key ? "var(--navy)" : "var(--border)",
                        background:  form.icone === key ? "var(--secondary)" : "transparent",
                      }}>
                      <Icon size={18} style={{ color: "var(--navy)" }} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Color picker */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>
                  Couleur de fond
                </label>
                <div className="flex gap-2">
                  {COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setForm(f => ({ ...f, couleur: c }))}
                      className="w-8 h-8 rounded-lg border-2 transition-all"
                      aria-label={`Couleur ${c}`}
                      style={{
                        background:  c,
                        borderColor: form.couleur === c ? "var(--navy)" : "transparent",
                      }} />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>
                  Image du projet
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />

                {form.imageUrl ? (
                  <div className="relative rounded-xl overflow-hidden border" style={{ borderColor: "var(--border)" }}>
                    <img src={form.imageUrl} alt="Aperçu du projet" className="w-full h-40 object-cover" />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 hover:bg-white"
                      aria-label="Retirer l'image"
                    >
                      <X size={14} style={{ color: "var(--navy)" }} />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragActive(false);
                      handleFile(e.dataTransfer.files?.[0]);
                    }}
                    className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors"
                    style={{ borderColor: dragActive ? "var(--navy)" : "var(--border)", background: dragActive ? "var(--secondary)" : "transparent" }}
                  >
                    {uploadingImage ? (
                      <>
                        <Loader2 size={24} className="mx-auto mb-2 animate-spin" style={{ color: "var(--navy)" }} />
                        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Envoi en cours...</p>
                      </>
                    ) : (
                      <>
                        <Upload size={24} className="mx-auto mb-2" style={{ color: "var(--muted-foreground)" }} />
                        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                          Glissez une image ou cliquez pour en choisir une
                        </p>
                        <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                          JPG, PNG, WEBP ou GIF · 5 Mo max
                        </p>
                      </>
                    )}
                  </div>
                )}

                {imageError && (
                  <div className="flex items-center gap-2 mt-2 text-xs font-medium" style={{ color: "var(--destructive)" }}>
                    <AlertCircle size={13} />
                    {imageError}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold border"
                  style={{ borderColor: "var(--border)", color: "var(--navy)" }}>
                  Annuler
                </button>
                <button onClick={handleSave} disabled={saving || !form.titre.trim()}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                  style={{
                    background: "var(--navy)", color: "#FFF",
                    opacity: saving || !form.titre.trim() ? 0.7 : 1,
                  }}>
                  {saving
                    ? <><Loader2 size={14} className="animate-spin" /> Sauvegarde...</>
                    : editItem ? "Modifier" : "Ajouter"
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal de confirmation de suppression ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#FEF2F2" }}>
                <AlertCircle size={20} style={{ color: "var(--destructive)" }} />
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: "var(--navy)" }}>Supprimer le projet</h3>
                <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
                  « {deleteTarget.titre} » sera définitivement retiré de votre portfolio. Cette action est irréversible.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border"
                style={{ borderColor: "var(--border)", color: "var(--navy)" }}>
                Annuler
              </button>
              <button onClick={confirmDelete} disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                style={{ background: "var(--destructive)", color: "#FFF", opacity: deleting ? 0.7 : 1 }}>
                {deleting
                  ? <><Loader2 size={14} className="animate-spin" /> Suppression...</>
                  : <><Trash2 size={14} /> Supprimer</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}