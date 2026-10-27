'use client'

import { Plus, Trash2 } from 'lucide-react'
import { EventImageUpload } from '@/components/admin/EventImageUpload'
import { RichTextEditor } from '@/components/ui/RichTextEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export type JobFairArrayField = 'highlights' | 'partners' | 'testimonials' | 'gallery' | 'additional_sections'
export const JOB_FAIR_EDITOR_KEY: unique symbol = Symbol('job-fair-editor-key')
export type JobFairContentItem = Record<string, unknown> & { [JOB_FAIR_EDITOR_KEY]: string }
export type JobFairSectionState = Record<JobFairArrayField, JobFairContentItem[]>

function ItemCard({ title, onRemove, children }: { title: string; onRemove: () => void; children: React.ReactNode }) {
  return <article className="space-y-3 rounded-lg border p-4">
    <div className="flex items-center justify-between gap-3"><h4 className="font-medium">{title}</h4><Button type="button" variant="outline" size="sm" onClick={onRemove} className="text-red-700"><Trash2 className="mr-2 h-4 w-4"/>Remove</Button></div>
    <div className="grid gap-3 md:grid-cols-2">{children}</div>
  </article>
}

interface Props {
  items: JobFairSectionState
  uploading: boolean
  onAdd: (key: JobFairArrayField, defaults: Record<string, unknown>) => void
  onRemove: (key: JobFairArrayField, editorKey: string) => void
  onUpdate: (key: JobFairArrayField, editorKey: string, patch: Record<string, unknown>) => void
  onUpload: (key: JobFairArrayField, editorKey: string, field: string, file: File) => Promise<void>
}

const text = (item: JobFairContentItem, key: string) => typeof item[key] === 'string' ? item[key] as string : item[key] == null ? '' : String(item[key])
const validImagePreview = (value: string) => {
  try { const url = new URL(value); return url.protocol === 'https:' || url.protocol === 'http:' } catch { return false }
}

