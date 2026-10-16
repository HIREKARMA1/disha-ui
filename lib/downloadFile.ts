/**
 * Utility to download files directly (e.g. brochures, PDFs)
 * without opening them in a new tab or preview window.
 */
export async function downloadBrochureFile(url: string, suggestedFilename?: string): Promise<void> {
  if (!url) return

  const cleanFilename = (suggestedFilename || 'Brochure.pdf')
    .replace(/[^\w.-]+/g, '_')
    .replace(/^_+|_+$/g, '')

  const filename = cleanFilename.toLowerCase().endsWith('.pdf')
    ? cleanFilename
    : `${cleanFilename}.pdf`

  const triggerBlobSave = (blob: Blob) => {
    const objectUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = objectUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setTimeout(() => {
      window.URL.revokeObjectURL(objectUrl)
    }, 1500)
  }

  // Attempt 1: Direct fetch -> blob (works instantly if CORS is enabled on storage)
  try {
    const res = await fetch(url, { mode: 'cors' })
    if (res.ok) {
      const blob = await res.blob()
      triggerBlobSave(blob)
      return
    }
  } catch {
    // CORS or network error, proceed to backend proxy
  }

  // Attempt 2: Backend proxy fetch -> blob (guaranteed no browser CORS issue)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  const proxyUrl = `${apiUrl}/api/v1/jobs/brochure/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`

  try {
    const res = await fetch(proxyUrl)
    if (res.ok) {
      const blob = await res.blob()
      triggerBlobSave(blob)
      return
    }
  } catch {
    // Proxy fetch error, proceed to hidden iframe fallback
  }

  // Attempt 3: Hidden iframe navigation with Content-Disposition: attachment header
  const iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  iframe.src = proxyUrl
  document.body.appendChild(iframe)
  setTimeout(() => {
    if (document.body.contains(iframe)) {
      document.body.removeChild(iframe)
    }
  }, 60000)
}
