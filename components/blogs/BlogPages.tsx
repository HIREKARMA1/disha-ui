"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { BLOGS, type BlogPost } from "@/data/blogs"
import { DishaTopBar } from "@/components/ui/DishaTopBar"
import { Footer } from "@/components/ui/footer"
import { StudentDashboardLayout } from "@/components/dashboard/StudentDashboardLayout"
import { useAuth } from "@/hooks/useAuth"

function BlogsShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!isLoading) setReady(true)
  }, [isLoading])

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F7FB] dark:bg-[#0a0c14]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  if (user?.user_type === "student") {
    return (
      <StudentDashboardLayout>
        <div className="pb-16 lg:pb-8">{children}</div>
      </StudentDashboardLayout>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F7FB] dark:bg-[#0a0c14]">
      <DishaTopBar searchPlaceholder="Search blogs, jobs, events…" />
      <div className="flex-1 pb-16 pt-8">{children}</div>
      <Footer />
    </div>
  )
}

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blogs/${post.slug}`}
      className="group flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-primary-200 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-primary-800"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="rounded-md bg-primary-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary-700 dark:bg-primary-950/50 dark:text-primary-300">
          {post.category}
        </span>
        <span className="text-[11px] text-gray-400 dark:text-gray-500">{post.readTime}</span>
      </div>
      <h2 className="mb-3 text-base font-semibold leading-snug text-gray-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
        {post.title}
      </h2>
      <p className="mb-5 flex-1 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
        {post.metaDescription}
      </p>
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400">
        Read article
        <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  )
}

export function BlogsListingPage() {
  return (
    <BlogsShell>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary-600 dark:text-primary-400">
          Disha blogs
        </p>
        <h1 className="mb-3 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
          Career insights & placement guides
        </h1>
        <p className="mb-10 max-w-2xl text-sm text-gray-600 dark:text-gray-400 md:text-base">
          Expert guides on careers, skills, resumes, interviews, and campus hiring—built for students,
          universities, and recruiters on Disha.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-5">
          {BLOGS.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      </div>
    </BlogsShell>
  )
}

export function BlogDetailPage({ post }: { post: BlogPost }) {
  const related = BLOGS.filter((b) => b.slug !== post.slug && b.category === post.category).slice(0, 3)

  return (
    <BlogsShell>
      <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/blogs"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
        >
          <ArrowLeft size={16} />
          All blogs
        </Link>

        <div className="mb-5 flex flex-wrap items-center gap-3">
          <span className="rounded-md bg-primary-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary-700 dark:bg-primary-950/50 dark:text-primary-300">
            {post.category}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">{post.readTime}</span>
        </div>
        <h1 className="mb-4 text-3xl font-bold leading-tight text-gray-900 dark:text-white md:text-4xl">
          {post.title}
        </h1>
        <p className="mb-10 text-base leading-relaxed text-gray-600 dark:text-gray-300">
          {post.metaDescription}
        </p>

        {post.sections?.length ? (
          <div className="space-y-8">
            {post.sections.map((section, idx) => (
              <section key={idx}>
                {section.heading && (
                  <h2 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
                    {section.heading}
                  </h2>
                )}
                <div className="space-y-4">
                  {section.paragraphs.map((p, i) => (
                    <p key={i} className="text-[15px] leading-relaxed text-gray-600 dark:text-gray-300">
                      {p}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              This guide is part of the Disha career content series. The full article is being prepared
              for publication. Meanwhile, explore related posts or start preparing on Disha with real
              campus opportunities.
            </p>
            <Link
              href="/auth/register?type=student"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
            >
              Get started on Disha
              <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {post.faqs?.length ? (
          <div className="mt-12 border-t border-gray-200 pt-10 dark:border-gray-800">
            <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
              Frequently asked questions
            </h2>
            <div className="space-y-4">
              {post.faqs.map((f) => (
                <div
                  key={f.q}
                  className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
                >
                  <p className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">{f.q}</p>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {related.length > 0 && (
          <div className="mt-14 border-t border-gray-200 pt-10 dark:border-gray-800">
            <h2 className="mb-5 text-lg font-semibold text-gray-900 dark:text-white">Related reads</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {related.map((r) => (
                <BlogCard key={r.slug} post={r} />
              ))}
            </div>
          </div>
        )}
      </article>
    </BlogsShell>
  )
}
