import { useState, useRef, useEffect } from "react";
import { Link } from "react-router";
import { motion, useInView, animate, AnimatePresence } from "motion/react";
import {
  ArrowRight, Star, Shield, ShieldCheck, Zap, MessageSquare, BarChart3, Award,
  CheckCircle, Globe, Smartphone, ChevronDown, Menu, X, Sparkles,
  Users, Briefcase, CreditCard, Clock, TrendingUp, Play
} from "lucide-react";

// ─── Polices ────────────────────────────────────────────────────────────────
// Fraunces (display, empattements marqués, presque "gravé au bois") + Work Sans
// (corps, humaniste et chaleureux) remplacent la paire générique par défaut.
// Idéalement ce lien va dans <head> de index.html pour la performance ; il est
// injecté ici via <style> pour que le composant reste autonome.
const FONT_DISPLAY = "'Fraunces', Georgia, serif";
const FONT_BODY = "'Work Sans', 'Segoe UI', sans-serif";
function FontImports() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700;9..144,800&family=Work+Sans:wght@400;500;600;700&display=swap');
    `}</style>
  );
}

// ─── Animation variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

// ─── Palette camerounaise ───────────────────────────────────────────────────
// Or (identité free-kaolo) sur fond marine profond — le vert et le rouge du
// drapeau restent des touches, jamais un aplat dominant.
const CM = {
  ember: "#D4AF37",   // or — accent primaire
  gold: "#F0D060",    // or clair — accent secondaire (dégradés, surbrillances)
  clay: "#8A6D1F",     // or assourdi — profondeur (anneaux, structure)
  green: "#1B7A43",   // vert Cameroun
  red: "#C1272D",     // rouge Cameroun
};
const colors = {
  ink: "#080F1D",        // marine profond — fond sombre de base
  inkSoft: "#0F172A",    // surface sombre secondaire
  inkDeep: "#050A14",    // surface la plus profonde (footer)
  bone: "#F8FAFC",       // blanc froid — fond clair
  boneBorder: "#E2E8F0", // bordure sur fond clair
  charcoal: "#0F172A",   // texte principal sur fond clair
  muted: "#64748B",      // texte secondaire
};

// ─── Bande cérémonielle (3 registres) ──────────────────────────────────────
// Remplace le simple filet triangulaire par une véritable bordure à trois
// niveaux — zigzag, cercles pointillés, losanges — comme le cadrage en
// couches que l'on voit border les motifs concentriques de référence.
function CeremonialBand({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const bg = tone === "dark" ? colors.inkDeep : colors.bone;
  const zigzag = Array.from({ length: 24 });
  const dots = Array.from({ length: 32 });
  const diamonds = Array.from({ length: 16 });

  return (
    <div aria-hidden="true" className="w-full overflow-hidden leading-none" style={{ background: bg }}>
      <svg viewBox="0 0 960 46" preserveAspectRatio="none" className="w-full h-[46px] block">
        <rect width="960" height="46" fill="#0B0604" />

        {/* Registre 1 — zigzag triangulaire */}
        {zigzag.map((_, i) => {
          const x = i * 40;
          const up = i % 2 === 0;
          const fill = i % 4 === 0 ? CM.ember : i % 4 === 2 ? CM.gold : "#0B0604";
          return up ? (
            <polygon key={`z${i}`} points={`${x},14 ${x + 20},1 ${x + 40},14`} fill={fill} />
          ) : (
            <polygon key={`z${i}`} points={`${x},1 ${x + 20},13 ${x + 40},1`} fill={fill} opacity="0.55" />
          );
        })}

        <line x1="0" y1="15.5" x2="960" y2="15.5" stroke={CM.gold} strokeOpacity="0.3" strokeWidth="1" />

        {/* Registre 2 — cercles pointillés, motif dominant de la trame de référence */}
        {dots.map((_, i) => {
          const x = 15 + i * 30;
          const fill = i % 3 === 0 ? CM.gold : i % 3 === 1 ? CM.ember : CM.clay;
          return <circle key={`d${i}`} cx={x} cy={24} r={i % 4 === 0 ? 3.2 : 2} fill={fill} opacity={i % 4 === 0 ? 0.95 : 0.55} />;
        })}

        <line x1="0" y1="33" x2="960" y2="33" stroke={CM.gold} strokeOpacity="0.18" strokeWidth="1" />

        {/* Registre 3 — losanges, clin d'œil discret vert/rouge du drapeau */}
        {diamonds.map((_, i) => {
          const x = 20 + i * 60;
          const fill = i % 2 === 0 ? CM.green : CM.red;
          return (
            <polygon
              key={`di${i}`}
              points={`${x},34 ${x + 8},40 ${x},46 ${x - 8},40`}
              fill={fill}
              opacity="0.5"
            />
          );
        })}
      </svg>
    </div>
  );
}

// ─── Trame de fond (losanges + triangles) ──────────────────────────────────
// Filigrane discret pour les sections pleines, inspiré du tissage Ndop et des
// registres triangulaires de l'image de référence.
function NdopTexture({ opacity = 0.05 }: { opacity?: number }) {
  return (
    <svg aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
      <defs>
        <pattern id="ndop-diamond" width="64" height="64" patternUnits="userSpaceOnUse">
          <path d="M32 4 L58 32 L32 58 L6 32 Z" fill="none" stroke={CM.gold} strokeWidth="1" />
          <path d="M32 16 L46 32 L32 46 L18 32 Z" fill="none" stroke={CM.gold} strokeWidth="1" />
          <circle cx="32" cy="32" r="3" fill="none" stroke={CM.ember} strokeWidth="1" />
          <path d="M0 32 L8 26 L16 32 L8 38 Z" fill="none" stroke={CM.ember} strokeWidth="0.8" opacity="0.6" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#ndop-diamond)" />
    </svg>
  );
}

// ─── Médaillon à cercles concentriques ─────────────────────────────────────
// L'élément signature de la page : reprend directement le motif de roues
// concentriques de l'image de référence, utilisé pour numéroter les étapes
// au lieu d'un carré plat générique.
function RoundelMedallion({ label, size = 56 }: { label: string; size?: number }) {
  const r = size / 2;
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" aria-hidden="true">
      <circle cx="28" cy="28" r="27" fill="none" stroke={CM.clay} strokeWidth="1.5" opacity="0.5" />
      <circle cx="28" cy="28" r="22" fill="none" stroke={CM.gold} strokeWidth="1.5" strokeDasharray="2 3" opacity="0.8" />
      <circle cx="28" cy="28" r="18" fill={colors.inkSoft} stroke={CM.ember} strokeWidth="2" />
      <text x="28" y="34" textAnchor="middle" fontSize="16" fontWeight="700" fill={CM.gold} fontFamily={FONT_DISPLAY}>
        {label}
      </text>
    </svg>
  );
}

// ─── Ram spiral (emblème bélier — sagesse et autorité, motif bamiléké) ─────
function RamSpiralIcon({ size = 22, color = CM.gold }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path d="M20 20 C20 12 28 12 28 18 C28 23 22 24 20 20 C18 16 22 8 12 8 C4 8 4 18 12 20 C18 21.5 20 20 20 20"
        stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Counter component ─────────────────────────────────────────────────────────
function Counter({ value, suffix = "", prefix = "" }: { value: number; suffix?: string; prefix?: string }) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(nodeRef, { once: true, margin: "-60px" });

  useEffect(() => {
    if (!isInView || !nodeRef.current) return;
    const node = nodeRef.current;
    const controls = animate(0, value, {
      duration: 1.8,
      ease: "easeOut",
      onUpdate: (v) => {
        if (node) node.textContent = prefix + Math.round(v).toLocaleString("fr-FR") + suffix;
      },
    });
    return () => controls.stop();
  }, [isInView, value, suffix, prefix]);

  return <span ref={nodeRef}>{prefix}0{suffix}</span>;
}

// ─── Cameroon network map ─────────────────────────────────────────────────────
function CameroonNetworkMap() {
  const cities = [
    { name: "Maroua", x: 58, y: 13, featured: false },
    { name: "Garoua", x: 52, y: 27, featured: false },
    { name: "Bertoua", x: 70, y: 43, featured: false },
    { name: "Bafoussam", x: 35, y: 48, featured: false },
    { name: "Yaoundé", x: 53, y: 56, featured: true },
    { name: "Douala", x: 43, y: 70, featured: true },
    { name: "Buea", x: 31, y: 74, featured: false },
    { name: "Ebolowa", x: 49, y: 88, featured: false },
  ];

  const connections = [
    ["Maroua", "Garoua"],
    ["Garoua", "Yaoundé"],
    ["Garoua", "Bertoua"],
    ["Bafoussam", "Yaoundé"],
    ["Bafoussam", "Douala"],
    ["Yaoundé", "Bertoua"],
    ["Yaoundé", "Douala"],
    ["Yaoundé", "Buea"],
    ["Douala", "Buea"],
    ["Douala", "Ebolowa"],
  ];

  const getCity = (name: string) => cities.find((city) => city.name === name)!;

  const silhouette = `
    M213 32 L270 38 L311 63 L347 72 L365 101 L399 122
    L391 153 L414 181 L402 213 L425 244 L408 275 L420 307
    L405 338 L414 371 L393 403 L382 438 L354 465 L344 502
    L315 530 L299 563 L272 588 L256 628 L222 653 L197 631
    L170 647 L145 622 L116 625 L101 596 L72 582 L79 548
    L58 522 L68 487 L48 461 L65 428 L53 395 L76 367 L63 334
    L88 306 L75 274 L101 246 L91 211 L119 185 L108 151
    L136 126 L131 94 L163 74 L166 43 Z
  `;

  return (
    <div
      className="relative w-full overflow-hidden rounded-[28px]"
      style={{
        height: 650,
        background: `radial-gradient(circle at 50% 45%, rgba(27,122,67,0.14), transparent 45%), ${colors.inkDeep}`,
        border: `1px solid rgba(212,175,55,0.14)`,
      }}
    >
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
        }}
      />

      <div className="absolute left-6 right-6 top-5 z-30 flex items-center justify-between">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.25em]" style={{ color: "rgba(255,255,255,.3)" }}>
            Réseau national
          </p>
          <p className="mt-1 text-sm font-semibold text-white" style={{ fontFamily: FONT_DISPLAY }}>Les talents du Cameroun</p>
        </div>

        <div
          className="flex items-center gap-2 rounded-full px-3 py-1.5"
          style={{ background: "rgba(27,122,67,.12)", border: "1px solid rgba(27,122,67,.25)" }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#39B879", boxShadow: "0 0 10px rgba(57,184,121,.8)" }} />
          <span className="text-[9px] font-semibold" style={{ color: "#39B879" }}>Réseau actif</span>
        </div>
      </div>

      <svg viewBox="0 0 500 680" className="absolute inset-x-0 top-[30px] mx-auto h-[590px] w-full" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <defs>
          <linearGradient id="cameroonFill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={colors.inkSoft} />
            <stop offset="100%" stopColor={colors.inkDeep} />
          </linearGradient>
          <linearGradient id="cameroonStroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={CM.gold} />
            <stop offset="45%" stopColor="#39B879" />
            <stop offset="100%" stopColor="#087443" />
          </linearGradient>
          <filter id="greenGlow">
            <feGaussianBlur stdDeviation="8" />
          </filter>
          <clipPath id="cmClip">
            <path d={silhouette} />
          </clipPath>
        </defs>

        <path d={silhouette} fill="none" stroke="#1B7A43" strokeWidth="20" opacity=".12" filter="url(#greenGlow)" />
        <path d={silhouette} fill="url(#cameroonFill)" stroke="url(#cameroonStroke)" strokeWidth="2.5" />

        <g clipPath="url(#cmClip)" fill="none" stroke="#39B879" strokeWidth="1" opacity=".08">
          <path d="M40 130 C150 90 300 130 460 80" />
          <path d="M35 180 C150 135 310 180 470 125" />
          <path d="M30 230 C160 180 320 230 480 175" />
          <path d="M20 280 C150 235 330 280 490 225" />
          <path d="M15 330 C150 280 330 330 500 275" />
          <path d="M10 380 C150 330 350 380 505 325" />
          <path d="M5 430 C150 380 350 430 510 375" />
          <path d="M0 480 C150 430 350 480 515 425" />
          <path d="M0 530 C150 480 350 530 520 475" />
          <path d="M0 580 C150 530 350 580 520 525" />
        </g>

        <text x="260" y="345" textAnchor="middle" fill="white" opacity=".055" fontSize="20" fontWeight="700" letterSpacing="7">
          CAMEROUN
        </text>

        {connections.map(([a, b], index) => {
          const from = getCity(a);
          const to = getCity(b);
          const x1 = (from.x / 100) * 500;
          const y1 = (from.y / 100) * 680;
          const x2 = (to.x / 100) * 500;
          const y2 = (to.y / 100) * 680;

          return (
            <motion.line
              key={`${a}-${b}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={index % 2 === 0 ? "#39B879" : CM.gold}
              strokeWidth="1.2"
              strokeDasharray="4 6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.45 }}
              transition={{ delay: 0.5 + index * 0.08, duration: 0.6 }}
            />
          );
        })}

        <motion.circle
          r="3"
          fill={CM.gold}
          initial={{ opacity: 0, cx: 215, cy: 475 }}
          animate={{ opacity: [0, 1, 1, 0], cx: [215, 265, 175, 265], cy: [475, 380, 325, 380] }}
          transition={{ duration: 4, repeat: Infinity, repeatDelay: 1, ease: "easeInOut" }}
          style={{ filter: `drop-shadow(0 0 8px rgba(212,175,55,.9))` }}
        />
      </svg>

      {cities.map((city, index) => (
        <motion.div
          key={city.name}
          className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${city.x}%`, top: `calc(30px + ${city.y / 100} * 590px)` }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 + index * 0.08, type: "spring" }}
        >
          {city.featured && (
            <motion.div
              className="absolute -inset-3 rounded-full"
              style={{ border: "1px solid rgba(57,184,121,.35)" }}
              animate={{ scale: [0.8, 1.6], opacity: [0.7, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
          <div
            className="relative h-3.5 w-3.5 rounded-full"
            style={{
              background: city.featured ? CM.gold : "#39B879",
              border: `2px solid ${colors.inkDeep}`,
              boxShadow: city.featured ? "0 0 18px rgba(212,175,55,.7)" : "0 0 14px rgba(57,184,121,.5)",
            }}
          />
          <span
            className="absolute left-1/2 top-5 -translate-x-1/2 whitespace-nowrap text-[9px] font-semibold"
            style={{ color: city.featured ? CM.gold : "rgba(255,255,255,.45)" }}
          >
            {city.name}
          </span>
        </motion.div>
      ))}

      <div className="absolute bottom-5 left-5 right-5 z-30 flex items-end justify-between">
        <div>
          <p className="text-[9px] uppercase tracking-[.2em]" style={{ color: "rgba(255,255,255,.25)" }}>Présence locale</p>
          <p className="mt-1 text-xs font-medium text-white">Douala · Yaoundé · Bafoussam · Buea</p>
        </div>
        <div className="rounded-xl px-3 py-2" style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)" }}>
          <p className="text-[9px]" style={{ color: "rgba(255,255,255,.3)" }}>Opportunités actives</p>
          <p className="mt-0.5 text-sm font-bold" style={{ color: "#39B879" }}>128</p>
        </div>
      </div>
    </div>
  );
}

// ─── Step card ────────────────────────────────────────────────────────────────
function StepCard({ number, title, desc, icon }: { number: string; title: string; desc: string; icon: React.ReactNode }) {
  return (
    <motion.div variants={fadeUp} className="relative">
      <div className="flex gap-5">
        <div className="flex-shrink-0 relative">
          <RoundelMedallion label={number} size={56} />
          {number !== "3" && (
            <div className="absolute top-14 left-1/2 -translate-x-1/2 w-px h-10 mt-1"
              style={{ background: `linear-gradient(180deg, rgba(212,175,55,0.4), transparent)` }} />
          )}
        </div>
        <div className="flex-1 pb-12">
          <div className="flex items-center gap-2 mb-2">
            <span style={{ color: CM.ember }}>{icon}</span>
            <h4 className="font-bold text-lg" style={{ color: colors.charcoal, fontFamily: FONT_DISPLAY }}>{title}</h4>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: colors.muted }}>{desc}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Feature card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, accent }: { icon: React.ReactNode; title: string; desc: string; accent: string }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -5, boxShadow: `0 20px 60px ${accent}18` }}
      className="p-6 rounded-2xl relative overflow-hidden group cursor-default"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
        style={{ background: `radial-gradient(circle at 30% 30%, ${accent}12, transparent 60%)` }} />
      <div className="relative">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
          style={{ background: `${accent}18`, color: accent }}>
          {icon}
        </div>
        <h4 className="font-bold text-white mb-2" style={{ fontFamily: FONT_DISPLAY }}>{title}</h4>
        <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>{desc}</p>
      </div>
    </motion.div>
  );
}

// ─── Testimonial card ─────────────────────────────────────────────────────────
function TestimonialCard({ name, role, company, text, rating, avatar }: {
  name: string; role: string; company: string; text: string; rating: number; avatar: string;
}) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -4, boxShadow: "0 20px 60px rgba(15,23,42,0.12)" }}
      className="p-7 rounded-2xl border bg-white flex flex-col gap-5"
      style={{ borderColor: colors.boneBorder }}
    >
      <div className="flex gap-0.5">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} size={14} fill={CM.gold} style={{ color: CM.gold }} />
        ))}
      </div>
      <p className="text-sm leading-relaxed flex-1" style={{ color: "#1E293B" }}>
        "{text}"
      </p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${colors.inkSoft}, #1E293B)`, color: CM.gold }}>
          {avatar}
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: colors.charcoal }}>{name}</p>
          <p className="text-xs" style={{ color: colors.muted }}>{role} — {company}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Landing Page ─────────────────────────────────────────────────────────
