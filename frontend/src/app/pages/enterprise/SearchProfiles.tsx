
// src/app/pages/enterprise/SearchProfiles.tsx

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  Search,
  Star,
  MapPin,
  Briefcase,
  MessageSquare,
  SlidersHorizontal,
  CheckCircle,
  Loader2,
  Bookmark,
  X,
  RotateCcw,
  Users,
  ChevronDown,
  ShieldCheck,
  Clock3,
  Sparkles,
  SearchX,
} from "lucide-react";

import {
  freelancerSearchService,
  type FreelancerPublic,
  type SearchFilters,
} from "../../../services/freelancerSearchService";

const SKILL_FILTERS = [
  "React",
  "Node.js",
  "Python",
  "Vue.js",
  "Flutter",
  "Figma",
  "Docker",
  "AWS",
  "PostgreSQL",
  "TypeScript",
];

const CATEGORIES = [
  "Développement Web",
  "Mobile",
  "Design",
  "Data Science",
  "DevOps",
  "Marketing",
];

const CITIES = [
  "Yaoundé",
  "Douala",
  "Bafoussam",
  "Garoua",
  "Bamenda",
  "Kribi",
];

const SORT_OPTIONS = [
  "Pertinence",
  "Note (↓)",
  "Tarif (↑)",
  "Disponibilité",
];

