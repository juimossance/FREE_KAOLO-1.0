import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";

import {
  Bell,
  ChevronDown,
  LogOut,
  User,
  Menu,
  X,
  MessageSquare,
  CreditCard,
  ShieldCheck,
  Star,
  Settings,
} from "lucide-react";

import { useAuth } from "../../../hooks/useAuth";
import { apiFetch } from "../../../services/http";

import {
  ROLE_NAVIGATION,
  ROLE_USER_MENU,
  ROLE_LABELS,
  type AppRole,
  type NavChild,
} from "../../../navigation.config";

type NotificationItem = {
  id: number | string;
  text: string;
  time: string;
  read: boolean;
  icon: React.ReactNode;
};

type ProfileResponse = {
  id?: number;
  nom?: string;
  prenom?: string;
  email?: string;
  nomEntreprise?: string;
  secteur?: string;
  specialite?: string;
};

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const role = user?.role as AppRole | undefined;

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  /**
   * ============================================================
   * PROFIL UTILISATEUR
   * ============================================================
   */

  const [displayName, setDisplayName] = useState("");
  const [displayEmail, setDisplayEmail] = useState("");
  const [initiales, setInitiales] = useState("??");
  const [profileLoading, setProfileLoading] = useState(true);

  const [notifications, setNotifications] = useState<NotificationItem[]>(
    []
  );

  /**
   * ============================================================
   * CHARGEMENT DU PROFIL
   * ============================================================
   */

  useEffect(() => {
    if (!user || !role) {
      setProfileLoading(false);
      return;
    }

    let cancelled = false;

    const loadProfile = async () => {
      try {
        setProfileLoading(true);

        /**
         * --------------------------------------------------------
         * FREELANCER
         * --------------------------------------------------------
         */

        if (role === "FREELANCER") {
          const profile = await apiFetch<ProfileResponse>(
            "/freelancer/me/detail"
          );

          if (cancelled) return;

          const prenom = profile.prenom?.trim() ?? "";
          const nom = profile.nom?.trim() ?? "";

          const fullName = `${prenom} ${nom}`.trim();

          if (fullName) {
            setDisplayName(fullName);

            setInitiales(
              `${prenom.charAt(0)}${nom.charAt(0)}`
                .toUpperCase()
                .trim() || "FL"
            );
          } else {
            /**
             * On ne met JAMAIS le rôle comme nom.
             */
            setDisplayName("Mon profil");
            setInitiales("FL");
          }

          setDisplayEmail(
            profile.email?.trim() ||
              user.email?.trim() ||
              ""
          );

          return;
        }

        /**
         * --------------------------------------------------------
         * ENTREPRISE
         * --------------------------------------------------------
         */

        if (role === "ENTREPRISE") {
          const profile = await apiFetch<ProfileResponse>(
            "/entreprise/me/profil"
          );

          if (cancelled) return;

          const companyName =
          profile.nomEntreprise?.trim() || "";
          console.log(companyName) 

          if (companyName) {
            setDisplayName(companyName);

            setInitiales(
              companyName
                .split(/\s+/)
                .slice(0, 2)
                .map(word => word.charAt(0))
                .join("")
                .toUpperCase()
            );
          } else {
            setDisplayName("Mon entreprise");
            setInitiales("EN");
          }

          setDisplayEmail(
            profile.email?.trim() ||
              user.email?.trim() ||
              ""
          );

          return;
        }

        /**
         * --------------------------------------------------------
         * ADMIN
         * --------------------------------------------------------
         */

        if (role === "ADMIN") {
          const adminName =
            user.name?.trim?.() ||
            user.email?.trim?.() ||
            "";

          setDisplayName(
            adminName || "Administrateur"
          );

          setInitiales(
            adminName
              ? adminName
                  .split(/\s+/)
                  .slice(0, 2)
                  .map(word => word.charAt(0))
                  .join("")
                  .toUpperCase()
              : "AD"
          );

          setDisplayEmail(user.email?.trim() || "");

          return;
        }
      } catch (error) {
        console.error(
          "Impossible de récupérer le profil utilisateur",
          error
        );

        if (cancelled) return;

        /**
         * IMPORTANT :
         * Le fallback ne doit jamais être user.role.
         */

        const fallbackName =
          user.name?.trim?.() ||
          user.email?.trim?.() ||
          "";

        if (fallbackName) {
          setDisplayName(fallbackName);

          setInitiales(
            fallbackName
              .split(/\s+/)
              .slice(0, 2)
              .map(word => word.charAt(0))
              .join("")
              .toUpperCase()
          );
        } else {
          setDisplayName(
            role === "ENTREPRISE"
              ? "Mon entreprise"
              : role === "FREELANCER"
              ? "Mon profil"
              : "Administrateur"
          );

          setInitiales(
            role === "ENTREPRISE"
              ? "EN"
              : role === "FREELANCER"
              ? "FL"
              : "AD"
          );
        }

        setDisplayEmail(
          user.email?.trim() || ""
        );
      } finally {
        if (!cancelled) {
          setProfileLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [user, role]);

  /**
   * ============================================================
   * SCROLL
   * ============================================================
   */

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  /**
   * ============================================================
   * FERMETURE DES MENUS
   * ============================================================
   */

  useEffect(() => {
    setOpenDropdown(null);
    setShowNotifs(false);
    setShowUserMenu(false);
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target as Node
        )
      ) {
        setOpenDropdown(null);
        setShowNotifs(false);
        setShowUserMenu(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handler
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handler
      );
    };
  }, []);

  /**
   * ============================================================
   * HELPERS
   * ============================================================
   */

  const isActive = (
    path?: string,
    children?: NavChild[]
  ) => {
    if (path) {
      return (
        location.pathname === path ||
        location.pathname.startsWith(path + "/")
      );
    }

    if (children) {
      return children.some(child =>
        location.pathname.startsWith(child.path)
      );
    }

    return false;
  };

  const handleLogout = () => {
    logout();

    navigate("/login", {
      replace: true,
    });
  };

  /**
   * ============================================================
   * SÉCURITÉ
   * ============================================================
   */

  if (!user || !role) {
    return null;
  }

  const nav = ROLE_NAVIGATION[role];
  const userMenu = ROLE_USER_MENU[role];

  const unreadCount = notifications.filter(
    notification => !notification.read
  ).length;

  const homePath =
    role === "ENTREPRISE"
      ? "/enterprise/dashboard"
      : role === "FREELANCER"
      ? "/freelancer/dashboard"
      : "/admin/dashboard";

  const notificationsPath =
    userMenu[0]?.path.replace(
      /\/(profile|edit-profile|settings)$/,
      "/notifications"
    );

  const roleLabel =
    ROLE_LABELS[role] ?? role;

  /**
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <>
      <motion.nav
        initial={{ y: -70 }}
        animate={{ y: 0 }}
        transition={{
          duration: 0.45,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="fixed top-0 left-0 right-0 z-50 h-16"
        style={{
          background: scrolled
            ? "rgba(8, 15, 28, 0.98)"
            : "rgba(8, 15, 28, 0.94)",

          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",

          borderBottom: scrolled
            ? "1px solid rgba(212,175,55,0.18)"
            : "1px solid rgba(255,255,255,0.07)",

          boxShadow: scrolled
            ? "0 8px 30px rgba(0,0,0,0.25)"
            : "none",

          transition:
            "all 0.3s ease",
        }}
      >
        <div
          ref={dropdownRef}
          className="h-full flex items-center w-full px-4 sm:px-6 lg:px-8 gap-4 lg:gap-7"
        >

          {/* ====================================================
              LOGO
          ==================================================== */}

          <Link
            to={homePath}
            className="flex items-center gap-2.5 flex-shrink-0"
          >
            <motion.div
              whileHover={{
                scale: 1.05,
                rotate: 2,
              }}
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
              style={{
                background:
                  "linear-gradient(135deg,#D4AF37,#F0D060)",
              }}
            >
              <span
                className="text-xs font-black"
                style={{
                  color: "#0F172A",
                }}
              >
                FK
              </span>
            </motion.div>

            <span className="hidden sm:block text-[15px] font-bold tracking-tight text-white">
              free
              <span style={{ color: "#D4AF37" }}>
                -kaolo
              </span>
            </span>
          </Link>

          {/* ====================================================
              DESKTOP NAVIGATION
          ==================================================== */}

          <div className="hidden lg:flex items-center gap-1 flex-1">
            {nav.map(item => (
              <div
                key={item.label}
                className="relative"
              >
                {item.children ? (
                  <button
                    onClick={() =>
                      setOpenDropdown(
                        openDropdown === item.label
                          ? null
                          : item.label
                      )
                    }
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all"
                    style={{
                      color: isActive(
                        undefined,
                        item.children
                      )
                        ? "#D4AF37"
                        : "rgba(255,255,255,0.68)",

                      background: isActive(
                        undefined,
                        item.children
                      )
                        ? "rgba(212,175,55,0.09)"
                        : "transparent",
                    }}
                  >
                    {item.label}

                    <motion.div
                      animate={{
                        rotate:
                          openDropdown === item.label
                            ? 180
                            : 0,
                      }}
                    >
                      <ChevronDown size={13} />
                    </motion.div>
                  </button>
                ) : (
                  <Link
                    to={item.path!}
                    className="flex items-center px-3 py-2 rounded-xl text-[13px] font-medium transition-all"
                    style={{
                      color: isActive(item.path)
                        ? "#D4AF37"
                        : "rgba(255,255,255,0.68)",

                      background: isActive(item.path)
                        ? "rgba(212,175,55,0.09)"
                        : "transparent",
                    }}
                  >
                    {item.label}
                  </Link>
                )}

                {/* Dropdown */}
                <AnimatePresence>
                  {item.children &&
                    openDropdown === item.label && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          y: -8,
                          scale: 0.97,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          scale: 1,
                        }}
                        exit={{
                          opacity: 0,
                          y: -8,
                          scale: 0.97,
                        }}
                        className="absolute top-full left-0 mt-2 w-72 rounded-2xl overflow-hidden"
                        style={{
                          background:
                            "rgba(8,15,28,0.99)",
                          border:
                            "1px solid rgba(255,255,255,0.09)",
                          boxShadow:
                            "0 24px 60px rgba(0,0,0,0.45)",
                        }}
                      >
                        <div className="p-2">
                          {item.children.map(
                            child => (
                              <Link
                                key={child.path}
                                to={child.path}
                                className="flex gap-3 p-3 rounded-xl transition-colors hover:bg-white/[0.05]"
                              >
                                <div
                                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                  style={{
                                    background:
                                      "rgba(212,175,55,0.08)",
                                    color:
                                      "#D4AF37",
                                  }}
                                >
                                  {child.icon}
                                </div>

                                <div>
                                  <p className="text-sm font-medium text-white">
                                    {child.label}
                                  </p>

                                  {child.description && (
                                    <p className="text-xs mt-0.5 text-white/40">
                                      {
                                        child.description
                                      }
                                    </p>
                                  )}
                                </div>
                              </Link>
                            )
                          )}
                        </div>
                      </motion.div>
                    )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* ====================================================
              RIGHT AREA
          ==================================================== */}

          <div className="ml-auto flex items-center gap-2">

            {/* ROLE — INFORMATION SECONDAIRE */}
            <div
              className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl border"
              style={{
                background:
                  "rgba(212,175,55,0.06)",
                borderColor:
                  "rgba(212,175,55,0.16)",
              }}
            >
              <ShieldCheck
                size={13}
                style={{
                  color: "#D4AF37",
                }}
              />

              <span
                className="text-[11px] font-semibold"
                style={{
                  color: "#D4AF37",
                }}
              >
                {roleLabel}
              </span>
            </div>

            {/* ==================================================
                NOTIFICATIONS
            ================================================== */}

            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifs(!showNotifs);
                  setShowUserMenu(false);
                  setOpenDropdown(null);
                }}
                className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-white/[0.08]"
                style={{
                  color:
                    "rgba(255,255,255,0.78)",
                  background:
                    "rgba(255,255,255,0.04)",
                }}
              >
                <Bell size={17} />

                {unreadCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full text-[9px] font-bold flex items-center justify-center text-white"
                    style={{
                      background: "#DC2626",
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifs && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: -8,
                      scale: 0.97,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      y: -8,
                      scale: 0.97,
                    }}
                    className="absolute top-full right-0 mt-2 w-[min(340px,calc(100vw-24px))] rounded-2xl overflow-hidden"
                    style={{
                      background:
                        "rgba(8,15,28,0.99)",
                      border:
                        "1px solid rgba(255,255,255,0.09)",
                      boxShadow:
                        "0 24px 60px rgba(0,0,0,0.5)",
                    }}
                  >
                    <div className="px-4 py-3 border-b border-white/[0.07] flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">
                        Notifications
                      </span>

                      <span className="text-[10px] text-white/40">
                        {unreadCount} non lue
                        {unreadCount > 1
                          ? "s"
                          : ""}
                      </span>
                    </div>

                    {notifications.length === 0 ? (
                      <div className="px-5 py-10 text-center">
                        <Bell
                          size={24}
                          className="mx-auto mb-2 text-white/20"
                        />

                        <p className="text-xs text-white/35">
                          Aucune notification
                        </p>
                      </div>
                    ) : (
                      <div>
                        {notifications.map(
                          notification => (
                            <div
                              key={notification.id}
                              className="flex gap-3 px-4 py-3 hover:bg-white/[0.04]"
                            >
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
                                {
                                  notification.icon
                                }
                              </div>

                              <div>
                                <p className="text-xs text-white/80">
                                  {
                                    notification.text
                                  }
                                </p>

                                <p className="text-[10px] mt-1 text-white/30">
                                  {
                                    notification.time
                                  }
                                </p>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}

                    {notificationsPath && (
                      <div className="border-t border-white/[0.07] px-4 py-3">
                        <Link
                          to={notificationsPath}
                          className="text-xs font-medium"
                          style={{
                            color: "#D4AF37",
                          }}
                        >
                          Voir toutes les notifications
                        </Link>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ==================================================
                USER MENU
            ================================================== */}

            <div className="relative">
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotifs(false);
                  setOpenDropdown(null);
                }}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl transition-all hover:bg-white/[0.07]"
                style={{
                  background:
                    showUserMenu
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(255,255,255,0.04)",
                }}
              >
                {/* Avatar */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold"
                  style={{
                    background:
                      "linear-gradient(135deg,#D4AF37,#F0D060)",
                    color: "#0F172A",
                  }}
                >
                  {profileLoading
                    ? "..."
                    : initiales}
                </div>

                {/* Nom */}
                <div className="hidden md:block text-left max-w-[150px]">
                  <p className="text-xs font-semibold text-white truncate">
                    {profileLoading
                      ? "Chargement..."
                      : displayName}
                  </p>

                  {/* ROLE SOUS LE NOM */}
                  <p
                    className="text-[10px] truncate"
                    style={{
                      color:
                        "rgba(255,255,255,0.38)",
                    }}
                  >
                    {roleLabel}
                  </p>
                </div>

                <ChevronDown
                  size={13}
                  className="text-white/40"
                />
              </button>

              {/* USER DROPDOWN */}

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: -8,
                      scale: 0.97,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      y: -8,
                      scale: 0.97,
                    }}
                    className="absolute top-full right-0 mt-2 w-64 rounded-2xl overflow-hidden"
                    style={{
                      background:
                        "rgba(8,15,28,0.99)",
                      border:
                        "1px solid rgba(255,255,255,0.09)",
                      boxShadow:
                        "0 24px 60px rgba(0,0,0,0.5)",
                    }}
                  >
                    {/* USER HEADER */}

                    <div className="p-4 border-b border-white/[0.07]">
                      <div className="flex items-center gap-3">

                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold"
                          style={{
                            background:
                              "linear-gradient(135deg,#D4AF37,#F0D060)",
                            color: "#0F172A",
                          }}
                        >
                          {initiales}
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate">
                            {displayName}
                          </p>

                          {displayEmail && (
                            <p className="text-xs text-white/35 truncate">
                              {displayEmail}
                            </p>
                          )}
                        </div>

                      </div>

                      {/* ROLE */}

                      <div
                        className="inline-flex items-center gap-1.5 mt-3 px-2 py-1 rounded-lg"
                        style={{
                          background:
                            "rgba(212,175,55,0.08)",
                        }}
                      >
                        <ShieldCheck
                          size={11}
                          style={{
                            color: "#D4AF37",
                          }}
                        />

                        <span
                          className="text-[10px] font-semibold"
                          style={{
                            color: "#D4AF37",
                          }}
                        >
                          {roleLabel}
                        </span>
                      </div>
                    </div>

                    {/* MENU */}

                    <div className="p-2">
                      {userMenu.map(item => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/65 hover:text-white hover:bg-white/[0.05] transition-all"
                        >
                          {item.icon}
                          {item.label}
                        </Link>
                      ))}
                    </div>

                    {/* LOGOUT */}

                    <div className="p-2 border-t border-white/[0.07]">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm w-full hover:bg-red-500/[0.08] transition-all"
                        style={{
                          color: "#F87171",
                        }}
                      >
                        <LogOut size={14} />
                        Se déconnecter
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ==================================================
                MOBILE
            ================================================== */}

            <button
              onClick={() =>
                setMobileOpen(!mobileOpen)
              }
              className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background:
                  "rgba(255,255,255,0.05)",
                color: "#fff",
              }}
            >
              {mobileOpen ? (
                <X size={18} />
              ) : (
                <Menu size={18} />
              )}
            </button>

          </div>
        </div>
      </motion.nav>

      {/* ========================================================
          MOBILE MENU
      ======================================================== */}

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{
              opacity: 0,
              y: -15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -15,
            }}
            className="fixed top-16 left-0 right-0 z-40 lg:hidden overflow-y-auto"
            style={{
              background:
                "rgba(7,12,22,0.99)",
              backdropFilter: "blur(20px)",
              maxHeight:
                "calc(100vh - 64px)",
              borderBottom:
                "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="p-4">

              {/* USER MOBILE */}

              <div className="mb-4 p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
                <div className="flex items-center gap-3">

                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs"
                    style={{
                      background:
                        "linear-gradient(135deg,#D4AF37,#F0D060)",
                      color: "#0F172A",
                    }}
                  >
                    {initiales}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-white">
                      {displayName}
                    </p>

                    <p className="text-xs text-white/40">
                      {roleLabel}
                    </p>
                  </div>

                </div>
              </div>

              {/* NAVIGATION */}

              <div className="space-y-1">

                {nav.map(item => (
                  <div key={item.label}>

                    {item.path ? (
                      <Link
                        to={item.path}
                        className="block px-4 py-3 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/[0.05]"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <>
                        <p
                          className="px-4 py-2 mt-2 text-[10px] uppercase tracking-[0.15em] font-semibold"
                          style={{
                            color:
                              "rgba(212,175,55,0.7)",
                          }}
                        >
                          {item.label}
                        </p>

                        {item.children?.map(
                          child => (
                            <Link
                              key={child.path}
                              to={child.path}
                              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/65 hover:text-white hover:bg-white/[0.05]"
                            >
                              <span className="text-white/30">
                                {child.icon}
                              </span>

                              {child.label}
                            </Link>
                          )
                        )}
                      </>
                    )}

                  </div>
                ))}

              </div>

              {/* LOGOUT MOBILE */}

              <div className="mt-4 pt-4 border-t border-white/[0.07]">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm"
                  style={{
                    color: "#F87171",
                  }}
                >
                  <LogOut size={15} />
                  Se déconnecter
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}