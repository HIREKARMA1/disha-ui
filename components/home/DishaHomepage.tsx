// @ts-nocheck — ported from design reference; UI-first integration
"use client"

import React, { useState, useEffect, useRef, useContext, createContext } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  Briefcase,
  Target,
  Video,
  Library,
  Presentation,
  School,
  Megaphone,
  ArrowRight,
  ArrowLeft,
  UserCircle2,
  Menu,
  X,
  Bell,
  ChevronDown,
  Sun,
  Moon,
  Globe,
  Linkedin,
  Facebook,
  Instagram,
  Plus,
  Sparkles,
  TrendingUp,
  Zap,
  MapPin,
} from "lucide-react";
import placedData from "@/data/placed-students.json";
import { getFeaturedBlogs } from "@/data/blogs";

/* ================================================================== */
/*  Tokens                                                             */
/* ================================================================== */
const ACCENT = {
  navy: "#1b52a4",
  sky: "#00a2e5",
  yellow: "#fec40d",
  orange: "#f58020",
  red: "#d64246",
  green: "#098855",
};

const THEMES = {
  dark: {
    bg: "#0a1428",
    surface: "#101d38",
    card: "#152549",
    border: "rgba(255,255,255,0.08)",
    text1: "rgba(255,255,255,0.95)",
    text2: "rgba(255,255,255,0.60)",
    text3: "rgba(255,255,255,0.45)",
    text4: "rgba(255,255,255,0.30)",
    chipBorder: "rgba(255,255,255,0.15)",
    heroImgShade: "linear-gradient(180deg, rgba(10,20,40,0) 40%, rgba(10,20,40,0.75) 100%)",
    cardFloat: "rgba(16,29,56,0.96)",
    cardShadow: "none",
  },
  light: {
    bg: "#f6f8fc",
    surface: "#ffffff",
    card: "#ffffff",
    border: "rgba(10,20,40,0.08)",
    text1: "rgba(10,20,40,0.92)",
    text2: "rgba(10,20,40,0.62)",
    text3: "rgba(10,20,40,0.48)",
    text4: "rgba(10,20,40,0.34)",
    chipBorder: "rgba(10,20,40,0.15)",
    heroImgShade: "linear-gradient(180deg, rgba(246,248,252,0) 45%, rgba(246,248,252,0.85) 100%)",
    cardFloat: "rgba(255,255,255,0.97)",
    cardShadow: "0 1px 3px rgba(10,20,40,0.07)",
  },
};

const PERSONAS = {
  student: {
    label: "Students",
    headline: "One platform for your first big career move.",
    sub1: "Explore roles, check eligibility, and apply in minutes — synced with your university's placement cell.",
    sub2: "Track every application status in real time, no more chasing emails for updates.",
    cta: "Get started",
    ctaSecondary: "See open roles",
    highlight: "students",
    accent: ACCENT.sky,
    loginType: "student",
    heroImage: "https://hirekarma.s3.us-east-1.amazonaws.com/disha-ui/disha_hero_img.jpg",
    heroAlt: "Student exploring campus opportunities",
  },
  university: {
    label: "Universities",
    headline: "Run every campus drive from one dashboard.",
    sub1: "Coordinate drives, approve students, and track outcomes without spreadsheets or scattered emails.",
    sub2: "Give your placement cell one shared view across every recruiter and every batch.",
    cta: "Partner with us",
    ctaSecondary: "See how it works",
    highlight: "universities",
    accent: ACCENT.orange,
    loginType: "university",
    heroImage: "https://disha-ui.s3.ap-south-1.amazonaws.com/Homepage_UI/Univer.jpeg",
    heroAlt: "University graduates celebrating campus placement success",
  },
  corporate: {
    label: "Corporates",
    headline: "Hire campus talent without the chaos.",
    sub1: "Post roles, screen video resumes, and shortlist across partner universities in one flow.",
    sub2: "Cut time-to-shortlist with AI matching built for volume hiring seasons.",
    cta: "Post a job",
    ctaSecondary: "Talk to sales",
    highlight: "companies",
    accent: ACCENT.green,
    loginType: "corporate",
    heroImage: "https://disha-ui.s3.ap-south-1.amazonaws.com/Homepage_UI/Corporate.jpeg",
    heroAlt: "Corporate team hiring campus talent",
  },
};

const PERSONA_ORDER = ["student", "university", "corporate"];

const NAV_LINKS = [
  { id: "top", label: "Home" },
  { id: "features", label: "Features" },
  { id: "how-it-works", label: "How it works" },
  { id: "placements", label: "Placements" },
  { id: "blogs", label: "Blogs" },
  { id: "faq", label: "FAQ" },
];

const AppCtx = createContext(null);
const useApp = () => useContext(AppCtx);

/* ================================================================== */
/*  Scroll reveal                                                      */
/* ================================================================== */
function useReveal(options: { threshold?: number; immediate?: boolean } = {}) {
  const { threshold = 0.12, immediate = false } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(immediate);
  useEffect(() => {
    if (immediate) {
      setV(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setV(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -5% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, immediate]);
  return [ref, v] as [typeof ref, boolean];
}

function Reveal({
  children,
  delay = 0,
  className = "",
  immediate = false,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  immediate?: boolean;
}) {
  const [ref, v] = useReveal({ immediate });
  const show = immediate || v;
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0)" : "translateY(16px)",
        transition: `opacity .55s ease ${delay}ms, transform .55s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ================================================================== */
/*  Animated counter                                                   */
/* ================================================================== */
function useCountUp(target: number, { duration = 1400, start = false }: { duration?: number; start?: boolean } = {}) {
  const [val, setVal] = useState(0);
  const ranRef = useRef(false);
  useEffect(() => {
    if (!start || ranRef.current) return;
    ranRef.current = true;
    let raf: number;
    const t0 = performance.now();
    const ease = (x) => 1 - Math.pow(1 - x, 3);
    const step = (now) => {
      const p = Math.min(1, (now - t0) / duration);
      setVal(Math.round(ease(p) * target));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [start, target, duration]);
  return val;
}

function StatCounter({ id, target, suffix, label, delay = 0 }) {
  const { t, persona } = useApp();
  const [ref, v] = useReveal();
  const n = useCountUp(target, { start: v, duration: 1200 + delay });
  const isHot = PERSONAS[persona].highlight === id;
  return (
    <div
      ref={ref}
      className="min-w-0 text-center transition-transform duration-300 md:text-left"
      style={{ transform: isHot ? "scale(1.08)" : "scale(1)" }}
    >
      <p
        className="text-lg font-bold transition-colors duration-300 sm:text-xl"
        style={{ color: isHot ? PERSONAS[persona].accent : ACCENT.yellow, fontFamily: "Sora, sans-serif" }}
      >
        {n}
        {suffix}
      </p>
      <p className="text-[11px] leading-tight sm:text-xs" style={{ color: t.text3 }}>
        {label}
      </p>
    </div>
  );
}

/* ================================================================== */
/*  Scroll progress bar                                                */
/* ================================================================== */
function ScrollProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const scrollable = h.scrollHeight - h.clientHeight;
      setPct(scrollable > 0 ? (h.scrollTop / scrollable) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="fixed top-0 left-0 right-0 h-[3px] z-[60]" style={{ backgroundColor: "transparent" }}>
      <div
        className="h-full transition-[width] duration-150 ease-out"
        style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${ACCENT.orange}, ${ACCENT.sky}, ${ACCENT.green})` }}
      />
    </div>
  );
}