export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"freelancer" | "enterprise">("freelancer");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Fonctionnalités", href: "#features" },
    { label: "Comment ça marche", href: "#how" },
    { label: "Témoignages", href: "#testimonials" },
    { label: "Tarifs", href: "#pricing" },
  ];

  return (
    <div className="overflow-x-hidden" style={{ background: colors.ink, color: "#fff", fontFamily: FONT_BODY }}>
      <FontImports />

      {/* ── NAVBAR ───────────────────────────────────────────────────────── */}
      <motion.header
        initial={{ y: -72 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center"
        style={{
          background: scrolled ? "rgba(8,15,29,0.95)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(212,175,55,0.12)" : "none",
          transition: "all 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <div className="max-w-7xl mx-auto w-full px-6 flex items-center gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <motion.img
              src="/assets/logo-freekaolo-badge.png"
              alt="free-kaolo"
              whileHover={{ scale: 1.08, rotate: 4 }}
              transition={{ type: "spring", stiffness: 400, damping: 14 }}
              className="w-11 h-11 object-contain"
            />
            <span className="text-base font-bold tracking-tight" style={{ fontFamily: FONT_DISPLAY }}>
              free<span style={{ color: CM.gold }}>-kaolo</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {navLinks.map(link => (
              <a key={link.label} href={link.href}
                className="px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/8"
                style={{ color: "rgba(255,255,255,0.65)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.65)")}>
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA buttons */}
          <div className="hidden md:flex items-center gap-3 ml-auto">
            <Link to="/login"
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ color: "rgba(255,255,255,0.7)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}>
              Connexion
            </Link>
            <motion.div whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}>
              <Link to="/register/freelancer"
                className="px-4 py-2 rounded-xl text-sm font-semibold"
                style={{ background: `linear-gradient(135deg, ${CM.ember}, ${CM.gold})`, color: colors.ink }}>
                Commencer gratuitement
              </Link>
            </motion.div>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden ml-auto w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.07)" }}>
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed top-16 inset-x-0 z-40 md:hidden overflow-hidden"
            style={{ background: "rgba(8,15,29,0.98)", borderBottom: "1px solid rgba(212,175,55,0.12)" }}
          >
            <div className="px-6 py-4 space-y-2">
              {navLinks.map(link => (
                <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                  {link.label}
                </a>
              ))}
              <div className="pt-3 space-y-2 border-t" style={{ borderColor: "rgba(212,175,55,0.12)" }}>
                <Link to="/login" className="block px-4 py-2.5 rounded-xl text-sm text-white/70 text-center">Connexion</Link>
                <Link to="/register/freelancer"
                  className="block px-4 py-3 rounded-xl text-sm font-semibold text-center"
                  style={{ background: `linear-gradient(135deg, ${CM.ember}, ${CM.gold})`, color: colors.ink }}>
                  Commencer gratuitement
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <NdopTexture opacity={0.05} />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }} />
          <motion.div
            animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(212,175,55,0.16) 0%, transparent 70%)" }}
          />
          <motion.div
            animate={{ x: [0, -30, 0], y: [0, 40, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 4 }}
            className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(212,175,55,0.09) 0%, transparent 70%)" }}
          />
          <motion.div
            animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-[-5%] left-[40%] w-[400px] h-[400px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(27,122,67,0.07) 0%, transparent 70%)" }}
          />
        </div>

        <div className="max-w-7xl mx-auto w-full px-6 pt-28 pb-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-8"
                  style={{ background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.3)" }}>
                  <Sparkles size={12} style={{ color: CM.gold }} />
                  <span className="text-xs font-semibold" style={{ color: CM.gold }}>
                    Le réseau freelance du Cameroun
                  </span>
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="text-5xl xl:text-6xl font-extrabold leading-[1.08] tracking-tight mb-6"
                style={{ fontFamily: FONT_DISPLAY }}
              >
                Connectez les{" "}
                <span className="relative inline-block">
                  <span style={{
                    background: `linear-gradient(135deg, ${CM.ember}, #F5D769, ${CM.ember})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}>meilleurs talents</span>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute -bottom-1 left-0 right-0 h-0.5 origin-left"
                    style={{ background: `linear-gradient(90deg, ${CM.ember}, transparent)` }}
                  />
                </span>{" "}
                aux meilleures{" "}
                <span style={{ color: "rgba(255,255,255,0.5)" }}>opportunités</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="text-lg leading-relaxed mb-10"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                free-kaolo connecte les talents, freelancers et entreprises du Cameroun.
                Profils certifiés, paiements Mobile Money, messagerie temps réel et outils intelligents pour travailler plus simplement.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-wrap gap-3 mb-12"
              >
                <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
                  <Link to="/register/freelancer"
                    className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold"
                    style={{ background: `linear-gradient(135deg, ${CM.ember}, ${CM.gold})`, color: colors.ink }}>
                    Je suis freelancer
                    <ArrowRight size={15} />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
                  <Link to="/register/enterprise"
                    className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold"
                    style={{ background: "rgba(255,255,255,0.07)", color: "#fff", border: "1px solid rgba(255,255,255,0.12)" }}>
                    Je recrute
                    <Briefcase size={15} />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link to="/freelancer/dashboard"
                    className="flex items-center gap-2 px-4 py-3.5 rounded-xl text-sm font-medium"
                    style={{ color: "rgba(255,255,255,0.5)" }}>
                    <Play size={13} />
                    Voir la démo
                  </Link>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.48, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-wrap gap-8 pt-8 border-t"
                style={{ borderColor: "rgba(212,175,55,0.15)" }}
              >
                {[
                  { value: 2400, suffix: "+", label: "Freelancers actifs" },
                  { value: 850, suffix: "+", label: "Entreprises clientes" },
                  { value: 98, suffix: "%", label: "Taux de satisfaction" },
                ].map(stat => (
                  <div key={stat.label}>
                    <p className="text-3xl font-extrabold tracking-tight" style={{ color: CM.gold, fontFamily: FONT_DISPLAY }}>
                      <Counter value={stat.value} suffix={stat.suffix} />
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 40, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <CameroonNetworkMap />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.1 }}
                className="absolute -left-5 top-20 hidden rounded-xl px-3 py-2 sm:block"
                style={{ background: "rgba(8,15,29,.92)", border: "1px solid rgba(57,184,121,.2)", boxShadow: "0 15px 40px rgba(0,0,0,.35)" }}
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck size={15} style={{ color: "#39B879" }} />
                  <div>
                    <p className="text-[10px] font-bold text-white">Profils vérifiés</p>
                    <p className="text-[8px]" style={{ color: "rgba(255,255,255,.35)" }}>Identité contrôlée</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.35 }}
                className="absolute -right-5 top-[42%] hidden rounded-xl px-3 py-2 sm:block"
                style={{ background: "rgba(8,15,29,.92)", border: "1px solid rgba(212,175,55,.22)", boxShadow: "0 15px 40px rgba(0,0,0,.35)" }}
              >
                <div className="flex items-center gap-2">
                  <CreditCard size={15} style={{ color: CM.gold }} />
                  <div>
                    <p className="text-[10px] font-bold text-white">Paiement sécurisé</p>
                    <p className="text-[8px]" style={{ color: "rgba(255,255,255,.35)" }}>Transaction protégée</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-10">
          <CeremonialBand tone="dark" />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <ChevronDown size={20} style={{ color: "rgba(255,255,255,0.3)" }} />
          </motion.div>
        </motion.div>
      </section>

      {/* ── TRUSTED BY ───────────────────────────────────────────────────── */}
      <section className="py-12 border-y" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(212,175,55,0.1)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs font-semibold uppercase tracking-widest mb-8"
            style={{ color: "rgba(255,255,255,0.25)" }}>
            Des centaines d'entreprises nous font confiance
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16">
            {[
              "MTN Cameroun", "Orange Cameroun", "Afriland First Bank", "Camtel",
              "UBA Cameroun", "YUP Cameroun", "Entreprises camerounaises", "Startups camerounaises",
            ].map((name, i) => (
              <motion.p
                key={name}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="text-sm font-semibold tracking-wide"
                style={{ color: "rgba(255,255,255,0.2)" }}
              >
                {name}
              </motion.p>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────── */}
      <section id="features" className="py-28 relative">
        <NdopTexture opacity={0.04} />
        <div className="max-w-7xl mx-auto px-6 relative">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.div variants={fadeUp}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5"
              style={{ background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.28)" }}>
              <Zap size={11} style={{ color: CM.gold }} />
              <span className="text-xs font-semibold" style={{ color: CM.gold }}>Tout ce dont vous avez besoin</span>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl xl:text-5xl font-extrabold text-white tracking-tight mb-5" style={{ fontFamily: FONT_DISPLAY }}>
              Une plateforme complète,<br />pensée pour le Cameroun
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg max-w-2xl mx-auto" style={{ color: "rgba(255,255,255,0.45)" }}>
              Chaque fonctionnalité est pensée pour les usages, les paiements et les besoins du marché camerounais.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {[
              {
                icon: <Sparkles size={20} />, title: "Assistant IA intégré",
                desc: "Optimisez votre profil, analysez le marché et obtenez des recommandations personnalisées grâce à l'intelligence artificielle.",
                accent: CM.gold,
              },
              {
                icon: <Shield size={20} />, title: "Profils certifiés",
                desc: "Chaque freelancer passe par une vérification rigoureuse. Diplômes validés, compétences testées, identité confirmée.",
                accent: "#22C55E",
              },
              {
                icon: <CreditCard size={20} />, title: "Paiements sécurisés",
                desc: "Orange Money Cameroun, MTN Mobile Money, virement bancaire. Paiements escrow pour une sécurité totale des deux côtés.",
                accent: "#3B82F6",
              },
              {
                icon: <MessageSquare size={20} />, title: "Messagerie temps réel",
                desc: "Collaborez directement avec vos clients ou talents. Partage de fichiers, groupes de projet, notifications instantanées.",
                accent: "#8B5CF6",
              },
              {
                icon: <BarChart3 size={20} />, title: "Analytics avancés",
                desc: "Tableaux de bord détaillés pour freelancers et entreprises. Suivez vos revenus, candidatures et performances.",
                accent: "#F59E0B",
              },
              {
                icon: <Globe size={20} />, title: "Paiements adaptés au Cameroun",
                desc: "Mobile Money, virement bancaire et paiements en XAF pour travailler simplement avec vos clients et talents.",
                accent: CM.green,
              },
            ].map(f => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section id="how" className="py-28" style={{ background: colors.bone }}>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}
            variants={stagger} className="text-center mb-14"
          >
            <motion.div variants={fadeUp}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5"
              style={{ background: "rgba(15,23,42,0.07)", border: "1px solid rgba(15,23,42,0.12)" }}>
              <Clock size={11} style={{ color: colors.charcoal }} />
              <span className="text-xs font-semibold" style={{ color: colors.charcoal }}>Simple & rapide</span>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl xl:text-5xl font-extrabold tracking-tight mb-5"
              style={{ color: colors.charcoal, fontFamily: FONT_DISPLAY }}>
              Comment ça fonctionne ?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg max-w-xl mx-auto" style={{ color: colors.muted }}>
              Démarrez en 5 minutes, trouvez votre premier projet ou talent dès aujourd'hui.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-14"
          >
            <div className="flex gap-1 p-1 rounded-2xl" style={{ background: "#E2E8F0" }}>
              {(["freelancer", "enterprise"] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300"
                  style={{
                    background: activeTab === tab ? colors.charcoal : "transparent",
                    color: activeTab === tab ? "#fff" : colors.muted,
                    boxShadow: activeTab === tab ? "0 4px 16px rgba(15,23,42,0.25)" : "none",
                  }}>
                  {tab === "freelancer" ? "Je suis Freelancer" : "Je suis une Entreprise"}
                </button>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}
              variants={stagger}
            >
              <AnimatePresence mode="wait">
                {activeTab === "freelancer" ? (
                  <motion.div key="fl" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.35 }} className="space-y-0">
                    <StepCard number="1" icon={<Users size={18} />} title="Créez votre profil"
                      desc="Inscrivez-vous gratuitement, renseignez vos compétences, téléversez vos diplômes et références. Notre équipe valide votre profil sous 24h." />
                    <StepCard number="2" icon={<Briefcase size={18} />} title="Candidatez aux projets"
                      desc="Parcourez les offres filtrées par compétence, budget et localisation. Postulez en un clic avec votre profil certifié." />
                    <StepCard number="3" icon={<CreditCard size={18} />} title="Livrez & soyez payé"
                      desc="Travaillez en toute sécurité. Le paiement est bloqué en escrow et libéré à la validation du projet. Via Mobile Money ou virement." />
                  </motion.div>
                ) : (
                  <motion.div key="ent" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.35 }} className="space-y-0">
                    <StepCard number="1" icon={<Briefcase size={18} />} title="Publiez votre projet"
                      desc="Décrivez votre besoin, définissez le budget et les compétences requises. Votre annonce est mise en ligne instantanément." />
                    <StepCard number="2" icon={<Users size={18} />} title="Sélectionnez les talents"
                      desc="Recevez des candidatures qualifiées et certifiées. Notre IA vous suggère les meilleurs profils selon votre besoin." />
                    <StepCard number="3" icon={<CheckCircle size={18} />} title="Collaborez & validez"
                      desc="Gérez votre projet via la messagerie intégrée. Validez les livrables et libérez le paiement en toute sécurité." />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="relative rounded-3xl overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${colors.inkSoft}, #1E293B)`, minHeight: 360, border: "1px solid rgba(212,175,55,0.12)" }}
            >
              <div className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }} />

              <div className="relative p-8 h-full flex flex-col justify-center gap-5">
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(212,175,55,0.7)" }}>
                  {activeTab === "freelancer" ? "Votre espace freelancer" : "Votre espace recruteur"}
                </p>
                <div className="space-y-3">
                  {(activeTab === "freelancer" ? [
                    { label: "Profil complété", value: "85%", color: CM.gold, w: 85 },
                    { label: "Candidatures envoyées", value: "12", color: "#3B82F6", w: 70 },
                    { label: "Taux de réponse", value: "73%", color: "#22C55E", w: 73 },
                  ] : [
                    { label: "Projets actifs", value: "5", color: CM.gold, w: 60 },
                    { label: "Candidatures reçues", value: "47", color: "#8B5CF6", w: 90 },
                    { label: "Budget utilisé", value: "62%", color: "#F59E0B", w: 62 },
                  ]).map(item => (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span style={{ color: "rgba(255,255,255,0.5)" }}>{item.label}</span>
                        <span className="font-semibold" style={{ color: item.color }}>{item.value}</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${item.w}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                          className="h-full rounded-full"
                          style={{ background: item.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to={activeTab === "freelancer" ? "/register/freelancer" : "/register/enterprise"}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold mt-2"
                    style={{ background: `linear-gradient(135deg, ${CM.ember}, ${CM.gold})`, color: colors.ink }}>
                    {activeTab === "freelancer" ? "Créer mon profil" : "Publier un projet"}
                    <ArrowRight size={14} />
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <CeremonialBand tone="light" />

      {/* ── STATS ────────────────────────────────────────────────────────── */}
      <section className="py-24 relative" style={{ background: colors.ink }}>
        <NdopTexture opacity={0.035} />
        <div className="max-w-7xl mx-auto px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <RamSpiralIcon size={18} />
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: CM.gold }}>
                Force du réseau
              </span>
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight" style={{ fontFamily: FONT_DISPLAY }}>
              Des chiffres qui parlent d'eux-mêmes
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: 2400, suffix: "+", label: "Freelancers certifiés", icon: <Users size={22} />, color: CM.gold },
              { value: 850, suffix: "+", label: "Entreprises clientes", icon: <Briefcase size={22} />, color: "#3B82F6" },
              { value: 15, prefix: "", suffix: "M+ XOF", label: "Versés aux freelancers", icon: <CreditCard size={22} />, color: "#22C55E" },
              { value: 98, suffix: "%", label: "Taux de satisfaction", icon: <Star size={22} />, color: "#F59E0B" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4 }}
                className="p-8 rounded-2xl text-center relative overflow-hidden"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(212,175,55,0.1)" }}
              >
                <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `radial-gradient(circle at 50% 0%, ${stat.color}10, transparent 60%)` }} />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-5"
                    style={{ background: `${stat.color}15`, color: stat.color }}>
                    {stat.icon}
                  </div>
                  <p className="text-4xl font-extrabold tracking-tight mb-2" style={{ color: stat.color, fontFamily: FONT_DISPLAY }}>
                    <Counter value={stat.value} suffix={stat.suffix} prefix={stat.prefix || ""} />
                  </p>
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section id="testimonials" className="py-28" style={{ background: colors.bone }}>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}
            variants={stagger} className="text-center mb-14"
          >
            <motion.div variants={fadeUp}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5"
              style={{ background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.24)" }}>
              <Star size={11} fill={CM.gold} style={{ color: CM.gold }} />
              <span className="text-xs font-semibold" style={{ color: colors.charcoal }}>Ils nous font confiance</span>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl xl:text-5xl font-extrabold tracking-tight"
              style={{ color: colors.charcoal, fontFamily: FONT_DISPLAY }}>
              Ce que disent nos utilisateurs
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <TestimonialCard
              name="Brice Fotso" role="Développeur Mobile" company="Douala, Cameroun" avatar="BF"
              rating={5}
              text="Grâce à free-kaolo, je travaille désormais avec des clients avec des entreprises camerounaises sans quitter Douala. Le paiement via Orange Money Cameroun arrive en quelques minutes après validation du livrable."
            />
            <TestimonialCard
              name="Kévin M." role="Développeur Full-Stack" company="Yaoundé, Cameroun" avatar="KM"
              rating={5}
              text="free-kaolo a transformé ma carrière. En 3 mois, j'ai décroché 4 projets pour des entreprises camerounaises. Les paiements via Mobile Money sont instantanés et sécurisés."
            />
            <TestimonialCard
              name="Aminata N." role="DRH" company="Douala, Cameroun" avatar="AN"
              rating={5}
              text="Nous recrutons exclusivement via free-kaolo depuis 8 mois. La qualité des profils certifiés est excellente. L'IA de recommandation nous fait gagner un temps précieux dans la sélection."
            />
            <TestimonialCard
              name="Sophie A." role="Designer UX/UI" company="Buea, Cameroun" avatar="SA"
              rating={5}
              text="La plateforme est intuitive et le support local est un vrai plus. J'ai pu augmenter mes tarifs de 40% grâce à la certification de mon profil et à la visibilité que ça m'apporte."
            />
          </motion.div>
        </div>
      </section>

      {/* ── DUAL CTA ─────────────────────────────────────────────────────── */}
      <section className="py-24" style={{ background: colors.ink }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 24, x: -20 }}
              whileInView={{ opacity: 1, y: 0, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="relative p-10 rounded-3xl overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${colors.inkSoft}, #1E293B)`, border: "1px solid rgba(212,175,55,0.14)" }}
            >
              <div className="absolute top-0 right-0 w-64 h-64 opacity-10"
                style={{ background: `radial-gradient(circle, ${CM.ember}, transparent 70%)` }} />
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
                  style={{ background: "rgba(212,175,55,0.18)", color: CM.gold }}>
                  <Users size={22} />
                </div>
                <h3 className="text-2xl font-extrabold text-white mb-3" style={{ fontFamily: FONT_DISPLAY }}>Pour les freelancers</h3>
                <p className="text-sm leading-relaxed mb-8" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Créez votre profil certifié, accédez à des projets au Cameroun et soyez payé en toute sécurité. Rejoignez une communauté de freelancers en pleine croissance.
                </p>
                <ul className="space-y-2 mb-8">
                  {["Profil certifié gratuit", "Commissions réduites (8%)", "Paiements escrow sécurisés", "Support dédié 7j/7"].map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
                      <CheckCircle size={14} style={{ color: "#22C55E" }} /> {item}
                    </li>
                  ))}
                </ul>
                <motion.div whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}>
                  <Link to="/register/freelancer"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold"
                    style={{ background: `linear-gradient(135deg, ${CM.ember}, ${CM.gold})`, color: colors.ink }}>
                    Créer mon profil gratuitement <ArrowRight size={14} />
                  </Link>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24, x: 20 }}
              whileInView={{ opacity: 1, y: 0, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="relative p-10 rounded-3xl overflow-hidden"
              style={{ background: "linear-gradient(135deg, #1A1200, #2D1E00)", border: "1px solid rgba(212,175,55,0.22)" }}
            >
              <div className="absolute top-0 right-0 w-64 h-64 opacity-15"
                style={{ background: `radial-gradient(circle, ${CM.gold}, transparent 70%)` }} />
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
                  style={{ background: "rgba(212,175,55,0.2)", color: CM.gold }}>
                  <Briefcase size={22} />
                </div>
                <h3 className="text-2xl font-extrabold mb-3" style={{ color: CM.gold, fontFamily: FONT_DISPLAY }}>Pour les entreprises</h3>
                <p className="text-sm leading-relaxed mb-8" style={{ color: "rgba(212,175,55,0.6)" }}>
                  Accédez à un vivier de talents camerounais certifiés. Publiez votre projet et recevez des candidatures qualifiées en 24h.
                </p>
                <ul className="space-y-2 mb-8">
                  {["Publication de projet gratuite", "Talents certifiés et vérifiés", "IA de recommandation incluse", "Gestion centralisée RH"].map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm" style={{ color: "rgba(212,175,55,0.8)" }}>
                      <CheckCircle size={14} style={{ color: CM.gold }} /> {item}
                    </li>
                  ))}
                </ul>
                <motion.div whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}>
                  <Link to="/register/enterprise"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold"
                    style={{ background: "rgba(212,175,55,0.16)", color: CM.gold, border: "1px solid rgba(212,175,55,0.32)" }}>
                    Recruter maintenant <ArrowRight size={14} />
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
      <section className="py-28 relative overflow-hidden" style={{ background: `linear-gradient(135deg, #0D1829, ${colors.inkSoft})` }}>
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-5"
            style={{ background: `conic-gradient(from 0deg, ${CM.ember}, transparent, ${CM.gold})` }}
          />
        </div>
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="max-w-3xl mx-auto px-6 text-center relative z-10"
        >
          <motion.p variants={fadeUp} className="text-sm font-semibold uppercase tracking-widest mb-5"
            style={{ color: CM.gold }}>
            Construisons le freelancing camerounais
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl xl:text-5xl font-extrabold text-white tracking-tight mb-6" style={{ fontFamily: FONT_DISPLAY }}>
            Prêt à transformer votre carrière ou votre recrutement ?
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg mb-12" style={{ color: "rgba(255,255,255,0.45)" }}>
            Des milliers de talents et d'entreprises camerounaises construisent déjà leur avenir professionnel. Inscription gratuite, sans engagement.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4">
            <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
              <Link to="/register/freelancer"
                className="flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold"
                style={{ background: `linear-gradient(135deg, ${CM.ember}, ${CM.gold})`, color: colors.ink }}>
                Commencer gratuitement <ArrowRight size={16} />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
              <Link to="/login"
                className="flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold"
                style={{ background: "rgba(255,255,255,0.07)", color: "#fff", border: "1px solid rgba(255,255,255,0.12)" }}>
                Se connecter
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      <CeremonialBand tone="dark" />

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer style={{ background: "#050A14", borderTop: "1px solid rgba(212,175,55,0.1)" }}>
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
            <div className="col-span-2 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <img src="/assets/logo-freekaolo-badge.png" alt="free-kaolo" className="w-10 h-10 object-contain" />
                <span className="text-base font-bold text-white" style={{ fontFamily: FONT_DISPLAY }}>
                  free<span style={{ color: CM.gold }}>-kaolo</span>
                </span>
              </div>
              <p className="text-sm leading-relaxed mb-6" style={{ color: "rgba(255,255,255,0.35)" }}>
                La plateforme qui connecte les meilleurs freelancers aux meilleures entreprises camerounaises. Certifié, sécurisé, efficace.
              </p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Disponible partout au Cameroun</span>
              </div>
            </div>

            {[
              {
                title: "Plateforme",
                links: ["Fonctionnalités", "Comment ça marche", "Tarifs", "Sécurité"],
              },
              {
                title: "Pour les freelancers",
                links: ["Créer un profil", "Trouver des projets", "Paiements", "Assistant IA"],
              },
              {
                title: "Pour les entreprises",
                links: ["Publier un projet", "Rechercher des talents", "Gestion RH", "Facturation"],
              },
            ].map(col => (
              <div key={col.title}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-4"
                  style={{ color: "rgba(255,255,255,0.25)" }}>
                  {col.title}
                </p>
                <ul className="space-y-2.5">
                  {col.links.map(link => (
                    <li key={link}>
                      <a href="#" className="text-sm transition-colors"
                        style={{ color: "rgba(255,255,255,0.4)" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")}
                        onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}>
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t"
            style={{ borderColor: "rgba(212,175,55,0.1)" }}>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
              © 2026 free-kaolo. Tous droits réservés.
            </p>
            <div className="flex gap-6">
              {["Mentions légales", "Confidentialité", "CGU", "Cookies"].map(item => (
                <a key={item} href="#" className="text-xs transition-colors"
                  style={{ color: "rgba(255,255,255,0.25)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}>
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}