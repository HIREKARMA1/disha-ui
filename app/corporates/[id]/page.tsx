'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Loader2, Building2, MapPin, Globe2 } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { DishaTopBar } from '@/components/ui/DishaTopBar'
import { Footer } from '@/components/ui/footer'

type Corporate = { id: string; company_name: string; company_logo?: string; description?: string; industry?: string; company_size?: string; founded_year?: number; company_type?: string; address?: string; website_url?: string; verified?: boolean }
function safeUrl(value?: string) { if (!value) return null; try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.toString() : null } catch { return null } }

export default function PublicCorporatePage() {
  const { id } = useParams<{ id: string }>()
  const [corporate, setCorporate] = useState<Corporate | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { let active = true; apiClient.client.get(`/corporates/public/${encodeURIComponent(id)}`).then(({ data }) => { if (active) setCorporate(data) }).catch(() => { if (active) setCorporate(null) }).finally(() => { if (active) setLoading(false) }); return () => { active = false } }, [id])
  const logo = safeUrl(corporate?.company_logo)
  const website = safeUrl(corporate?.website_url)
  return <div className="flex min-h-screen flex-col bg-gray-50"><DishaTopBar showSearch={false}/><main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12">{loading ? <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin"/></div> : !corporate ? <div className="rounded-2xl border bg-white p-10 text-center"><h1 className="text-2xl font-bold">Company profile unavailable</h1><p className="mt-2 text-gray-600">This company does not have a public profile.</p></div> : <article className="overflow-hidden rounded-3xl border bg-white shadow-sm"><div className="bg-gradient-to-r from-slate-950 to-indigo-800 px-6 py-12 text-white md:px-10"><div className="flex flex-wrap items-center gap-5">{logo ? <img src={logo} alt={`${corporate.company_name} logo`} className="h-20 w-20 rounded-2xl bg-white object-contain p-2"/> : <div className="grid h-20 w-20 place-items-center rounded-2xl bg-white/10"><Building2 className="h-9 w-9"/></div>}<div><h1 className="text-3xl font-bold md:text-4xl">{corporate.company_name}</h1>{corporate.industry && <p className="mt-2 text-indigo-100">{corporate.industry}</p>}</div></div></div><div className="space-y-7 p-6 md:p-10">{corporate.description && <section><h2 className="text-xl font-semibold">About</h2><p className="mt-3 whitespace-pre-wrap leading-7 text-gray-700">{corporate.description}</p></section>}<div className="flex flex-wrap gap-5 text-sm text-gray-600">{corporate.company_size && <span>{corporate.company_size} employees</span>}{corporate.founded_year && <span>Founded {corporate.founded_year}</span>}{corporate.company_type && <span>{corporate.company_type}</span>}{corporate.address && <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4"/>{corporate.address}</span>}{website && <a href={website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-indigo-700 underline"><Globe2 className="h-4 w-4"/>Company website</a>}</div></div></article>}</main><Footer/></div>
}