/* ================================================================== */
/*  NavBar                                                              */
/* ================================================================== */
function ThemeToggle() {
  const { mode, toggle, t } = useApp();
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="w-9 h-9 rounded-lg flex items-center justify-center border transition-all hover:scale-105 active:scale-95"
      style={{ borderColor: t.chipBorder, color: t.text2 }}
    >
      {mode === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function NavBar() {
  const [open, setOpen] = useState(false);
  const { t, mode, active, persona } = useApp();
  const authType = PERSONAS[persona]?.loginType || "student";
  const logoSrc = mode === "dark" ? "/images/HKlogowhite.png" : "/images/HKlogoblack.png";
  return (
    <header
      className="sticky top-0 z-50 backdrop-blur border-b transition-colors duration-300"
      style={{ backgroundColor: mode === "dark" ? "rgba(10,20,40,0.85)" : "rgba(246,248,252,0.85)", borderColor: t.border }}
    >
      <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between gap-6">
        <button onClick={() => scrollToId("top")} className="shrink-0 flex items-center" aria-label="HireKarma home">
          <img src={logoSrc} alt="HireKarma" className="h-8 w-auto object-contain" />
        </button>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <button
              key={l.id}
              onClick={() => scrollToId(l.id)}
              className="relative px-3 py-2 text-sm font-medium transition-colors"
              style={{ color: active === l.id ? t.text1 : t.text3 }}
            >
              {l.label}
              <span
                className="absolute left-3 right-3 -bottom-[1px] h-[2px] rounded-full transition-transform duration-300 origin-left"
                style={{ backgroundColor: ACCENT.sky, transform: active === l.id ? "scaleX(1)" : "scaleX(0)" }}
              />
            </button>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3 shrink-0">
          <ThemeToggle />
          <Link
            href={`/auth/register?type=${authType}`}
            className="text-sm px-4 py-2 rounded-lg border hover:bg-white/5 transition-colors"
            style={{ borderColor: t.chipBorder, color: t.text2 }}
          >
            Sign up
          </Link>
          <Link
            href={`/auth/login?type=${authType}`}
            className="text-sm font-semibold px-4 py-2 rounded-lg transition-transform hover:-translate-y-0.5"
            style={{ backgroundColor: ACCENT.sky, color: "#042c53" }}
          >
            Sign in
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button style={{ color: t.text1 }} onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden px-5 pb-5 border-t" style={{ borderColor: t.border }}>
          <div className="flex flex-col gap-1 py-3">
            {NAV_LINKS.map((l) => (
              <button
                key={l.id}
                onClick={() => {
                  scrollToId(l.id);
                  setOpen(false);
                }}
                className="text-left text-sm font-medium py-2"
                style={{ color: active === l.id ? ACCENT.sky : t.text2 }}
              >
                {l.label}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <Link
              href={`/auth/register?type=${authType}`}
              className="flex-1 text-center text-sm px-4 py-2 rounded-lg border"
              style={{ borderColor: t.chipBorder, color: t.text1 }}
            >
              Sign up
            </Link>
            <Link
              href={`/auth/login?type=${authType}`}
              className="flex-1 text-center text-sm font-semibold px-4 py-2 rounded-lg"
              style={{ backgroundColor: ACCENT.sky, color: "#042c53" }}
            >
              Sign in
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

/* ================================================================== */
/*  Hero                                                                */
/* ================================================================== */
function FloatingCard({ className, icon: Icon, color, title, subtitle, floatDelay = 0 }) {
  const { t } = useApp();
  return (
    <div
      className={`absolute rounded-xl px-3.5 py-2.5 md:px-4 md:py-3 items-center gap-2.5 md:gap-3 shadow-2xl hk-float ${className}`}
      style={{
        backgroundColor: t.cardFloat,
        border: `1px solid ${t.border}`,
        backdropFilter: "blur(8px)",
        boxShadow: `0 10px 30px -8px ${color}44`,
        animationDelay: `${floatDelay}ms`,
      }}
    >
      <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}22` }}>
        <Icon size={15} color={color} />
      </div>
      <div>
        <p className="text-[11px] md:text-xs font-semibold leading-tight" style={{ color: t.text1 }}>{title}</p>
        <p className="text-[10px] md:text-[11px] leading-tight" style={{ color: t.text3 }}>{subtitle}</p>
      </div>
    </div>
  );
}

const TICKER_BY_PERSONA = {
  student: [
    "Frontend Intern · Tech Mahindra · Bengaluru",
    "Data Analyst · WeIntern · Remote",
    "QA Engineer · Jowib Technology · Pune",
    "Backend Developer · Thundersoft · Hyderabad",
    "UI/UX Intern · Incture Technologies · Bengaluru",
    "Support Engineer · Elision Technologies · Noida",
  ],
  university: [
    "Campus drive live · Tech Mahindra · 120 applicants",
    "Placement cell · Batch 2026 · Offers tracking",
    "Recruiter visit · Thundersoft · This week",
    "Eligibility sync · 3 new roles · Auto-approved",
    "Drive report · WeIntern · Shortlist ready",
    "Partner college network · 20+ universities",
  ],
  corporate: [
    "Shortlist ready · KIIT · 48 candidates",
    "Video resumes · Frontend cohort · Review now",
    "Campus pipeline · Odisha colleges · Active",
    "AI match · Backend roles · 92% fit",
    "Interview slots · This week · 16 scheduled",
    "Offer stage · 7 candidates · Pending decision",
  ],
};

const BUBBLES_BY_PERSONA = {
  student: [
    { className: "-top-3 -left-3 md:-top-4 md:-left-3", icon: Bell, color: ACCENT.orange, title: "New job posted", subtitle: "Frontend intern, Bengaluru", floatDelay: 0 },
    { className: "-bottom-3 -right-3 md:-bottom-4 md:-right-4", icon: UserCircle2, color: ACCENT.sky, title: "Profile 85% complete", subtitle: "Add one more skill", floatDelay: 700 },
    { className: "top-1/3 -right-3 md:-right-5 hidden sm:flex", icon: Sparkles, color: ACCENT.yellow, title: "12,000+ placed", subtitle: "Your turn could be next", floatDelay: 350 },
    { className: "bottom-1/4 -left-3 md:-left-4 hidden sm:flex", icon: TrendingUp, color: ACCENT.green, title: "92% skill match", subtitle: "Nice fit for backend roles", floatDelay: 1050 },
  ],
  university: [
    { className: "-top-3 -left-3 md:-top-4 md:-left-3", icon: Megaphone, color: ACCENT.orange, title: "Drive live today", subtitle: "Tech Mahindra on campus", floatDelay: 0 },
    { className: "-bottom-3 -right-3 md:-bottom-4 md:-right-4", icon: School, color: ACCENT.sky, title: "120 students approved", subtitle: "Batch 2026 ready", floatDelay: 700 },
    { className: "top-1/3 -right-3 md:-right-5 hidden sm:flex", icon: TrendingUp, color: ACCENT.yellow, title: "Placement report", subtitle: "Offers up 18% this season", floatDelay: 350 },
    { className: "bottom-1/4 -left-3 md:-left-4 hidden sm:flex", icon: Briefcase, color: ACCENT.green, title: "Recruiter waiting", subtitle: "Confirm slot by Friday", floatDelay: 1050 },
  ],
  corporate: [
    { className: "-top-3 -left-3 md:-top-4 md:-left-3", icon: Target, color: ACCENT.orange, title: "Shortlist ready", subtitle: "48 campus matches", floatDelay: 0 },
    { className: "-bottom-3 -right-3 md:-bottom-4 md:-right-4", icon: Video, color: ACCENT.sky, title: "AI screening done", subtitle: "Review top 12 now", floatDelay: 700 },
    { className: "top-1/3 -right-3 md:-right-5 hidden sm:flex", icon: School, color: ACCENT.yellow, title: "3 colleges synced", subtitle: "Odisha hiring pool", floatDelay: 350 },
    { className: "bottom-1/4 -left-3 md:-left-4 hidden sm:flex", icon: Presentation, color: ACCENT.green, title: "Interviews booked", subtitle: "16 slots this week", floatDelay: 1050 },
  ],
};

function LiveTicker() {
  const { t, persona } = useApp();
  const items = TICKER_BY_PERSONA[persona] || TICKER_BY_PERSONA.student;
  const row = [...items, ...items];
  return (
    <div
      className="relative overflow-hidden rounded-full border py-2.5"
      style={{ borderColor: t.chipBorder, backgroundColor: t.mode === "dark" ? "rgba(255,255,255,0.02)" : "rgba(10,20,40,0.02)" }}
    >
      <style>{`
        @keyframes hkTicker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .hk-ticker-track { animation: hkTicker 26s linear infinite; }
        .hk-ticker-track:hover { animation-play-state: paused; }
      `}</style>
      <div key={persona} className="hk-ticker-track flex gap-8 w-max px-4">
        {row.map((item, i) => (
          <span key={`${persona}-${i}`} className="flex items-center gap-2 text-xs whitespace-nowrap" style={{ color: t.text3 }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ACCENT.green }} />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function Hero() {
  const { t, persona, mode } = useApp();
  const p = PERSONAS[persona];
  const [spot, setSpot] = useState({ x: 50, y: 50 });
  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [copyReady, setCopyReady] = useState(true);
  const personaMounted = useRef(false);

  useEffect(() => {
    setHeroImgFailed(false);
    if (!personaMounted.current) {
      personaMounted.current = true;
      return;
    }
    setCopyReady(false);
    const id = window.setTimeout(() => setCopyReady(true), 40);
    return () => window.clearTimeout(id);
  }, [persona]);

  return (
    <section
      id="top"
      className="relative overflow-x-hidden transition-colors duration-300"
      style={{ backgroundColor: t.bg }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setSpot({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
      }}
    >
      <style>{`
        @keyframes hkFloat { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
        .hk-float { animation: hkFloat 4.5s ease-in-out infinite; }
      `}</style>
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          background: `radial-gradient(500px circle at ${spot.x}% ${spot.y}%, ${p.accent}14, transparent 70%)`,
        }}
      />
      <div className="absolute -top-32 -left-20 w-96 h-96 rounded-full opacity-[0.16] blur-3xl" style={{ backgroundColor: ACCENT.navy }} />
      <div className="absolute top-40 -right-20 w-72 h-72 rounded-full opacity-[0.13] blur-3xl" style={{ backgroundColor: ACCENT.orange }} />

      <div className="relative max-w-6xl mx-auto px-5 md:px-8 pt-8 pb-16 md:pt-14 md:pb-28">
        <div className="grid md:grid-cols-2 gap-8 md:gap-16 lg:gap-20 items-center">
          <div className="min-w-0 order-1 md:pr-4">
            <div
              key={persona}
              style={{
                opacity: copyReady ? 1 : 0.35,
                transition: "opacity .35s ease",
              }}
            >
              <p
                className="text-xs md:text-sm font-semibold uppercase tracking-[0.14em] mb-3 md:mb-4"
                style={{ color: p.accent }}
              >
                For {p.label.toLowerCase()}
              </p>
              <h1
                className="font-bold leading-[1.15] text-[1.85rem] sm:text-4xl md:text-[3.1rem] mb-4 md:mb-5 transition-colors duration-300"
                style={{ fontFamily: "Sora, sans-serif", color: t.text1 }}
              >
                {p.headline}
              </h1>
              <p className="text-sm sm:text-base md:text-lg leading-relaxed mb-2 md:mb-3 max-w-md" style={{ color: mode === "dark" ? "rgba(255,255,255,0.82)" : t.text2 }}>
                {p.sub1}
              </p>
              <p className="text-xs sm:text-sm md:text-base leading-relaxed mb-6 md:mb-8 max-w-md" style={{ color: mode === "dark" ? "rgba(255,255,255,0.68)" : t.text3 }}>
                {p.sub2}
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-7 md:mb-9">
                <Link
                  href={`/auth/register?type=${p.loginType}`}
                  className="group inline-flex items-center gap-2 font-semibold px-5 py-2.5 md:px-6 md:py-3 rounded-lg transition-transform hover:-translate-y-0.5 text-sm md:text-base"
                  style={{ backgroundColor: p.accent, color: "#0a1428" }}
                >
                  {p.cta}
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <button
                  onClick={() => scrollToId("how-it-works")}
                  className="inline-flex items-center gap-2 font-medium px-5 py-2.5 md:px-6 md:py-3 rounded-lg border transition-colors hover:bg-white/5 text-sm md:text-base"
                  style={{ borderColor: t.chipBorder, color: t.text1 }}
                >
                  {p.ctaSecondary}
                </button>
              </div>
            </div>
            <div className="mb-6 grid grid-cols-3 gap-3 sm:gap-8 md:mb-8">
              <StatCounter id="students" target={50} suffix="k+" label="students" />
              <StatCounter id="companies" target={30} suffix="+" label="companies" delay={150} />
              <StatCounter id="universities" target={20} suffix="+" label="universities" delay={300} />
            </div>
            <LiveTicker />
          </div>

          <div className="relative mx-auto w-full max-w-[280px] sm:max-w-sm md:max-w-md order-2 mt-2 md:mt-0">
            <div className="rounded-[24px] md:rounded-[28px] overflow-hidden relative" style={{ boxShadow: `0 25px 60px -15px ${p.accent}33` }}>
              {heroImgFailed ? (
                <div
                  className="w-full h-[300px] sm:h-[380px] md:h-[460px] flex items-center justify-center"
                  style={{ background: `linear-gradient(155deg, ${ACCENT.navy}, ${p.accent}55)` }}
                >
                  <UserCircle2 size={64} color="rgba(255,255,255,0.5)" />
                </div>
              ) : (
                <img
                  key={persona}
                  src={p.heroImage}
                  alt={p.heroAlt}
                  referrerPolicy="no-referrer"
                  loading="eager"
                  onError={() => setHeroImgFailed(true)}
                  className="w-full h-[300px] sm:h-[380px] md:h-[460px] object-cover transition-opacity duration-500"
                />
              )}
              <div className="absolute inset-0" style={{ background: t.heroImgShade }} />
            </div>
            {(BUBBLES_BY_PERSONA[persona] || BUBBLES_BY_PERSONA.student).map((b) => (
              <FloatingCard
                key={`${persona}-${b.title}`}
                className={`${b.className} ${b.className.includes("hidden") ? "" : "hidden sm:flex"}`.trim()}
                icon={b.icon}
                color={b.color}
                title={b.title}
                subtitle={b.subtitle}
                floatDelay={b.floatDelay}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  Features — click to expand                                         */
/* ================================================================== */
function Features() {
  const { t } = useApp();
  const items = [
    {
      icon: Briefcase,
      title: "Applications",
      desc: "Track and manage campus applications in one place—status, filters, and drive progress for students and placement teams.",
      detail: "Stay updated from apply to shortlist without chasing emails or spreadsheets.",
      color: ACCENT.orange,
    },
    {
      icon: Target,
      title: "Career Align",
      desc: "Match students to roles using skills, eligibility, and career preferences built for campus hiring.",
      detail: "Surface stronger fits faster so universities and recruiters spend less time on mismatched applications.",
      color: ACCENT.sky,
    },
    {
      icon: Video,
      title: "Video Search",
      desc: "Review short video introductions and profiles quickly before interviews.",
      detail: "Screen more candidates in less time with quick previews instead of scheduling every first call.",
      color: ACCENT.green,
    },
    {
      icon: Library,
      title: "Library",
      desc: "Shared templates for JDs, assessments, and hiring resources across drives and seasons.",
      detail: "Reuse what works—keep placement content consistent for colleges and corporates.",
      color: ACCENT.yellow,
    },
  ];
  const [expanded, setExpanded] = useState(null);
  const FEATURES_IMG = "https://disha-ui.s3.ap-south-1.amazonaws.com/Homepage_UI/DIscuss.jpeg";
  return (
    <section id="features" className="py-16 md:py-24 transition-colors duration-300 scroll-mt-16" style={{ backgroundColor: t.surface }}>
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <Reveal>
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-2" style={{ fontFamily: "Sora, sans-serif", color: t.text1 }}>
            Powerful features to help you succeed
          </h2>
          <p
            className="text-sm text-center mb-10 md:mb-14"
            style={{ color: t.mode === "dark" ? "rgba(255,255,255,0.72)" : t.text3 }}
          >
            Core Disha tools that connect students, universities, and recruiters in one campus hiring flow
          </p>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
          <Reveal className="order-1 md:order-2 md:sticky md:top-24">
            <div
              className="relative overflow-hidden rounded-[28px] border"
              style={{ borderColor: t.border, boxShadow: t.cardShadow, backgroundColor: t.card }}
            >
              <img
                src={FEATURES_IMG}
                alt="Campus hiring conversation on Disha"
                className="w-full h-[260px] sm:h-[320px] md:h-[420px] object-cover object-center"
                loading="lazy"
              />
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    t.mode === "dark"
                      ? "linear-gradient(to top, rgba(16,29,56,0.55) 0%, transparent 45%)"
                      : "linear-gradient(to top, rgba(246,248,252,0.35) 0%, transparent 40%)",
                }}
              />
            </div>
          </Reveal>

          <div className="order-2 md:order-1 grid sm:grid-cols-2 gap-4 items-start">
            {items.map((it, i) => {
              const isOpen = expanded === i;
              return (
                <Reveal key={it.title} delay={i * 80}>
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : i)}
                    className="text-left w-full min-h-[210px] p-5 rounded-2xl border transition-colors hover:border-opacity-80 flex flex-col"
                    style={{ backgroundColor: t.card, borderColor: isOpen ? it.color : t.border, boxShadow: t.cardShadow }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${it.color}1f` }}>
                        <it.icon size={20} color={it.color} />
                      </div>
                      <Plus
                        size={16}
                        style={{ color: t.text4, transform: isOpen ? "rotate(45deg)" : "rotate(0deg)", transition: "transform .25s ease" }}
                      />
                    </div>
                    <p className="font-semibold text-sm mb-2" style={{ color: t.text1 }}>{it.title}</p>
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: t.mode === "dark" ? "rgba(255,255,255,0.72)" : t.text3 }}
                    >
                      {it.desc}
                    </p>
                    <div
                      style={{
                        maxHeight: isOpen ? "96px" : "0px",
                        overflow: "hidden",
                        transition: "max-height .3s ease",
                      }}
                    >
                      <p
                        className="text-xs leading-relaxed pt-3 mt-3 border-t"
                        style={{
                          color: it.color,
                          borderColor: t.mode === "dark" ? "rgba(255,255,255,0.28)" : "rgba(10,20,40,0.18)",
                        }}
                      >
                        {it.detail}
                      </p>
                    </div>
                  </button>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}


/* ================================================================== */
/*  How it works — interactive stepper                                 */
/* ================================================================== */
function HowItWorks() {
  const { t } = useApp();
  const steps = [
    {
      icon: Briefcase,
      title: "Corporates post campus roles on Disha",
      desc: "Create jobs with eligibility, skills, and timelines—shared with partner universities in one flow.",
      color: ACCENT.orange,
      image: "https://disha-ui.s3.ap-south-1.amazonaws.com/Homepage_UI/Work_Logo/work_1.png",
    },
    {
      icon: Presentation,
      title: "Universities run drives from one dashboard",
      desc: "Coordinate campus drives, approve eligible students, and track participation without spreadsheets.",
      color: ACCENT.sky,
      image: "https://disha-ui.s3.ap-south-1.amazonaws.com/Homepage_UI/Work_Logo/work_2.png",
    },
    {
      icon: School,
      title: "Students discover, match, and apply",
      desc: "Browse open roles, check eligibility, use Career Align insights, and apply in minutes.",
      color: ACCENT.yellow,
      image: "https://disha-ui.s3.ap-south-1.amazonaws.com/Homepage_UI/Work_Logo/work_3.png",
    },
    {
      icon: Megaphone,
      title: "Recruiters shortlist and hire on Disha",
      desc: "Review applications and video profiles, shortlist faster, and close offers with clear status tracking.",
      color: ACCENT.green,
      image: "https://disha-ui.s3.ap-south-1.amazonaws.com/Homepage_UI/Work_Logo/work_4.png",
    },
  ];
  const [active, setActive] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const mobileTrackRef = useRef(null);
  const n = steps.length;
  const mobileLoop = [...steps, ...steps, ...steps];
  const syncingRef = useRef(false);
  const mobileReadyRef = useRef(false);
  const resumeTimerRef = useRef(null);

  const pauseAutoForUser = () => {
    setAutoPlay(false);
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => setAutoPlay(true), 5000);
  };

  useEffect(() => {
    if (!autoPlay) return undefined;
    const id = setInterval(() => setActive((a) => (a + 1) % n), 4200);
    return () => clearInterval(id);
  }, [n, autoPlay]);

  useEffect(() => () => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
  }, []);

  // Start in the middle copy so we can swipe both ways
  useEffect(() => {
    const el = mobileTrackRef.current;
    if (!el || typeof window === "undefined") return;
    if (window.matchMedia("(min-width: 768px)").matches) return;
    const place = () => {
      const w = el.clientWidth;
      if (w <= 0) return;
      syncingRef.current = true;
      el.scrollLeft = (n + active) * w;
      syncingRef.current = false;
      mobileReadyRef.current = true;
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);

  // Keep mobile scroll in sync when active changes (auto-cycle / left stepper)
  useEffect(() => {
    const el = mobileTrackRef.current;
    if (!el || !mobileReadyRef.current || typeof window === "undefined") return;
    if (window.matchMedia("(min-width: 768px)").matches) return;
    const w = el.clientWidth;
    if (w <= 0) return;

    const currentIdx = Math.round(el.scrollLeft / w);
    const currentReal = ((currentIdx % n) + n) % n;
    if (currentReal === active) return;

    // Always animate within the middle band when possible
    let target = (n + active) * w;
    // last → first: move forward into third copy, then snap to middle first
    if (active === 0 && currentReal === n - 1) {
      target = (2 * n) * w;
    }
    // first → last: move backward into first copy, then snap to middle last
    if (active === n - 1 && currentReal === 0) {
      target = (n - 1) * w;
    }

    syncingRef.current = true;
    el.scrollTo({ left: target, behavior: "smooth" });
    const t = window.setTimeout(() => {
      if (active === 0 && target >= 2 * n * w - 2) {
        el.scrollLeft = n * w;
      } else if (active === n - 1 && target <= (n - 1) * w + 2) {
        el.scrollLeft = (2 * n - 1) * w;
      } else {
        // Normalize into middle copy
        const idx = Math.round(el.scrollLeft / w);
        const real = ((idx % n) + n) % n;
        el.scrollLeft = (n + real) * w;
      }
      syncingRef.current = false;
    }, 480);
    return () => clearTimeout(t);
  }, [active, n]);

  const onMobileScroll = () => {
    if (syncingRef.current) return;
    pauseAutoForUser();
    const el = mobileTrackRef.current;
    if (!el) return;
    const w = el.clientWidth;
    if (w <= 0) return;

    // Keep scroll in the middle copy for infinite both directions
    if (el.scrollLeft <= w * 0.5) {
      syncingRef.current = true;
      el.scrollLeft += n * w;
      syncingRef.current = false;
    } else if (el.scrollLeft >= w * (2 * n - 0.5)) {
      syncingRef.current = true;
      el.scrollLeft -= n * w;
      syncingRef.current = false;
    }

    const idx = Math.round(el.scrollLeft / w);
    const next = ((idx % n) + n) % n;
    if (next !== active) setActive(next);
  };

  const s = steps[active];

  return (
    <section id="how-it-works" className="py-16 md:py-24 transition-colors duration-300 scroll-mt-16" style={{ backgroundColor: t.bg }}>
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <Reveal>
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-2" style={{ fontFamily: "Sora, sans-serif", color: t.text1 }}>
            How it works
          </h2>
          <p
            className="text-sm text-center mb-14"
            style={{ color: t.mode === "dark" ? "rgba(255,255,255,0.72)" : t.text3 }}
          >
            Four steps on Disha—from posting a campus role to making an offer
          </p>
        </Reveal>

        <div className="grid md:grid-cols-[1fr_1.1fr] gap-10 items-start">
          <div>
            {steps.map((step, i) => {
              const isActive = active === i;
              return (
                <button
                  key={step.title}
                  type="button"
                  onClick={() => {
                    pauseAutoForUser();
                    setActive(i);
                  }}
                  className="w-full flex items-start gap-4 text-left py-3.5 group"
                >
                  <div className="flex flex-col items-center shrink-0">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center border-2 font-semibold text-xs transition-colors"
                      style={{
                        borderColor: isActive ? step.color : t.chipBorder,
                        backgroundColor: isActive ? step.color : "transparent",
                        color: isActive ? "#04121f" : t.text3,
                      }}
                    >
                      {i + 1}
                    </div>
                    {i < steps.length - 1 && (
                      <div className="w-px h-8 mt-1" style={{ backgroundColor: isActive ? step.color : t.border, opacity: isActive ? 0.5 : 1 }} />
                    )}
                  </div>
                  <div className="min-w-0 pt-1.5">
                    <p className="font-semibold text-sm transition-colors" style={{ color: isActive ? t.text1 : t.text3 }}>
                      {step.title}
                    </p>
                    <p
                      className="text-xs leading-relaxed mt-1 max-w-sm transition-opacity"
                      style={{
                        color: t.mode === "dark" ? "rgba(255,255,255,0.72)" : t.text3,
                        opacity: isActive ? 1 : 0,
                        maxHeight: isActive ? "72px" : "0px",
                        overflow: "hidden",
                      }}
                    >
                      {step.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Mobile: one full-width card; infinite swipe both directions */}
          <div
            ref={mobileTrackRef}
            className="md:hidden flex overflow-x-auto snap-x snap-mandatory overscroll-x-contain"
            style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
            onScroll={onMobileScroll}
            onTouchStart={pauseAutoForUser}
            onPointerDown={pauseAutoForUser}
          >
            {mobileLoop.map((step, i) => {
              const realIdx = i % n;
              return (
              <div
                key={`${step.title}-${i}`}
                className="snap-center shrink-0 w-full rounded-3xl p-8 flex flex-col items-center text-center border min-h-[320px]"
                style={{ backgroundColor: t.card, borderColor: t.border, boxShadow: t.cardShadow }}
              >
                <div
                  className="relative mb-5 flex h-36 w-36 items-center justify-center rounded-2xl border"
                  style={{ backgroundColor: `${step.color}1a`, borderColor: `${step.color}44` }}
                >
                  <img
                    src={step.image}
                    alt={step.title}
                    loading="lazy"
                    className="h-28 w-28 object-contain"
                  />
                </div>
                <p className="font-semibold text-lg mb-2" style={{ color: t.text1, fontFamily: "Sora, sans-serif" }}>
                  {step.title}
                </p>
                <p
                  className="text-sm leading-relaxed max-w-xs"
                  style={{ color: t.mode === "dark" ? "rgba(255,255,255,0.72)" : t.text3 }}
                >
                  {step.desc}
                </p>
                <div className="flex gap-1.5 mt-6">
                  {steps.map((dot, di) => (
                    <button
                      key={dot.title}
                      type="button"
                      aria-label={`Go to step ${di + 1}`}
                      onClick={() => {
                        pauseAutoForUser();
                        setActive(di);
                        const el = mobileTrackRef.current;
                        if (el) {
                          syncingRef.current = true;
                          el.scrollTo({ left: (n + di) * el.clientWidth, behavior: "smooth" });
                          window.setTimeout(() => { syncingRef.current = false; }, 450);
                        }
                      }}
                      className="h-1.5 rounded-full transition-all"
                      style={{
                        width: di === realIdx ? "20px" : "6px",
                        backgroundColor: di === realIdx ? step.color : t.border,
                      }}
                    />
                  ))}
                </div>
              </div>
              );
            })}
          </div>

          {/* Desktop: sticky active preview */}
          <div className="relative hidden md:block md:sticky md:top-24">
            <div
              className="rounded-3xl p-8 md:p-10 flex flex-col items-center text-center border min-h-[320px]"
              style={{ backgroundColor: t.card, borderColor: t.border, boxShadow: t.cardShadow }}
            >
              <div
                className="relative mb-5 flex h-36 w-36 items-center justify-center rounded-2xl border transition-colors duration-300"
                style={{ backgroundColor: `${s.color}1a`, borderColor: `${s.color}44` }}
              >
                <img
                  key={s.image}
                  src={s.image}
                  alt={s.title}
                  loading="lazy"
                  className="h-28 w-28 object-contain"
                />
              </div>
              <p className="font-semibold text-lg mb-2 transition-colors duration-300" style={{ color: t.text1, fontFamily: "Sora, sans-serif" }}>
                {s.title}
              </p>
              <p
                className="text-sm leading-relaxed max-w-xs transition-colors duration-300"
                style={{ color: t.mode === "dark" ? "rgba(255,255,255,0.72)" : t.text3 }}
              >
                {s.desc}
              </p>
              <div className="flex gap-1.5 mt-6">
                {steps.map((step, i) => (
                  <button
                    key={step.title}
                    type="button"
                    aria-label={`Go to step ${i + 1}`}
                    onClick={() => {
                      pauseAutoForUser();
                      setActive(i);
                    }}
                    className="h-1.5 rounded-full transition-all"
                    style={{ width: i === active ? "20px" : "6px", backgroundColor: i === active ? s.color : t.border }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  Challenge vs Shortlisted                                           */
/* ================================================================== */
function ChallengeVsShortlisted() {
  const { t } = useApp();
  const rows = [
    {
      challenge: "Fragmented tools",
      cdesc: "Spreadsheets, WhatsApp, and separate portals for jobs, drives, and applications.",
      solution: "One Disha platform",
      sdesc: "Students, universities, and corporates run campus hiring from one Disha dashboard.",
    },
    {
      challenge: "Slow shortlisting",
      cdesc: "Manual screening and eligibility checks drag out campus hiring cycles.",
      solution: "Career Align + eligibility",
      sdesc: "Match students to roles with Career Align, skills, and eligibility—then shortlist faster on Disha.",
    },
    {
      challenge: "Zero visibility",
      cdesc: "Placement teams and recruiters can’t see drive progress or application status in real time.",
      solution: "Live application tracking",
      sdesc: "Track jobs, drives, and application status across university and corporate dashboards.",
    },
    {
      challenge: "Chaotic drive coordination",
      cdesc: "Approving students, posting roles, and managing interviews across colleges gets messy.",
      solution: "Campus drives on Disha",
      sdesc: "Universities approve students and run drives; corporates post roles, review video profiles, and hire in one flow.",
    },
  ];
  return (
    <section id="placements" className="py-16 md:py-24 transition-colors duration-300 scroll-mt-16" style={{ backgroundColor: t.surface }}>
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <Reveal>
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-2" style={{ fontFamily: "Sora, sans-serif", color: t.text1 }}>
            The campus recruitment challenge
          </h2>
          <div className="flex items-center justify-center gap-3 md:gap-5 mb-12 flex-wrap">
            <span
              className="text-sm md:text-base font-semibold tracking-wide"
              style={{ color: "#e0797c" }}
            >
              The old way
            </span>
            <div
              className="relative flex h-12 w-12 md:h-14 md:w-14 shrink-0 items-center justify-center rounded-full"
              style={{
                background: `linear-gradient(145deg, ${ACCENT.sky}, ${ACCENT.navy})`,
                boxShadow: `0 8px 24px -6px ${ACCENT.sky}88`,
              }}
              aria-label="versus"
            >
              <Zap
                size={14}
                className="absolute -top-0.5 right-1 md:right-1.5"
                style={{ color: ACCENT.yellow, fill: ACCENT.yellow }}
              />
              <span
                className="font-bold text-sm md:text-base tracking-tight"
                style={{ color: "#ffffff", fontFamily: "Sora, sans-serif" }}
              >
                VS
              </span>
            </div>
            <span
              className="text-sm md:text-base font-semibold tracking-wide"
              style={{ color: "#4fae7d" }}
            >
              hiring on Disha
            </span>
          </div>
        </Reveal>
        <div className="space-y-4">
          {rows.map((r, i) => (
            <Reveal key={r.challenge} delay={i * 90}>
              <div className="grid md:grid-cols-[1fr_auto_1fr] gap-3 items-stretch group">
                <div
                  className="p-4 rounded-xl border transition-transform duration-300 group-hover:-translate-y-0.5"
                  style={{ backgroundColor: `${ACCENT.red}0f`, borderColor: `${ACCENT.red}44` }}
                >
                  <p className="text-sm font-semibold mb-1" style={{ color: "#e0797c" }}>{r.challenge}</p>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: t.mode === "dark" ? "rgba(255,255,255,0.72)" : t.text3 }}
                  >
                    {r.cdesc}
                  </p>
                </div>
                <div className="hidden md:flex items-center justify-center">
                  <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" style={{ color: t.text4 }} />
                </div>
                <div
                  className="p-4 rounded-xl border transition-transform duration-300 group-hover:-translate-y-0.5"
                  style={{ backgroundColor: `${ACCENT.green}0f`, borderColor: `${ACCENT.green}44` }}
                >
                  <p className="text-sm font-semibold mb-1" style={{ color: "#4fae7d" }}>{r.solution}</p>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: t.mode === "dark" ? "rgba(255,255,255,0.72)" : t.text3 }}
                  >
                    {r.sdesc}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  Placed students — draggable / scroll-snap carousel                 */
/* ================================================================== */
function Avatar({ name, src }) {
  const [failed, setFailed] = useState(false);
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("");
  if (failed || !src) {
    return (
      <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 font-semibold text-sm" style={{ backgroundColor: `${ACCENT.sky}22`, color: ACCENT.sky }}>
        {initials}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={name}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setFailed(true)}
      className="w-11 h-11 rounded-full object-cover shrink-0"
    />
  );
}

function PlacedStudents() {
  const { t } = useApp();
  const students = (placedData.students || []).map((s) => ({
    name: s.name,
    company: s.company,
    img: s.imageUrl,
  }));
  const loop = [...students, ...students];
  const trackRef = useRef(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    const el = trackRef.current;
    if (!el || students.length === 0) return;
    let raf;
    let alive = true;
    const tick = () => {
      if (!alive) return;
      if (!pausedRef.current) {
        el.scrollLeft += 0.6;
        const half = el.scrollWidth / 2;
        if (half > 0 && el.scrollLeft >= half) {
          el.scrollLeft -= half;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
    };
  }, [students.length]);

  return (
    <section className="py-16 md:py-24 transition-colors duration-300" style={{ backgroundColor: t.bg }}>
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <Reveal className="mb-12 max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ fontFamily: "Sora, sans-serif", color: t.text1 }}>
            Placed students
          </h2>
          <p
            className="text-sm leading-relaxed"
            style={{ color: t.mode === "dark" ? "rgba(255,255,255,0.72)" : t.text3 }}
          >
            {placedData.subtitle || "Our students have successfully secured placements in reputed companies."}
          </p>
        </Reveal>
        <div
          ref={trackRef}
          className="flex gap-4 overflow-x-auto pb-3"
          style={{ scrollbarWidth: "none" }}
          onMouseEnter={() => { pausedRef.current = true; }}
          onMouseLeave={() => { pausedRef.current = false; }}
          onTouchStart={() => { pausedRef.current = true; }}
          onTouchEnd={() => { pausedRef.current = false; }}
        >
          {loop.map((s, i) => (
            <div
              key={`${s.name}-${i}`}
              className="flex items-center gap-3 p-4 rounded-xl border shrink-0 w-[240px] transition-all hover:-translate-y-0.5"
              style={{ backgroundColor: t.card, borderColor: t.border, boxShadow: t.cardShadow }}
            >
              <Avatar name={s.name} src={s.img} />
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: t.text1 }}>{s.name}</p>
                <p
                  className="text-xs truncate"
                  style={{ color: t.mode === "dark" ? "rgba(255,255,255,0.65)" : t.text4 }}
                >
                  {s.company}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  Blogs                                                               */
/* ================================================================== */
function BlogsSection() {
  const { t } = useApp();
  const posts = getFeaturedBlogs(6);
  return (
    <section id="blogs" className="py-16 md:py-24 transition-colors duration-300 scroll-mt-16" style={{ backgroundColor: t.bg }}>
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <Reveal className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] mb-2" style={{ color: ACCENT.sky }}>
              Career insights
            </p>
            <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ fontFamily: "Sora, sans-serif", color: t.text1 }}>
              Blogs & guides
            </h2>
            <p className="text-sm max-w-xl" style={{ color: t.text3 }}>
              Practical career, placement, and hiring insights for students, universities, and recruiters.
            </p>
          </div>
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 text-sm font-semibold transition-transform hover:-translate-y-0.5"
            style={{ color: ACCENT.sky }}
          >
            View all blogs
            <ArrowRight size={16} />
          </Link>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {posts.map((post, i) => (
            <Reveal key={post.slug} delay={i * 70}>
              <Link
                href={`/blogs/${post.slug}`}
                className="group flex h-full flex-col rounded-2xl border p-5 transition-all hover:-translate-y-1"
                style={{ backgroundColor: t.card, borderColor: t.border, boxShadow: t.cardShadow }}
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span
                    className="rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide"
                    style={{ backgroundColor: `${ACCENT.sky}1f`, color: ACCENT.sky }}
                  >
                    {post.category}
                  </span>
                  <span className="text-[11px]" style={{ color: t.text4 }}>
                    {post.readTime}
                  </span>
                </div>
                <h3
                  className="mb-3 text-base font-semibold leading-snug transition-colors group-hover:opacity-90"
                  style={{ color: t.text1, fontFamily: "Sora, sans-serif" }}
                >
                  {post.title}
                </h3>
                <p className="mb-5 flex-1 text-xs leading-relaxed" style={{ color: t.text3 }}>
                  {post.metaDescription}
                </p>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: ACCENT.sky }}>
                  Read article
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  FAQ                                                                 */
/* ================================================================== */
function FAQ() {
  const { t } = useApp();
  const faqs = [
    { q: "How do I create a profile on Disha?", a: "Sign up as a student, complete your profile with skills and eligibility details, and start applying to open roles." },
    { q: "Can I apply to companies from other universities?", a: "Yes. Explore open roles across partnered universities if you meet eligibility criteria." },
    { q: "How does Disha help manage placements?", a: "Disha gives universities a single dashboard to coordinate drives, approve students, and track outcomes." },
    { q: "Can universities customize the platform?", a: "Universities can configure eligibility rules, drive timelines, and communication preferences." },
    { q: "How many universities can reach students?", a: "Students can access opportunities across all partnered universities on the platform." },
  ];
  const [openIdx, setOpenIdx] = useState(1);
  return (
    <section id="faq" className="py-16 md:py-24 transition-colors duration-300 scroll-mt-16" style={{ backgroundColor: t.surface }}>
      <div className="max-w-3xl mx-auto px-5 md:px-8">
        <Reveal>
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-2" style={{ fontFamily: "Sora, sans-serif", color: t.text1 }}>
            Frequently asked questions
          </h2>
          <p
            className="text-sm text-center mb-12"
            style={{ color: t.mode === "dark" ? "rgba(255,255,255,0.72)" : t.text3 }}
          >
            Got questions? We've got answers. Find everything you need to know about Disha.
          </p>
        </Reveal>
        <div className="space-y-2">
          {faqs.map((f, i) => (
            <Reveal key={f.q} delay={i * 60}>
              <div className="border-b" style={{ borderColor: t.border }}>
                <button className="w-full flex items-center justify-between py-4 text-left" onClick={() => setOpenIdx(openIdx === i ? -1 : i)}>
                  <span className="text-sm font-semibold" style={{ color: t.text1 }}>{f.q}</span>
                  <ChevronDown
                    size={18}
                    color={openIdx === i ? ACCENT.orange : t.text4}
                    style={{ transition: "transform .25s ease", transform: openIdx === i ? "rotate(180deg)" : "rotate(0deg)" }}
                  />
                </button>
                <div style={{ maxHeight: openIdx === i ? "120px" : "0px", overflow: "hidden", transition: "max-height .3s ease" }}>
                  <p
                    className="text-sm leading-relaxed pb-4"
                    style={{ color: t.mode === "dark" ? "rgba(255,255,255,0.72)" : t.text3 }}
                  >
                    {f.a}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  Partner logo marquee — real recruiter & college logos               */
/* ================================================================== */
const COMPANY_LOGO_BASE = "https://hirekarma.s3.us-east-1.amazonaws.com/hirekarma_ui/company_logo/";
const COLLEGE_LOGO_BASE = "https://hirekarma.s3.us-east-1.amazonaws.com/hirekarma_ui/college_logo/";

const COMPANY_LOGOS = [
  "acuity_1_-removebg-preview.png", "Actowiz_Solutions_1_-removebg-preview.png", "adhoc_software_1_-removebg-preview.png",
  "ambetronic_1_-removebg-preview.png", "aristrocart_1_-removebg-preview.png", "CLOUD_CERTITUDE_1_-removebg-preview.png",
  "cmexpertise_infotech_1_-removebg-preview.png", "cordoidhub_1_-removebg-preview.png", "datacular_1_-removebg-preview.png",
  "deep_industries_1_-removebg-preview.png", "Elision_Technologies_1_-removebg-preview.png", "i_bird_1_-removebg-preview.png",
  "ig_drones_1_-removebg-preview.png", "Incture_Technologies_Logo_1_-removebg-preview.png", "Intelibim_Solutions_1_-removebg-preview.png",
  "invincix_1_-removebg-preview.png", "join_software_1_-removebg-preview.png", "ketson_1_-removebg-preview.png",
  "kokban_1_-removebg-preview.png", "milieudigital_1_-removebg-preview.png", "Qualitykiosk_1_-removebg-preview.png",
  "satiji_1_-removebg-preview.png", "seed_engineering_1_-removebg-preview.png", "spd_1_-removebg-preview.png",
  "sqare_infosoft_1_-removebg-preview.png", "tech_mahindra_1_-removebg-preview.png", "technoshine_1_-removebg-preview.png",
  "Thundersoft_1_-removebg-preview.png", "twinleaves_1_-removebg-preview.png", "vega_1_-removebg-preview.png",
  "webplus_1_-removebg-preview.png", "Webpristine_1_-removebg-preview.png", "young_decade_1_-removebg-preview.png",
  "young_mind_1_-removebg-preview.png", "arcitech_1_-removebg-preview.png",
].map((f) => COMPANY_LOGO_BASE + f);

const COLLEGE_LOGOS = [
  "Aryan_1_-removebg-preview.png", "BEC_1_-removebg-preview.png", "CIME_1_-removebg-preview.png",
  "EATM_logo_1_-removebg-preview.png", "GCEKJ_1_-removebg-preview.png", "GEC_1_-removebg-preview.png",
  "GIET_baniatangi_1_-removebg-preview.png", "KIT_1_-removebg-preview.png", "NISt_1_-removebg-preview.png",
  "GIET_gunpur_1_-removebg-preview.png", "GIFT_1_-removebg-preview.png", "GITAM_1_-removebg-preview.png",
  "NMIET_1_-removebg-preview.png", "PMEC_1_-removebg-preview.png", "Presidency_1_-removebg-preview.png",
  "QUAT_1_-removebg-preview.png", "SRUSTI_1_-removebg-preview.png",
].map((f) => COLLEGE_LOGO_BASE + f);

function fileToLabel(src) {
  const file = src.split("/").pop() || "";
  const base = file.replace(/_1_-removebg-preview\.png$/i, "").replace(/[_\-]+/g, " ");
  return base.replace(/\b\w/g, (c) => c.toUpperCase());
}

function LogoImg({ src }) {
  const { t } = useApp();
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span
        className="text-[11px] font-medium px-3 py-1.5 rounded-md border whitespace-nowrap opacity-60 hover:opacity-100 transition-opacity"
        style={{ borderColor: t.chipBorder, color: t.text3 }}
      >
        {fileToLabel(src)}
      </span>
    );
  }
  return (
    <img
      src={src}
      alt=""
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-8 md:h-9 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity duration-200"
    />
  );
}

function MarqueeRow({ logos, direction = "left", speed = 34 }) {
  const row = [...logos, ...logos];
  const animName = direction === "left" ? "hkMarqueeL" : "hkMarqueeR";
  return (
    <div className="hk-marquee overflow-hidden">
      <style>{`
        @keyframes hkMarqueeL { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes hkMarqueeR { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        .hk-marquee-track { animation: ${animName} ${speed}s linear infinite; }
        .hk-marquee:hover .hk-marquee-track { animation-play-state: paused; }
      `}</style>
      <div className="hk-marquee-track flex items-center gap-10 w-max">
        {row.map((src, i) => (
          <div key={i} className="shrink-0 flex items-center justify-center h-10">
            <LogoImg src={src} />
          </div>
        ))}
      </div>
    </div>
  );
}

function LogoMarquee() {
  const { t } = useApp();
  const logos = [...COMPANY_LOGOS, ...COLLEGE_LOGOS];
  return (
    <section className="py-14 transition-colors duration-300 border-t" style={{ backgroundColor: t.surface, borderColor: t.border }}>
      <div className="max-w-6xl mx-auto px-5 md:px-8 mb-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-center" style={{ color: t.text4 }}>
          Trusted by corporates and universities on Disha
        </p>
      </div>
      <div
        style={{
          maskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
        }}
      >
        <MarqueeRow logos={logos} direction="left" speed={42} />
      </div>
    </section>
  );
}

/* ================================================================== */
/*  Final CTA — desktop-wide design                                    */
/* ================================================================== */
function FinalCTA() {
  const { t } = useApp();
  const [role, setRole] = useState("student");
  const copy = {
    student: {
      headline: "Ready to find your next campus role on Disha?",
      sub: "Explore open jobs, check eligibility, use Career Align, and track every application in one place.",
      cta: "Get started",
      textOn: "#042c53",
      cardTitle: "Frontend Intern — Incture",
      cardSub: "Bengaluru · Posted 2 days ago",
      badge: "87% match",
      chips: ["React", "Tailwind", "Remote"],
      footer: "3 of 5 steps complete",
      cardCta: "Apply now",
    },
    corporate: {
      headline: "Ready to hire campus talent on Disha?",
      sub: "Post campus roles, review video profiles, shortlist faster, and close offers with clear status tracking.",
      cta: "Post campus roles",
      textOn: "#0d2e1e",
      cardTitle: "Frontend Intern · 42 applicants",
      cardSub: "Posted for 8 universities",
      badge: "12 shortlisted",
      chips: ["React", "0-1 yr", "Full-time"],
      footer: "Assessment closes in 3 days",
      cardCta: "Review candidates",
    },
    university: {
      headline: "Ready to run campus drives on Disha?",
      sub: "Coordinate drives, approve eligible students, and track placement progress from one shared dashboard.",
      cta: "Manage campus drives",
      textOn: "#361404",
      cardTitle: "Autumn Drive 2026",
      cardSub: "18 companies · 240 registered students",
      badge: "62% placed",
      chips: ["CSE", "ECE", "MBA"],
      footer: "Ends October 12",
      cardCta: "View drive",
    },
  };
  const roles = [
    { key: "student", label: "For students" },
    { key: "corporate", label: "For corporates" },
    { key: "university", label: "For universities" },
  ];
  const active = copy[role] || copy.student;
  const accent = PERSONAS[role]?.accent || ACCENT.sky;
  const loginType = PERSONAS[role]?.loginType || "student";
  const muted = t.mode === "dark" ? "rgba(255,255,255,0.5)" : t.text3;
  const mutedSoft = t.mode === "dark" ? "rgba(255,255,255,0.4)" : t.text4;

  return (
    <section className="relative overflow-hidden transition-colors duration-300" style={{ backgroundColor: t.bg }}>
      <div
        className="pointer-events-none absolute -top-[20%] right-[5%] h-[140%] w-[38%] rounded-full opacity-[0.14] blur-[90px]"
        style={{ backgroundColor: accent }}
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 md:grid-cols-[0.85fr_1.15fr] md:gap-0 md:px-8 md:py-16 md:min-h-[420px]">
        <Reveal className="md:pr-6 md:pl-2">
          <p
            className="mb-5 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.06em]"
            style={{ color: accent }}
          >
            <span className="inline-block h-px w-[18px]" style={{ backgroundColor: accent }} />
            Get started
          </p>
          <div key={role}>
            <h2
              className="mb-4 max-w-[420px] text-[1.7rem] font-semibold leading-[1.2] sm:text-[2rem] md:text-[34px] md:min-h-[82px]"
              style={{ fontFamily: "Sora, sans-serif", color: t.text1 }}
            >
              {active.headline}
            </h2>
            <p className="mb-8 max-w-[400px] text-[15px] leading-[1.65] md:min-h-[52px]" style={{ color: muted }}>
              {active.sub}
            </p>
          </div>

          <div className="mb-8 grid grid-cols-3 gap-1.5 sm:flex sm:flex-wrap sm:gap-2">
            {roles.map((r) => {
              const isActive = role === r.key;
              const rAccent = PERSONAS[r.key].accent;
              return (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setRole(r.key)}
                  className="rounded-lg border px-2 py-2.5 text-center text-[11px] font-medium transition-colors sm:px-[18px] sm:text-[13px]"
                  style={{
                    borderColor: isActive ? rAccent : t.chipBorder,
                    backgroundColor: isActive ? `${rAccent}20` : "transparent",
                    color: isActive ? t.text1 : muted,
                  }}
                >
                  {r.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap sm:gap-[18px]">
            <Link
              href={`/auth/register?type=${loginType}`}
              className="group inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-[26px] py-[13px] text-sm font-semibold transition-transform hover:-translate-y-0.5"
              style={{ backgroundColor: accent, color: active.textOn }}
            >
              {active.cta}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <span className="whitespace-nowrap text-[13px]" style={{ color: mutedSoft }}>
              Already have an account?{" "}
              <Link href={`/auth/login?type=${loginType}`} className="font-medium" style={{ color: accent }}>
                Sign in
              </Link>
            </span>
          </div>
        </Reveal>

        <Reveal delay={100} className="flex justify-center md:justify-center md:px-5 md:pr-8">
          <div
            key={role}
            className="w-full max-w-[460px] overflow-hidden rounded-2xl border"
            style={{
              backgroundColor: t.mode === "dark" ? "#0d1730" : t.card,
              borderColor: t.border,
              boxShadow: "0 30px 80px -25px rgba(0,0,0,0.6)",
            }}
          >
            <div
              className="flex items-center gap-1.5 border-b px-[18px] py-[13px]"
              style={{ borderColor: t.border }}
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.15)" }} />
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.15)" }} />
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.15)" }} />
              <span className="ml-2.5 text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                disha.hirekarma.in/dashboard
              </span>
            </div>
            <div className="px-6 py-[26px]">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="mb-1 text-[15px] font-semibold truncate" style={{ color: t.text1 }}>
                    {active.cardTitle}
                  </p>
                  <p className="text-xs" style={{ color: mutedSoft }}>
                    {active.cardSub}
                  </p>
                </div>
                <span
                  className="shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold whitespace-nowrap"
                  style={{ backgroundColor: `${accent}26`, color: accent }}
                >
                  {active.badge}
                </span>
              </div>
              <div className="mb-5 flex flex-wrap gap-2">
                {active.chips.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-md border px-2.5 py-1 text-[11px]"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.05)",
                      borderColor: t.chipBorder,
                      color: muted,
                    }}
                  >
                    {chip}
                  </span>
                ))}
              </div>
              <div className="mb-4 h-px" style={{ backgroundColor: t.border }} />
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs" style={{ color: mutedSoft }}>
                  {active.footer}
                </span>
                <Link
                  href={`/auth/register?type=${loginType}`}
                  className="inline-flex items-center gap-1.5 rounded-[7px] px-4 py-2 text-xs font-semibold"
                  style={{ backgroundColor: accent, color: active.textOn }}
                >
                  {active.cardCta}
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  Footer                                                              */
/* ================================================================== */
function Footer() {
  const { t, mode } = useApp();
  const logoSrc = mode === "dark" ? "/images/HKlogowhite.png" : "/images/HKlogoblack.png";
  const socials = [
    { icon: Linkedin, href: "https://www.linkedin.com/company/hirekarma-pvt-ltd", label: "LinkedIn" },
    { icon: Facebook, href: "https://facebook.com/hirekarma", label: "Facebook" },
    { icon: Instagram, href: "https://instagram.com/hirekarma", label: "Instagram" },
    { icon: Globe, href: "https://www.hirekarma.in/", label: "Website" },
  ];
  return (
    <footer className="pt-14 pb-8 transition-colors duration-300" style={{ backgroundColor: t.surface, borderTop: `1px solid ${t.border}` }}>
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="grid md:grid-cols-[1.3fr_1fr_1fr_1fr] gap-10 pb-10">
          <div>
            <a href="https://www.hirekarma.in/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center" aria-label="HireKarma">
              <img src={logoSrc} alt="HireKarma" className="h-8 w-auto object-contain" />
            </a>
            <p className="text-sm mt-3 max-w-xs leading-relaxed" style={{ color: t.text4 }}>
              DISHA — campus placement and college engagement by HireKarma.
            </p>
            <div className="flex gap-2.5 mt-4">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-10 h-10 rounded-lg border flex items-center justify-center transition-colors hover:bg-white/5"
                  style={{ borderColor: t.chipBorder, color: t.text2 }}
                >
                  <s.icon size={18} />
                </a>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold mb-4" style={{ color: t.text1 }}>Quick links</p>
            <div className="flex flex-col gap-2.5 text-sm" style={{ color: t.text3 }}>
              <button type="button" className="text-left" onClick={() => scrollToId("top")}>Home</button>
              <button type="button" className="text-left" onClick={() => scrollToId("features")}>Features</button>
              <button type="button" className="text-left" onClick={() => scrollToId("how-it-works")}>How it works</button>
              <button type="button" className="text-left" onClick={() => scrollToId("placements")}>Placements</button>
              <Link href="/blogs">Blogs</Link>
              <button type="button" className="text-left" onClick={() => scrollToId("faq")}>FAQ</button>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold mb-4" style={{ color: t.text1 }}>Resources</p>
            <div className="flex flex-col gap-2.5 text-sm" style={{ color: t.text3 }}>
              <a href="https://hirekarma.in/about-us/our-story" target="_blank" rel="noopener noreferrer">Our story</a>
              <a href="https://hirekarma.in/about-us/mission-value" target="_blank" rel="noopener noreferrer">Mission and value</a>
              <a href="https://hirekarma.in/about-us/people" target="_blank" rel="noopener noreferrer">People</a>
              <a href="mailto:info@hirekarma.in">Get in touch</a>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold mb-4" style={{ color: t.text1 }}>Contact us</p>
            <div className="flex flex-col gap-3 text-sm">
              <p style={{ color: t.text2 }}>
                <span style={{ color: t.text4 }}>Email:</span>{" "}
                <a href="mailto:info@hirekarma.in" className="hover:opacity-90" style={{ color: t.text2 }}>
                  info@hirekarma.in
                </a>
              </p>
              <p style={{ color: t.text2 }}>
                <span style={{ color: t.text4 }}>Phone:</span>{" "}
                <a href="tel:+919124364762" className="hover:opacity-90" style={{ color: t.text2 }}>
                  +91 91243 64762
                </a>
              </p>
              <a
                href="https://www.google.com/maps/search/?api=1&query=2nd+Floor+SS+Niwas+Raghunathpur+Bhubaneswar+Odisha+751024"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-start gap-2 leading-relaxed transition-opacity hover:opacity-90"
                style={{ color: t.text2 }}
              >
                <MapPin size={16} className="mt-0.5 shrink-0" style={{ color: ACCENT.sky }} />
                <span>
                  2nd Floor, SS Niwas, Raghunathpur,<br />Bhubaneswar, Odisha 751024
                </span>
              </a>
            </div>
          </div>
        </div>
        <div className="pt-6 border-t text-center" style={{ borderColor: t.border }}>
          <p className="text-xs" style={{ color: t.text4 }}>© 2026 HireKarma. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

/* ================================================================== */
/*  Root                                                                */
/* ================================================================== */
export default function DishaHomepage() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [persona, setPersona] = useState("student");
  const [active, setActive] = useState("top");

  useEffect(() => {
    setMounted(true);
  }, []);

  const goToPersona = (key) => setPersona(key);

  // Auto-cycle hero persona every 3.5s
  useEffect(() => {
    const id = setInterval(() => {
      setPersona((prev) => {
        const i = PERSONA_ORDER.indexOf(prev);
        return PERSONA_ORDER[(i + 1) % PERSONA_ORDER.length];
      });
    }, 3500);
    return () => clearInterval(id);
  }, []);

  const mode = mounted
    ? ((resolvedTheme || theme || "dark") === "light" ? "light" : "dark")
    : "dark";
  const t = { ...THEMES[mode], mode };
  const toggle = () => setTheme(mode === "dark" ? "light" : "dark");

  useEffect(() => {
    const els = NAV_LINKS.map((l) => document.getElementById(l.id)).filter(Boolean);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <AppCtx.Provider
      value={{
        mode,
        t,
        toggle,
        persona,
        setPersona,
        goToPersona,
        active,
      }}
    >
      <div
        style={{ fontFamily: "var(--font-inter), Inter, sans-serif", backgroundColor: t.bg }}
        className="min-h-screen transition-colors duration-300 [&_h1]:font-[family-name:var(--font-sora)] [&_h2]:font-[family-name:var(--font-sora)]"
      >
        <ScrollProgress />
        <NavBar />
        <Hero />
        <Features />
        <HowItWorks />
        <ChallengeVsShortlisted />
        <PlacedStudents />
        <BlogsSection />
        <FAQ />
        <FinalCTA />
        <LogoMarquee />
        <Footer />
      </div>
    </AppCtx.Provider>
  );
}