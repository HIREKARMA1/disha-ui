'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Bell,
  BellRing,
  Brain,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  Clock,
  Code2,
  GraduationCap,
  ListChecks,
  RotateCcw,
  Sparkles,
  Timer,
  Trophy,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const NOTIFY_KEY = 'practice_module_notify_interest'

const upcomingFeatures = [
  {
    id: 'mcq',
    title: 'MCQ practice',
    hint: 'Topic-wise quizzes',
    detail:
      'Short timed quizzes across aptitude, core CS, and role-specific topics so you can drill weak areas daily.',
    icon: ListChecks,
    tone: 'from-violet-500 to-indigo-500',
    chip: 'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300',
  },
  {
    id: 'coding',
    title: 'Coding rounds',
    hint: 'IDE in the browser',
    detail:
      'Write, run, and submit code against hidden test cases — the same flow you will see in hiring assessments.',
    icon: Code2,
    tone: 'from-sky-500 to-cyan-500',
    chip: 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300',
  },
  {
    id: 'timed',
    title: 'Timed mocks',
    hint: 'Exam-like pressure',
    detail:
      'Full-length mocks with a live timer, section switching, and a score report when you submit.',
    icon: Timer,
    tone: 'from-amber-500 to-orange-500',
    chip: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
  },
  {
    id: 'report',
    title: 'Skill reports',
    hint: 'Know what to fix',
    detail:
      'After each attempt you will get accuracy, time spent, and topic-wise gaps so the next session is focused.',
    icon: Trophy,
    tone: 'from-emerald-500 to-teal-500',
    chip: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
  },
] as const

const sampleQuestions = [
  {
    prompt: 'What is the time complexity of binary search on a sorted array?',
    options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
    answer: 1,
    explain: 'Each step halves the search space, so it runs in O(log n).',
  },
  {
    prompt: 'Which HTTP status code means a resource was created successfully?',
    options: ['200 OK', '204 No Content', '201 Created', '304 Not Modified'],
    answer: 2,
    explain: '201 Created is returned when a new resource is successfully made.',
  },
  {
    prompt: 'Which SQL join returns only rows that match in both tables?',
    options: ['LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN', 'INNER JOIN'],
    answer: 3,
    explain: 'INNER JOIN keeps rows whose join key exists in both tables.',
  },
]

const liveShortcuts = [
  {
    href: '/dashboard/student/mock-tests',
    title: 'Mock Tests',
    copy: 'Full exams are live — start one now.',
    icon: GraduationCap,
  },
  {
    href: '/dashboard/student/jobs',
    title: 'Campus Drive',
    copy: 'Browse campus opportunities while you wait.',
    icon: Briefcase,
  },
]