export function JobFairContentSections({ items, uploading, onAdd, onRemove, onUpdate, onUpload }: Props) {
  const section = (key: JobFairArrayField, heading: string, description: string, label: string, defaults: Record<string, unknown>, renderItem: (item: JobFairContentItem, index: number) => React.ReactNode, wide = false) => (
    <section className={`space-y-3 rounded-lg border p-4${wide ? ' xl:col-span-2' : ''}`} aria-label={heading}>
      <div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="font-semibold">{heading}</h3><p className="text-xs text-gray-500">{description}</p></div><Button type="button" variant="outline" size="sm" onClick={() => onAdd(key, defaults)}><Plus className="mr-2 h-4 w-4"/>{label}</Button></div>
      {items[key].length === 0 ? <p className="rounded-md bg-gray-50 p-4 text-sm text-gray-500">No {heading.toLowerCase()} added yet.</p> : <div className={`space-y-3${wide ? ' md:grid md:grid-cols-2 md:gap-3 md:space-y-0' : ''}`}>{items[key].map(renderItem)}</div>}
    </section>
  )

  return <section className="space-y-4 rounded-xl border bg-white p-5">
    <div><h2 className="text-lg font-semibold">Page sections</h2><p className="text-sm text-gray-500">Add and edit the content shown on the public Job Fair page. Empty sections stay hidden.</p></div>
    <div className="grid gap-4 xl:grid-cols-2">
      {section('highlights', 'Programs in Job Fair', 'Add multiple programs with a title, description, and their own uploaded image.', 'Add Program', { title: '', description: '', image: '' }, (item, index) => <ItemCard key={item[JOB_FAIR_EDITOR_KEY]} title={`Program ${index + 1}`} onRemove={() => onRemove('highlights', item[JOB_FAIR_EDITOR_KEY])}>
        <label className="space-y-1 text-sm">Program title<Input required value={text(item, 'title')} onChange={e => onUpdate('highlights', item[JOB_FAIR_EDITOR_KEY], { title: e.target.value })}/></label>
        <div className="space-y-1 text-sm md:col-span-2"><p>Description</p><RichTextEditor value={text(item, 'description')} onChange={value => onUpdate('highlights', item[JOB_FAIR_EDITOR_KEY], { description: value })} placeholder="Describe this program with formatting, lists, or links." minHeightClassName="min-h-[100px]"/></div>
        <div className="md:col-span-2"><EventImageUpload label="Program image" aspect="wide" value={text(item, 'image')} onChange={value => onUpdate('highlights', item[JOB_FAIR_EDITOR_KEY], { image: value })} onUpload={async file => { await onUpload('highlights', item[JOB_FAIR_EDITOR_KEY], 'image', file) }} uploading={uploading}/></div>
      </ItemCard>)}
      {section('partners', 'Partners', 'Partner details and optional logo or website.', 'Add Partner', { name: '', logo: '', website: '' }, (item, index) => <ItemCard key={item[JOB_FAIR_EDITOR_KEY]} title={`Partner ${index + 1}`} onRemove={() => onRemove('partners', item[JOB_FAIR_EDITOR_KEY])}>
        <label className="space-y-1 text-sm">Partner name<Input required value={text(item, 'name')} onChange={e => onUpdate('partners', item[JOB_FAIR_EDITOR_KEY], { name: e.target.value })}/></label>
        <label className="space-y-1 text-sm">Website URL<Input type="url" value={text(item, 'website')} onChange={e => onUpdate('partners', item[JOB_FAIR_EDITOR_KEY], { website: e.target.value })} placeholder="https://example.com"/></label>
        <div className="md:col-span-2"><EventImageUpload label="Partner logo" aspect="logo" value={text(item, 'logo')} onChange={value => onUpdate('partners', item[JOB_FAIR_EDITOR_KEY], { logo: value })} onUpload={async file => { await onUpload('partners', item[JOB_FAIR_EDITOR_KEY], 'logo', file) }} uploading={uploading}/></div>
      </ItemCard>)}
      {section('testimonials', 'Testimonials', 'Name and message are required.', 'Add Testimonial', { person: '', role: '', company_name: '', feedback: '', photo: '' }, (item, index) => <ItemCard key={item[JOB_FAIR_EDITOR_KEY]} title={`Testimonial ${index + 1}`} onRemove={() => onRemove('testimonials', item[JOB_FAIR_EDITOR_KEY])}>
        <label className="space-y-1 text-sm">Person&apos;s name<Input required value={text(item, 'person')} onChange={e => onUpdate('testimonials', item[JOB_FAIR_EDITOR_KEY], { person: e.target.value })}/></label>
        <label className="space-y-1 text-sm">Designation<Input value={text(item, 'role')} onChange={e => onUpdate('testimonials', item[JOB_FAIR_EDITOR_KEY], { role: e.target.value })}/></label>
        <label className="space-y-1 text-sm">Company or institution<Input value={text(item, 'company_name')} onChange={e => onUpdate('testimonials', item[JOB_FAIR_EDITOR_KEY], { company_name: e.target.value })}/></label>
        <label className="space-y-1 text-sm">Message<textarea required className="min-h-20 w-full rounded-md border p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500" value={text(item, 'feedback')} onChange={e => onUpdate('testimonials', item[JOB_FAIR_EDITOR_KEY], { feedback: e.target.value })}/></label>
        <div className="md:col-span-2"><EventImageUpload label="Profile photo (optional)" aspect="logo" value={text(item, 'photo')} onChange={value => onUpdate('testimonials', item[JOB_FAIR_EDITOR_KEY], { photo: value })} onUpload={async file => { await onUpload('testimonials', item[JOB_FAIR_EDITOR_KEY], 'photo', file) }} uploading={uploading}/></div>
      </ItemCard>)}
      {section('gallery', 'Gallery', 'Add an image URL or upload an image with a caption.', 'Add Image', { image: '', title: '' }, (item, index) => <ItemCard key={item[JOB_FAIR_EDITOR_KEY]} title={`Image ${index + 1}`} onRemove={() => onRemove('gallery', item[JOB_FAIR_EDITOR_KEY])}>
        <div className="md:col-span-2"><EventImageUpload label="Gallery image" aspect="wide" value={text(item, 'image')} onChange={value => onUpdate('gallery', item[JOB_FAIR_EDITOR_KEY], { image: value })} onUpload={async file => { await onUpload('gallery', item[JOB_FAIR_EDITOR_KEY], 'image', file) }} uploading={uploading}/>{validImagePreview(text(item, 'image')) && <img src={text(item, 'image')} alt={text(item, 'title')} className="mt-3 max-h-48 rounded-lg border object-contain"/>}</div>
        <label className="space-y-1 text-sm md:col-span-2">Caption / alternative text<Input value={text(item, 'title')} onChange={e => onUpdate('gallery', item[JOB_FAIR_EDITOR_KEY], { title: e.target.value })}/></label>
      </ItemCard>)}
      {section('additional_sections', 'Additional Sections', 'Optional content blocks shown after the standard sections.', 'Add Section', { title: '', description: '' }, (item, index) => <ItemCard key={item[JOB_FAIR_EDITOR_KEY]} title={`Section ${index + 1}`} onRemove={() => onRemove('additional_sections', item[JOB_FAIR_EDITOR_KEY])}>
        <label className="space-y-1 text-sm md:col-span-2">Section heading<Input required value={text(item, 'title')} onChange={e => onUpdate('additional_sections', item[JOB_FAIR_EDITOR_KEY], { title: e.target.value })}/></label>
        <div className="space-y-1 text-sm md:col-span-2"><p>Section content</p><RichTextEditor value={text(item, 'description')} onChange={value => onUpdate('additional_sections', item[JOB_FAIR_EDITOR_KEY], { description: value })} placeholder="Add formatted section content." minHeightClassName="min-h-[120px]"/></div>
      </ItemCard> , true)}
    </div>
  </section>
}
