"use client"

import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { BLOGS, type BlogPost } from "@/data/blogs"

const ACCENT = { sky: "#00a2e5", navy: "#1b52a4" }

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
  },
}

function useDishaTheme() {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const mode = mounted ? ((resolvedTheme || theme || "dark") === "light" ? "light" : "dark") : "dark"
  return { ...THEMES[mode], mode }
}

export function BlogCard({ post, t }: { post: BlogPost; t: (typeof THEMES)["dark"] }) {
  return (
    <Link
      href={`/blogs/${post.slug}`}
      className="group flex h-full flex-col rounded-2xl border p-5 transition-all hover:-translate-y-1"
      style={{ backgroundColor: t.card, borderColor: t.border }}
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
      <h2 className="mb-3 text-base font-semibold leading-snug" style={{ color: t.text1, fontFamily: "var(--font-sora), Sora, sans-serif" }}>
        {post.title}
      </h2>
      <p className="mb-5 flex-1 text-xs leading-relaxed" style={{ color: t.text3 }}>
        {post.metaDescription}
      </p>
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: ACCENT.sky }}>
        Read article
        <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  )
}

export function BlogsListingPage() {
  const t = useDishaTheme()
  return (
    <main className="min-h-screen transition-colors duration-300" style={{ backgroundColor: t.bg, fontFamily: "var(--font-inter), Inter, sans-serif" }}>
      <header className="sticky top-0 z-40 border-b backdrop-blur" style={{ backgroundColor: t.mode === "dark" ? "rgba(10,20,40,0.9)" : "rgba(246,248,252,0.9)", borderColor: t.border }}>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8">
          <Link href="/" className="font-bold text-xl" style={{ fontFamily: "var(--font-sora), Sora, sans-serif", color: t.text1 }}>
            Hire<span style={{ color: ACCENT.sky }}>karma</span>
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium" style={{ color: t.text2 }}>
            <ArrowLeft size={16} />
            Back to home
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: ACCENT.sky }}>
          DISHA blogs
        </p>
        <h1 className="mb-3 text-3xl font-bold md:text-4xl" style={{ fontFamily: "var(--font-sora), Sora, sans-serif", color: t.text1 }}>
          Career insights & placement guides
        </h1>
        <p className="mb-10 max-w-2xl text-sm md:text-base" style={{ color: t.text3 }}>
          Expert guides on careers, skills, resumes, interviews, and campus hiring—built for students, universities, and recruiters on Disha.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-5">
          {BLOGS.map((post) => (
            <BlogCard key={post.slug} post={post} t={t} />
          ))}
        </div>
      </div>
    </main>
  )
}

export function BlogDetailPage({ post }: { post: BlogPost }) {
  const t = useDishaTheme()
  const related = BLOGS.filter((b) => b.slug !== post.slug && b.category === post.category).slice(0, 3)

  return (
    <main className="min-h-screen transition-colors duration-300" style={{ backgroundColor: t.bg, fontFamily: "var(--font-inter), Inter, sans-serif" }}>
      <header className="sticky top-0 z-40 border-b backdrop-blur" style={{ backgroundColor: t.mode === "dark" ? "rgba(10,20,40,0.9)" : "rgba(246,248,252,0.9)", borderColor: t.border }}>
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5 md:px-8">
          <Link href="/blogs" className="inline-flex items-center gap-2 text-sm font-medium" style={{ color: t.text2 }}>
            <ArrowLeft size={16} />
            All blogs
          </Link>
          <Link href="/" className="text-sm font-medium" style={{ color: ACCENT.sky }}>
            Home
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-5 py-10 md:px-8 md:py-14">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <span className="rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide" style={{ backgroundColor: `${ACCENT.sky}1f`, color: ACCENT.sky }}>
            {post.category}
          </span>
          <span className="text-xs" style={{ color: t.text4 }}>
            {post.readTime}
          </span>
        </div>
        <h1 className="mb-4 text-3xl font-bold leading-tight md:text-4xl" style={{ fontFamily: "var(--font-sora), Sora, sans-serif", color: t.text1 }}>
          {post.title}
        </h1>
        <p className="mb-10 text-base leading-relaxed" style={{ color: t.text2 }}>
          {post.metaDescription}
        </p>

        {post.sections?.length ? (
          <div className="space-y-8">
            {post.sections.map((section, idx) => (
              <section key={idx}>
                {section.heading && (
                  <h2 className="mb-3 text-xl font-semibold" style={{ fontFamily: "var(--font-sora), Sora, sans-serif", color: t.text1 }}>
                    {section.heading}
                  </h2>
                )}
                <div className="space-y-4">
                  {section.paragraphs.map((p, i) => (
                    <p key={i} className="text-[15px] leading-relaxed" style={{ color: t.text2 }}>
                      {p}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border p-6" style={{ borderColor: t.border, backgroundColor: t.card }}>
            <p className="text-sm leading-relaxed" style={{ color: t.text2 }}>
              This guide is part of the Disha career content series. The full article is being prepared for publication. Meanwhile, explore related posts or start preparing on Disha with real campus opportunities.
            </p>
            <Link
              href="/auth/register?type=student"
              className="mt-5 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold"
              style={{ backgroundColor: ACCENT.sky, color: "#042c53" }}
            >
              Get started on Disha
              <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {post.faqs?.length ? (
          <div className="mt-12 border-t pt-10" style={{ borderColor: t.border }}>
            <h2 className="mb-6 text-xl font-semibold" style={{ fontFamily: "var(--font-sora), Sora, sans-serif", color: t.text1 }}>
              Frequently asked questions
            </h2>
            <div className="space-y-4">
              {post.faqs.map((f) => (
                <div key={f.q} className="rounded-xl border p-4" style={{ borderColor: t.border, backgroundColor: t.card }}>
                  <p className="mb-2 text-sm font-semibold" style={{ color: t.text1 }}>
                    {f.q}
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: t.text3 }}>
                    {f.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {related.length > 0 && (
          <div className="mt-14 border-t pt-10" style={{ borderColor: t.border }}>
            <h2 className="mb-5 text-lg font-semibold" style={{ color: t.text1 }}>
              Related reads
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {related.map((r) => (
                <BlogCard key={r.slug} post={r} t={t} />
              ))}
            </div>
          </div>
        )}
      </article>
    </main>
  )
}
