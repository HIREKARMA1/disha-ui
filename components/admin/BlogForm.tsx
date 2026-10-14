'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, Loader2, Plus, Trash2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

import { EventImageUpload } from '@/components/admin/EventImageUpload'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { blogErrorMessage, blogService } from '@/services/blogService'
import { emptyBlogForm, type BlogBlock, type BlogWritePayload } from '@/types/blog'

function BlockChoice<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const label = options.find((option) => option.value === value)?.label ?? ''

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div className="relative w-[180px] shrink-0" ref={rootRef}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
      >
        <span className="truncate">{label}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-gray-500 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? (
        <ul
          role="listbox"
          className="absolute left-0 top-full z-30 mt-1 w-full rounded-lg border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-800"
        >
          {options.map((option) => {
            const selected = option.value === value
            return (
              <li key={option.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={`w-full rounded-md px-3 py-2 text-left text-sm ${
                    selected
                      ? 'bg-gray-100 font-medium text-gray-900 dark:bg-gray-700 dark:text-white'
                      : 'text-gray-900 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => {
                    onChange(option.value)
                    setOpen(false)
                  }}
                >
                  {option.label}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}

function Field({
  label,
  hint,
  required = false,
  children,
}: {
  label: string
  hint?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
        {label}
        {required ? <span className="ml-0.5 text-red-500">*</span> : null}
      </label>
      {hint ? <p className="mt-1 text-xs text-gray-500">{hint}</p> : null}
      <div className="mt-2">{children}</div>
    </div>
  )
}

function hasArticle(blocks: BlogBlock[]) {
  return blocks.some((block) => {
    if (block.type === 'list') {
      return block.items.some((item) => item.split('\n').some((line) => line.trim()))
    }
    return Boolean(block.text.trim())
  })
}

function missingFields(form: BlogWritePayload, publishing: boolean) {
  const missing: string[] = []
  if (!form.title.trim()) missing.push('Title is required')
  if (!publishing) return missing
  if (!form.excerpt.trim()) missing.push('Short excerpt is required')
  if (!form.author_name.trim()) missing.push('Author name is required')
  if (!hasArticle(form.blocks)) missing.push('Add at least one paragraph, heading, or list')
  return missing
}

function payloadFromRecord(record: BlogWritePayload & { blocks?: BlogBlock[] }): BlogWritePayload {
  return {
    ...emptyBlogForm(),
    ...record,
    cover_image_url: record.cover_image_url || '',
    author_photo_url: record.author_photo_url || '',
    published_on: record.published_on || '',
    blocks: record.blocks?.length ? record.blocks.map((block) => ({
      type: block.type,
      text: block.text || '',
      level: block.level || 2,
      items: block.items || [],
    })) : [{ type: 'paragraph', text: '', items: [] }],
  }
}

export function BlogForm({ blogId }: { blogId?: string }) {
  const router = useRouter()
  const [form, setForm] = useState<BlogWritePayload>(emptyBlogForm)
  const [savedId, setSavedId] = useState(blogId)
  const [published, setPublished] = useState(false)
  const [loading, setLoading] = useState(Boolean(blogId))
  const [saving, setSaving] = useState<'save' | 'publish' | null>(null)
  const [uploading, setUploading] = useState<'cover' | 'author' | null>(null)

  useEffect(() => {
    if (!blogId) return
    let cancelled = false
    blogService.getAdmin(blogId).then((record) => {
      if (cancelled) return
      setForm(payloadFromRecord(record))
      setPublished(record.publication_status === 'published')
    }).catch((err) => {
      toast.error(blogErrorMessage(err, 'Could not open this blog'))
    }).finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [blogId])

  const update = <K extends keyof BlogWritePayload>(key: K, value: BlogWritePayload[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const updateBlock = (index: number, patch: Partial<BlogBlock>) => {
    setForm((current) => ({
      ...current,
      blocks: current.blocks.map((block, blockIndex) => (blockIndex === index ? { ...block, ...patch } : block)),
    }))
  }

  const upload = async (file: File, kind: 'cover' | 'author') => {
    setUploading(kind)
    try {
      const result = await blogService.uploadImage(file, kind)
      update(kind === 'cover' ? 'cover_image_url' : 'author_photo_url', result.file_url)
    } catch (err) {
      toast.error(blogErrorMessage(err, 'Could not upload the image'))
    } finally {
      setUploading(null)
    }
  }

  const save = async (andPublish: boolean) => {
    const missing = missingFields(form, andPublish || published)
    if (missing.length) {
      toast.error(missing.join('. '))
      return
    }
    setSaving(andPublish ? 'publish' : 'save')
    const body: BlogWritePayload = {
      ...form,
      title: form.title.trim(),
      published_on: form.published_on || null,
      cover_image_url: form.cover_image_url || null,
      author_photo_url: form.author_photo_url || null,
      blocks: form.blocks.map((block) => ({
        ...block,
        items: block.type === 'list'
          ? block.items.flatMap((item) => item.split('\n')).map((item) => item.trim()).filter(Boolean)
          : [],
      })),
    }
    const currentId = savedId
    try {
      const saved = currentId ? await blogService.update(currentId, body) : await blogService.create(body)
      setSavedId(saved.id)
      if (andPublish) await blogService.publish(saved.id)
      toast.success(andPublish ? 'Blog published' : 'Blog saved')
      router.push('/dashboard/admin/blogs')
    } catch (err) {
      toast.error(blogErrorMessage(err, 'Could not save this blog'))
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{blogId ? 'Edit blog' : 'Create blog'}</h1>
        <p className="mt-1 text-sm text-gray-500">
          Fill each section below. A red star means the field is required before you can publish. Save draft only needs a title.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Blog card</CardTitle>
          <CardDescription>This is the card on the HireKarma resources list. The title and date are also used on the article page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <EventImageUpload
            label="Cover image"
            hint="Shown across the top of the blog card."
            value={form.cover_image_url || ''}
            onChange={(url) => update('cover_image_url', url)}
            onUpload={(file) => upload(file, 'cover')}
            uploading={uploading === 'cover'}
            aspect="banner"
            maxSizeMb={15}
          />
          <Field label="Title" required>
            <Input value={form.title} onChange={(event) => update('title', event.target.value)} placeholder="Future-proof careers for students" />
          </Field>
          <Field label="Short excerpt" required hint="The short paragraph under the title on the card.">
            <Textarea value={form.excerpt} onChange={(event) => update('excerpt', event.target.value)} rows={3} />
          </Field>
          <Field label="Date" hint="Shown on the card and under the article title.">
            <Input type="date" value={form.published_on || ''} onChange={(event) => update('published_on', event.target.value)} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Article heading</CardTitle>
          <CardDescription>The photo, name, and category in the row under the article title.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <EventImageUpload
            label="Author photo"
            hint="The round photo next to the author name."
            value={form.author_photo_url || ''}
            onChange={(url) => update('author_photo_url', url)}
            onUpload={(file) => upload(file, 'author')}
            uploading={uploading === 'author'}
            aspect="logo"
            maxSizeMb={15}
          />
          <Field label="Author name" required>
            <Input value={form.author_name} onChange={(event) => update('author_name', event.target.value)} placeholder="Sohan Kumar Dey" />
          </Field>
          <Field label="Category" hint="Example: Career Guide · Blogs">
            <Input value={form.category_label} onChange={(event) => update('category_label', event.target.value)} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Article<span className="ml-0.5 text-red-500">*</span></CardTitle>
          <CardDescription>Required to publish. Add at least one heading, paragraph, or list. They appear in this order on the article page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {form.blocks.map((block, index) => (
            <div key={index} className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
              <div className="mb-2 flex items-center justify-between gap-2">
                <BlockChoice
                  value={block.type}
                  options={[
                    { value: 'paragraph', label: 'Paragraph' },
                    { value: 'heading', label: 'Heading' },
                    { value: 'list', label: 'List' },
                  ]}
                  onChange={(value) => updateBlock(index, { type: value })}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-red-600"
                  onClick={() => update('blocks', form.blocks.filter((_, blockIndex) => blockIndex !== index))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              {block.type === 'heading' ? (
                <div className="space-y-2">
                  <BlockChoice
                    value={String(block.level || 2)}
                    options={[
                      { value: '2', label: 'Large heading' },
                      { value: '3', label: 'Small heading' },
                    ]}
                    onChange={(value) => updateBlock(index, { level: Number(value) as 2 | 3 })}
                  />
                  <Input value={block.text} onChange={(event) => updateBlock(index, { text: event.target.value })} placeholder="Heading" />
                </div>
              ) : null}
              {block.type === 'paragraph' ? (
                <Textarea value={block.text} onChange={(event) => updateBlock(index, { text: event.target.value })} rows={4} placeholder="Write the paragraph" />
              ) : null}
              {block.type === 'list' ? (
                <Textarea
                  value={block.items.join('\n')}
                  onChange={(event) => updateBlock(index, { items: event.target.value.split('\n') })}
                  rows={4}
                  placeholder="One point per line"
                />
              ) : null}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => update('blocks', [...form.blocks, { type: 'paragraph', text: '', items: [] }])}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add block
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Author</CardTitle>
          <CardDescription>The author box at the bottom of the article. The photo and name come from Article heading.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Role" hint="Example: Founder & CEO, HireKarma Private Limited">
            <Input value={form.author_role} onChange={(event) => update('author_role', event.target.value)} />
          </Field>
          <Field label="Short bio">
            <Textarea value={form.author_bio} onChange={(event) => update('author_bio', event.target.value)} rows={3} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Side box</CardTitle>
          <CardDescription>The box on the right of the article. LinkedIn and X stay on the page and share this blog.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Share heading">
            <Input value={form.share_title} onChange={(event) => update('share_title', event.target.value)} />
          </Field>
          <Field label="Share sentence">
            <Textarea value={form.share_description} onChange={(event) => update('share_description', event.target.value)} rows={2} />
          </Field>
          <Field label="Related products heading">
            <Input value={form.related_title} onChange={(event) => update('related_title', event.target.value)} />
          </Field>
          <Field label="Related products">
            <Input value={form.related_products} onChange={(event) => update('related_products', event.target.value)} />
          </Field>
          <Field label="Button label" hint="The button still opens the jobs page.">
            <Input value={form.cta_label} onChange={(event) => update('cta_label', event.target.value)} />
          </Field>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" disabled={saving !== null} onClick={() => void save(false)}>
          {saving === 'save' ? 'Saving…' : published ? 'Save' : 'Save draft'}
        </Button>
        {published ? null : (
          <Button type="button" disabled={saving !== null} onClick={() => void save(true)}>
            {saving === 'publish' ? 'Publishing…' : 'Publish'}
          </Button>
        )}
      </div>
    </div>
  )
}