export function SearchProfiles() {
  const [freelancers, setFreelancers] = useState<FreelancerPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [savedProfiles, setSavedProfiles] = useState<number[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const [sortBy, setSortBy] = useState("Pertinence");

  const [filters, setFilters] = useState({
    categorie: "",
    minTarif: "",
    maxTarif: "",
    ville: "",
    certified: false,
    disponible: false,
  });

  /**
   * ============================================================
   * CHARGEMENT DES PROFILS
   * ============================================================
   */

  useEffect(() => {
    const fetchFreelancers = async () => {
      try {
        setLoading(true);
        setError(null);

        /*
         * Branche ton service ici lorsque ton endpoint est prêt.
         */
          const data = await freelancerSearchService.search({});
         setFreelancers(data);
         

        // Évite de laisser le loader tourner indéfiniment
        // lorsque le service n'est pas encore branché.
        setFreelancers([]);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger les profils."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFreelancers();
  }, []);

  /**
   * ============================================================
   * FILTRAGE + TRI
   * ============================================================
   */

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    let result = freelancers.filter((f) => {
      const fullName =
        `${f.prenom ?? ""} ${f.nom ?? ""}`.trim().toLowerCase();

      const specialite = f.specialite?.toLowerCase() ?? "";

      const competences = Array.isArray(f.competences)
        ? f.competences
        : [];

      const matchSearch =
        !normalizedSearch ||
        fullName.includes(normalizedSearch) ||
        specialite.includes(normalizedSearch) ||
        competences.some((skill) =>
          skill.toLowerCase().includes(normalizedSearch)
        );

      const matchCategorie =
        !filters.categorie ||
        f.specialite
          ?.toLowerCase()
          .includes(filters.categorie.toLowerCase());

      const matchCertified =
        !filters.certified || f.certified;

      const matchDisponible =
        !filters.disponible ||
        f.disponibilite === "Disponible";

      const matchVille =
        !filters.ville ||
        f.ville === filters.ville;

      const matchMinTarif =
        !filters.minTarif ||
        f.tarifJournalier >= Number(filters.minTarif);

      const matchMaxTarif =
        !filters.maxTarif ||
        f.tarifJournalier <= Number(filters.maxTarif);

      const matchSkills =
        selectedSkills.length === 0 ||
        selectedSkills.some((skill) =>
          competences.includes(skill)
        );

      return (
        matchSearch &&
        matchCategorie &&
        matchCertified &&
        matchDisponible &&
        matchVille &&
        matchMinTarif &&
        matchMaxTarif &&
        matchSkills
      );
    });

    if (sortBy === "Note (↓)") {
      result.sort(
        (a, b) =>
          (b.noteMoyenne ?? 0) -
          (a.noteMoyenne ?? 0)
      );
    }

    if (sortBy === "Tarif (↑)") {
      result.sort(
        (a, b) =>
          a.tarifJournalier -
          b.tarifJournalier
      );
    }

    if (sortBy === "Disponibilité") {
      result.sort(
        (a, b) =>
          (b.disponibilite === "Disponible" ? 1 : 0) -
          (a.disponibilite === "Disponible" ? 1 : 0)
      );
    }

    return result;
  }, [
    freelancers,
    search,
    filters,
    selectedSkills,
    sortBy,
  ]);

  /**
   * ============================================================
   * ACTIONS
   * ============================================================
   */

  const toggleSave = (id: number) => {
    setSavedProfiles((current) =>
      current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id]
    );
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((current) =>
      current.includes(skill)
        ? current.filter((x) => x !== skill)
        : [...current, skill]
    );
  };

  const resetFilters = () => {
    setFilters({
      categorie: "",
      minTarif: "",
      maxTarif: "",
      ville: "",
      certified: false,
      disponible: false,
    });

    setSelectedSkills([]);
    setSearch("");
    setSortBy("Pertinence");
  };

  const activeFiltersCount =
    Number(Boolean(filters.categorie)) +
    Number(Boolean(filters.minTarif)) +
    Number(Boolean(filters.maxTarif)) +
    Number(Boolean(filters.ville)) +
    Number(filters.certified) +
    Number(filters.disponible) +
    selectedSkills.length;

  /**
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="flex flex-col items-center text-center">
          <div
            className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{
              background: "#F7F3EA",
              color: "#A77A21",
            }}
          >
            <Loader2
              size={22}
              className="animate-spin"
            />
          </div>

          <p
            className="text-sm font-semibold"
            style={{ color: "#07111D" }}
          >
            Chargement des talents
          </p>

          <p
            className="mt-1 text-xs"
            style={{ color: "#94A3B8" }}
          >
            Préparation des profils disponibles.
          </p>
        </div>
      </div>
    );
  }

  /**
   * ============================================================
   * ERROR
   * ============================================================
   */

  if (error) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg items-center justify-center px-4">
        <div
          className="w-full rounded-2xl border bg-white p-6 text-center shadow-sm"
          style={{
            borderColor: "#F1D4D4",
          }}
        >
          <div
            className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
            style={{
              background: "#FEF2F2",
              color: "#B91C1C",
            }}
          >
            <SearchX size={20} />
          </div>

          <h2
            className="text-sm font-bold"
            style={{ color: "#07111D" }}
          >
            Impossible de charger les profils
          </h2>

          <p
            className="mt-1 text-xs leading-5"
            style={{ color: "#64748B" }}
          >
            {error}
          </p>
        </div>
      </div>
    );
  }

  /**
   * ============================================================
   * MAIN
   * ============================================================
   */

  return (
    <div className="min-h-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
      <div className="mx-auto w-full max-w-[1400px]">
        {/* ======================================================
            HEADER
            ====================================================== */}

        <section className="mb-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <div className="mb-2 flex items-center gap-2">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-lg"
                  style={{
                    background: "#F7F3EA",
                    color: "#A77A21",
                  }}
                >
                  <Users size={14} />
                </div>

                <span
                  className="text-[11px] font-semibold uppercase tracking-[0.12em]"
                  style={{
                    color: "#A77A21",
                  }}
                >
                  Réseau de talents
                </span>
              </div>

              <h2
                className="text-2xl font-bold tracking-[-0.03em] sm:text-3xl"
                style={{
                  color: "#07111D",
                }}
              >
                Trouvez le talent adapté
                <span
                  className="hidden sm:inline"
                  style={{ color: "#A77A21" }}
                >
                  .
                </span>
              </h2>

              <p
                className="mt-2 max-w-2xl text-sm leading-6"
                style={{
                  color: "#64748B",
                }}
              >
                Recherchez, comparez et contactez des
                freelances selon leurs compétences,
                disponibilités et expériences.
              </p>
            </div>

            {/* Trust indicator */}

            <div
              className="flex w-fit items-center gap-2 rounded-xl border px-3.5 py-2.5"
              style={{
                background: "#FFFFFF",
                borderColor: "#E2E8F0",
              }}
            >
              <ShieldCheck
                size={16}
                style={{ color: "#A77A21" }}
              />

              <div>
                <p
                  className="text-[11px] font-semibold"
                  style={{ color: "#07111D" }}
                >
                  Profils vérifiés
                </p>

                <p
                  className="text-[10px]"
                  style={{ color: "#94A3B8" }}
                >
                  Informations professionnelles
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================
            SEARCH AREA
            ====================================================== */}

        <section
          className="mb-6 rounded-2xl border bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)] sm:p-4"
          style={{
            borderColor: "#E2E8F0",
          }}
        >
          <div className="flex flex-col gap-3 md:flex-row">
            {/* Search */}

            <div className="group relative flex min-h-[48px] flex-1 items-center">
              <Search
                size={17}
                className="pointer-events-none absolute left-4"
                style={{
                  color: search
                    ? "#A77A21"
                    : "#94A3B8",
                }}
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Nom, compétence ou spécialité..."
                aria-label="Rechercher un talent"
                className="h-12 w-full rounded-xl border bg-slate-50 pl-11 pr-11 text-sm outline-none transition-all focus:bg-white"
                style={{
                  borderColor: "#E2E8F0",
                  color: "#07111D",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor =
                    "#C89B3C";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 3px rgba(200,155,60,0.10)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor =
                    "#E2E8F0";
                  e.currentTarget.style.boxShadow =
                    "none";
                }}
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Effacer la recherche"
                  className="absolute right-3 flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filters */}

            <button
              type="button"
              onClick={() =>
                setShowFilters((current) => !current)
              }
              className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl border px-5 text-sm font-semibold transition-all"
              style={{
                borderColor: showFilters
                  ? "#07111D"
                  : "#E2E8F0",
                background: showFilters
                  ? "#07111D"
                  : "#FFFFFF",
                color: showFilters
                  ? "#FFFFFF"
                  : "#07111D",
              }}
            >
              <SlidersHorizontal size={16} />

              <span>Filtres</span>

              {activeFiltersCount > 0 && (
                <span
                  className="flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold"
                  style={{
                    background: showFilters
                      ? "#C89B3C"
                      : "#F7F3EA",
                    color: "#07111D",
                  }}
                >
                  {activeFiltersCount}
                </span>
              )}

              <ChevronDown
                size={14}
                className={`transition-transform ${
                  showFilters
                    ? "rotate-180"
                    : ""
                }`}
              />
            </button>
          </div>

          {/* ====================================================
              FILTER PANEL
              ==================================================== */}

          {showFilters && (
            <div
              className="mt-3 rounded-xl border p-4 sm:p-5"
              style={{
                background: "#FAFBFC",
                borderColor: "#E2E8F0",
              }}
            >
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3
                    className="text-sm font-bold"
                    style={{ color: "#07111D" }}
                  >
                    Affiner votre recherche
                  </h3>

                  <p
                    className="mt-0.5 text-[11px]"
                    style={{ color: "#94A3B8" }}
                  >
                    Utilisez les critères pertinents
                    pour réduire les résultats.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex w-fit items-center gap-1.5 text-xs font-semibold transition-colors hover:underline"
                  style={{
                    color: "#A77A21",
                  }}
                >
                  <RotateCcw size={13} />
                  Réinitialiser
                </button>
              </div>

              {/* Selects / Inputs */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {/* Category */}

                <FilterField label="Catégorie">
                  <select
                    value={filters.categorie}
                    onChange={(e) =>
                      setFilters((f) => ({
                        ...f,
                        categorie: e.target.value,
                      }))
                    }
                    className="filter-input"
                  >
                    <option value="">
                      Toutes les catégories
                    </option>

                    {CATEGORIES.map((category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    ))}
                  </select>
                </FilterField>

                {/* City */}

                <FilterField label="Localisation">
                  <select
                    value={filters.ville}
                    onChange={(e) =>
                      setFilters((f) => ({
                        ...f,
                        ville: e.target.value,
                      }))
                    }
                    className="filter-input"
                  >
                    <option value="">
                      Toutes les villes
                    </option>

                    {CITIES.map((city) => (
                      <option
                        key={city}
                        value={city}
                      >
                        {city}
                      </option>
                    ))}
                  </select>
                </FilterField>

                {/* Min */}

                <FilterField label="Tarif minimum">
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      placeholder="30 000"
                      value={filters.minTarif}
                      onChange={(e) =>
                        setFilters((f) => ({
                          ...f,
                          minTarif: e.target.value,
                        }))
                      }
                      className="filter-input pr-14"
                    />

                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-slate-400">
                      FCFA/j
                    </span>
                  </div>
                </FilterField>

                {/* Max */}

                <FilterField label="Tarif maximum">
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      placeholder="100 000"
                      value={filters.maxTarif}
                      onChange={(e) =>
                        setFilters((f) => ({
                          ...f,
                          maxTarif: e.target.value,
                        }))
                      }
                      className="filter-input pr-14"
                    />

                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-slate-400">
                      FCFA/j
                    </span>
                  </div>
                </FilterField>
              </div>

              {/* Toggles */}

              <div className="mt-5 flex flex-col gap-3 border-t pt-5 sm:flex-row sm:flex-wrap"
                style={{ borderColor: "#E2E8F0" }}
              >
                <FilterCheckbox
                  checked={filters.certified}
                  onChange={(checked) =>
                    setFilters((f) => ({
                      ...f,
                      certified: checked,
                    }))
                  }
                  icon={<CheckCircle size={14} />}
                  label="Profils certifiés uniquement"
                />

                <FilterCheckbox
                  checked={filters.disponible}
                  onChange={(checked) =>
                    setFilters((f) => ({
                      ...f,
                      disponible: checked,
                    }))
                  }
                  icon={<Clock3 size={14} />}
                  label="Disponibles maintenant"
                />
              </div>

              {/* Skills */}

              <div
                className="mt-5 border-t pt-5"
                style={{ borderColor: "#E2E8F0" }}
              >
                <div className="mb-3 flex items-center justify-between">
                  <p
                    className="text-xs font-bold"
                    style={{ color: "#07111D" }}
                  >
                    Compétences
                  </p>

                  {selectedSkills.length > 0 && (
                    <span
                      className="text-[10px] font-medium"
                      style={{ color: "#A77A21" }}
                    >
                      {selectedSkills.length} sélectionnée
                      {selectedSkills.length > 1
                        ? "s"
                        : ""}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {SKILL_FILTERS.map((skill) => {
                    const selected =
                      selectedSkills.includes(skill);

                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() =>
                          toggleSkill(skill)
                        }
                        className="rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition-all"
                        style={{
                          background: selected
                            ? "#07111D"
                            : "#FFFFFF",
                          color: selected
                            ? "#FFFFFF"
                            : "#64748B",
                          borderColor: selected
                            ? "#07111D"
                            : "#E2E8F0",
                        }}
                      >
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ======================================================
            RESULTS TOOLBAR
            ====================================================== */}

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p
              className="text-sm font-semibold"
              style={{ color: "#07111D" }}
            >
              {filtered.length} résultat
              {filtered.length > 1 ? "s" : ""}
            </p>

            {search && (
              <p
                className="mt-0.5 text-[11px]"
                style={{ color: "#94A3B8" }}
              >
                Recherche pour « {search} »
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span
              className="hidden text-[11px] sm:block"
              style={{ color: "#94A3B8" }}
            >
              Trier par
            </span>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value)
                }
                className="appearance-none rounded-xl border bg-white py-2.5 pl-3 pr-9 text-xs font-semibold outline-none"
                style={{
                  borderColor: "#E2E8F0",
                  color: "#07111D",
                }}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option}>
                    {option}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={13}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* ======================================================
            EMPTY STATE
            ====================================================== */}

        {filtered.length === 0 ? (
          <div
            className="rounded-2xl border bg-white px-5 py-16 text-center"
            style={{
              borderColor: "#E2E8F0",
            }}
          >
            <div
              className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
              style={{
                background: "#F8FAFC",
                color: "#94A3B8",
              }}
            >
              <SearchX size={21} />
            </div>

            <h3
              className="text-sm font-bold"
              style={{ color: "#07111D" }}
            >
              Aucun talent trouvé
            </h3>

            <p
              className="mx-auto mt-1 max-w-sm text-xs leading-5"
              style={{ color: "#94A3B8" }}
            >
              Aucun profil ne correspond actuellement
              à vos critères. Essayez de modifier votre
              recherche ou vos filtres.
            </p>

            <button
              type="button"
              onClick={resetFilters}
              className="mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all"
              style={{
                background: "#07111D",
                color: "#FFFFFF",
              }}
            >
              <RotateCcw size={13} />
              Réinitialiser la recherche
            </button>
          </div>
        ) : (
          /* ====================================================
             PROFILE GRID
             ==================================================== */

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((f) => {
              const competences = Array.isArray(
                f.competences
              )
                ? f.competences
                : [];

              const isSaved =
                savedProfiles.includes(f.id);

              const initials =
                `${f.prenom?.[0] ?? ""}${f.nom?.[0] ?? ""}`.toUpperCase();

              const isAvailable =
                f.disponibilite === "Disponible";

              return (
                <article
                  key={f.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_35px_rgba(7,17,29,0.07)]"
                  style={{
                    borderColor: "#E2E8F0",
                  }}
                >
                  {/* Top accent */}

                  <div
                    className="h-0.5 w-full transition-all"
                    style={{
                      background: isAvailable
                        ? "#C89B3C"
                        : "#E2E8F0",
                    }}
                  />

                  <div className="flex flex-1 flex-col p-5">
                    {/* ========================================
                        PROFILE HEADER
                        ======================================== */}

                    <div className="mb-5 flex items-start gap-3">
                      <div
                        className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold"
                        style={{
                          background: "#F7F3EA",
                          color: "#07111D",
                        }}
                      >
                        {initials}

                        {isAvailable && (
                          <span
                            className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white"
                            style={{
                              background: "#A77A21",
                            }}
                            title="Disponible"
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <Link
                            to={`/enterprise/freelancer/${f.id}`}
                            className="truncate text-sm font-bold hover:underline"
                            style={{
                              color: "#07111D",
                            }}
                          >
                            {f.prenom} {f.nom}
                          </Link>

                          {f.certified && (
                            <span
                              className="flex shrink-0 items-center"
                              title="Profil certifié"
                            >
                              <CheckCircle
                                size={14}
                                style={{
                                  color: "#A77A21",
                                }}
                              />
                            </span>
                          )}
                        </div>

                        <p
                          className="mt-0.5 truncate text-xs"
                          style={{
                            color: "#64748B",
                          }}
                        >
                          {f.specialite ||
                            "Spécialité non renseignée"}
                        </p>
                      </div>

                      {/* Save */}

                      <button
                        type="button"
                        onClick={() =>
                          toggleSave(f.id)
                        }
                        aria-label={
                          isSaved
                            ? "Retirer des favoris"
                            : "Ajouter aux favoris"
                        }
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-all hover:bg-slate-50"
                        style={{
                          borderColor: "#E2E8F0",
                          color: isSaved
                            ? "#A77A21"
                            : "#94A3B8",
                          background: isSaved
                            ? "#F7F3EA"
                            : "#FFFFFF",
                        }}
                      >
                        <Bookmark
                          size={15}
                          fill={
                            isSaved
                              ? "currentColor"
                              : "none"
                          }
                        />
                      </button>
                    </div>

                    {/* ========================================
                        RATING / LOCATION
                        ======================================== */}

                    <div className="mb-4 grid grid-cols-2 gap-2">
                      <div
                        className="rounded-xl border p-3"
                        style={{
                          background: "#FAFBFC",
                          borderColor: "#F1F5F9",
                        }}
                      >
                        <div className="flex items-center gap-1.5">
                          <Star
                            size={13}
                            fill="#C89B3C"
                            style={{
                              color: "#C89B3C",
                            }}
                          />

                          <span
                            className="text-sm font-bold"
                            style={{
                              color: "#07111D",
                            }}
                          >
                            {f.noteMoyenne?.toFixed(1) ??
                              "—"}
                          </span>
                        </div>

                        <p
                          className="mt-1 text-[10px]"
                          style={{
                            color: "#94A3B8",
                          }}
                        >
                          {f.nombreAvis ?? 0} avis
                        </p>
                      </div>

                      <div
                        className="rounded-xl border p-3"
                        style={{
                          background: "#FAFBFC",
                          borderColor: "#F1F5F9",
                        }}
                      >
                        <div className="flex items-center gap-1.5">
                          <Briefcase
                            size={13}
                            style={{
                              color: "#A77A21",
                            }}
                          />

                          <span
                            className="text-sm font-bold"
                            style={{
                              color: "#07111D",
                            }}
                          >
                            {f.nombreProjets ?? 0}
                          </span>
                        </div>

                        <p
                          className="mt-1 text-[10px]"
                          style={{
                            color: "#94A3B8",
                          }}
                        >
                          projets réalisés
                        </p>
                      </div>
                    </div>

                    {/* Location */}

                    {f.ville && (
                      <div
                        className="mb-4 flex items-center gap-1.5 text-[11px]"
                        style={{
                          color: "#64748B",
                        }}
                      >
                        <MapPin size={12} />

                        <span>{f.ville}</span>

                        {isAvailable && (
                          <>
                            <span className="text-slate-300">
                              •
                            </span>

                            <span
                              className="font-semibold"
                              style={{
                                color: "#A77A21",
                              }}
                            >
                              Disponible
                            </span>
                          </>
                        )}
                      </div>
                    )}

                    {/* ========================================
                        SKILLS
                        ======================================== */}

                    {competences.length > 0 && (
                      <div className="mb-5">
                        <div className="flex flex-wrap gap-1.5">
                          {competences
                            .slice(0, 3)
                            .map((tag) => (
                              <span
                                key={tag}
                                className="rounded-md px-2 py-1 text-[10px] font-semibold"
                                style={{
                                  background:
                                    "#F1F5F9",
                                  color: "#475569",
                                }}
                              >
                                {tag}
                              </span>
                            ))}

                          {competences.length > 3 && (
                            <span
                              className="rounded-md px-2 py-1 text-[10px] font-medium"
                              style={{
                                background:
                                  "#F8FAFC",
                                color: "#94A3B8",
                              }}
                            >
                              +{competences.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ========================================
                        PRICE
                        ======================================== */}

                    <div
                      className="mt-auto mb-4 flex items-end justify-between border-t pt-4"
                      style={{
                        borderColor: "#F1F5F9",
                      }}
                    >
                      <div>
                        <p
                          className="mb-0.5 text-[10px] font-medium"
                          style={{
                            color: "#94A3B8",
                          }}
                        >
                          Tarif journalier
                        </p>

                        <span
                          className="text-base font-bold"
                          style={{
                            color: "#07111D",
                          }}
                        >
                          {f.tarifJournalier > 0
                            ? `${f.tarifJournalier.toLocaleString()} FCFA`
                            : "Sur devis"}
                        </span>
                      </div>

                      <span
                        className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold"
                        style={{
                          background: isAvailable
                            ? "#F7F3EA"
                            : "#F1F5F9",
                          color: isAvailable
                            ? "#8A641C"
                            : "#64748B",
                        }}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{
                            background:
                              isAvailable
                                ? "#C89B3C"
                                : "#94A3B8",
                          }}
                        />

                        {f.disponibilite ??
                          "Non précisé"}
                      </span>
                    </div>

                    {/* ========================================
                        ACTIONS
                        ======================================== */}

                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        to={`/enterprise/freelancer/${f.id}`}
                        className="flex min-h-10 items-center justify-center rounded-xl border px-3 text-xs font-semibold transition-all hover:bg-slate-50"
                        style={{
                          borderColor: "#E2E8F0",
                          color: "#07111D",
                        }}
                      >
                        Voir le profil
                      </Link>

                      <Link
                        to={`/messages?freelancer=${f.userId}`}
                        className="flex min-h-10 items-center justify-center gap-1.5 rounded-xl px-3 text-xs font-semibold transition-all hover:opacity-90"
                        style={{
                          background: "#07111D",
                          color: "#FFFFFF",
                        }}
                      >
                        <MessageSquare size={13} />

                        Contacter
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================
          LOCAL STYLES
          ======================================================== */}

      <style>{`
        .filter-input {
          width: 100%;
          height: 42px;
          border-radius: 10px;
          border: 1px solid #E2E8F0;
          background: #FFFFFF;
          padding: 0 12px;
          font-size: 12px;
          color: #07111D;
          outline: none;
          transition: all 0.15s ease;
        }

        .filter-input:focus {
          border-color: #C89B3C;
          box-shadow: 0 0 0 3px rgba(200,155,60,0.10);
        }

        .filter-input::placeholder {
          color: #94A3B8;
        }
      `}</style>
    </div>
  );
}

/**
 * ============================================================
 * FILTER FIELD
 * ============================================================
 */

function FilterField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide"
        style={{
          color: "#64748B",
        }}
      >
        {label}
      </label>

      {children}
    </div>
  );
}

/**
 * ============================================================
 * FILTER CHECKBOX
 * ============================================================
 */

function FilterCheckbox({
  checked,
  onChange,
  icon,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <label
      className="flex cursor-pointer items-center gap-2.5 rounded-xl border bg-white px-3 py-2.5 transition-all"
      style={{
        borderColor: checked
          ? "#D8C18E"
          : "#E2E8F0",
        color: "#07111D",
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) =>
          onChange(e.target.checked)
        }
        className="sr-only"
      />

      <span
        className="flex h-5 w-5 items-center justify-center rounded-md border transition-all"
        style={{
          background: checked
            ? "#07111D"
            : "#FFFFFF",
          borderColor: checked
            ? "#07111D"
            : "#CBD5E1",
          color: "#C89B3C",
        }}
      >
        {checked && icon}
      </span>

      <span className="text-xs font-medium">
        {label}
      </span>
    </label>
  );
}