export function PracticeComingSoon() {
  const [selectedFeature, setSelectedFeature] = useState<(typeof upcomingFeatures)[number]['id']>('mcq')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [notifyOn, setNotifyOn] = useState(false)

  useEffect(() => {
    try {
      setNotifyOn(localStorage.getItem(NOTIFY_KEY) === '1')
    } catch {
      /* ignore private-mode storage */
    }
  }, [])

  const feature = upcomingFeatures.find((item) => item.id === selectedFeature) ?? upcomingFeatures[0]
  const question = sampleQuestions[questionIndex]
  const FeatureIcon = feature.icon

  const toggleNotify = () => {
    const next = !notifyOn
    setNotifyOn(next)
    try {
      localStorage.setItem(NOTIFY_KEY, next ? '1' : '0')
    } catch {
      /* ignore */
    }
  }

  const chooseOption = (index: number) => {
    if (picked !== null) return
    setPicked(index)
    if (index === question.answer) setScore((value) => value + 1)
  }

  const goNext = () => {
    if (questionIndex >= sampleQuestions.length - 1) {
      setFinished(true)
      return
    }
    setQuestionIndex((value) => value + 1)
    setPicked(null)
  }

  const resetQuiz = () => {
    setQuestionIndex(0)
    setPicked(null)
    setScore(0)
    setFinished(false)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-1 py-4 sm:py-6">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-violet-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-8"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-violet-200/70 to-indigo-100/40 blur-2xl dark:from-violet-700/20 dark:to-indigo-900/10" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white shadow-sm shadow-violet-600/20 dark:bg-violet-500 sm:mb-4">
              <Clock className="h-3.5 w-3.5" />
              Coming soon
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl lg:text-4xl">
              Practice is getting a better home
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400 sm:text-base">
              We are rebuilding assessments, coding rounds, and skill reports. Try a sample question below,
              explore what is launching, and keep going with Mock Tests in the meantime.
            </p>
            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-3">
              <Button onClick={toggleNotify} variant={notifyOn ? 'success' : 'default'} className="h-11 w-full rounded-full sm:h-10 sm:w-auto">
                {notifyOn ? <BellRing className="mr-2 h-4 w-4" /> : <Bell className="mr-2 h-4 w-4" />}
                {notifyOn ? 'You will be notified' : 'Notify me when it launches'}
              </Button>
              <Button asChild variant="outline" className="h-11 w-full rounded-full sm:h-10 sm:w-auto">
                <Link href="/dashboard/student/mock-tests">
                  Take a mock test
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            className="mx-auto hidden h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-200 dark:shadow-none sm:flex sm:h-32 sm:w-32 lg:mx-0"
          >
            <Brain className="h-14 w-14 text-white sm:h-16 sm:w-16" />
          </motion.div>
        </div>
      </motion.section>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet-600" />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Tap a card to preview
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {upcomingFeatures.map((item) => {
            const Icon = item.icon
            const active = item.id === selectedFeature
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedFeature(item.id)}
                className={`rounded-2xl border p-4 text-left transition ${
                  active
                    ? 'border-violet-400 bg-white shadow-md ring-2 ring-violet-200 dark:border-violet-500 dark:bg-gray-900 dark:ring-violet-900'
                    : 'border-gray-200 bg-white/80 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-sm dark:border-gray-700 dark:bg-gray-900'
                }`}
              >
                <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${item.tone} text-white`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="font-semibold text-gray-900 dark:text-white">{item.title}</div>
                <div className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${item.chip}`}>
                  {item.hint}
                </div>
              </button>
            )
          })}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={feature.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-3 flex items-start gap-3 rounded-2xl border border-violet-100 bg-violet-50/70 p-4 dark:border-violet-900/40 dark:bg-violet-950/20"
          >
            <div className="mt-0.5 rounded-lg bg-white p-2 text-violet-600 shadow-sm dark:bg-gray-900">
              <FeatureIcon className="h-4 w-4" />
            </div>
            <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{feature.detail}</p>
          </motion.div>
        </AnimatePresence>
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-7">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Try a 3-question warm-up</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Local only — nothing is submitted. Get a feel for practice while the full module is built.
            </p>
          </div>
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {finished ? 'Done' : `${questionIndex + 1} / ${sampleQuestions.length}`}
          </div>
        </div>

        <div className="mb-5 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
            initial={false}
            animate={{
              width: finished
                ? '100%'
                : `${((questionIndex + (picked !== null ? 1 : 0)) / sampleQuestions.length) * 100}%`,
            }}
          />
        </div>

        {finished ? (
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
              <Trophy className="h-7 w-7" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {score} / {sampleQuestions.length}
            </p>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {score === sampleQuestions.length
                ? 'Perfect — you are ready for a full mock test.'
                : 'Nice start. Take a mock test to keep the streak going.'}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Button onClick={resetQuiz} variant="outline" className="rounded-full">
                <RotateCcw className="mr-2 h-4 w-4" />
                Try again
              </Button>
              <Button asChild className="rounded-full">
                <Link href="/dashboard/student/mock-tests">Go to Mock Tests</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-base font-semibold text-gray-900 dark:text-white sm:text-lg">{question.prompt}</p>
            <div className="mt-4 grid gap-2">
              {question.options.map((option, index) => {
                const isPicked = picked === index
                const isCorrect = index === question.answer
                const revealed = picked !== null
                let style = 'border-gray-200 hover:border-violet-300 hover:bg-violet-50 dark:border-gray-700 dark:hover:bg-gray-800'
                if (revealed && isCorrect) style = 'border-emerald-400 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-950/30'
                else if (revealed && isPicked && !isCorrect) style = 'border-rose-400 bg-rose-50 dark:border-rose-600 dark:bg-rose-950/30'
                else if (revealed) style = 'border-gray-200 opacity-70 dark:border-gray-700'

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => chooseOption(index)}
                    disabled={picked !== null}
                    className={`flex items-start justify-between gap-3 rounded-xl border px-3 py-3 text-left text-sm font-medium text-gray-800 transition dark:text-gray-100 sm:px-4 ${style}`}
                  >
                    <span className="min-w-0 flex-1 leading-snug">{option}</span>
                    {revealed && isCorrect ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : null}
                    {revealed && isPicked && !isCorrect ? <XCircle className="h-4 w-4 text-rose-600" /> : null}
                  </button>
                )
              })}
            </div>
            <AnimatePresence>
              {picked !== null ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 overflow-hidden text-sm text-gray-600 dark:text-gray-400"
                >
                  {question.explain}
                  <div className="mt-4">
                    <Button onClick={goNext} className="h-11 w-full rounded-full sm:h-10 sm:w-auto">
                      {questionIndex >= sampleQuestions.length - 1 ? 'See score' : 'Next question'}
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        )}
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        {liveShortcuts.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 dark:text-white">{item.title}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{item.copy}</div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-violet-600" />
            </Link>
          )
        })}
      </section>
    </div>
  )
}
