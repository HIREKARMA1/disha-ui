import { config } from '@/lib/config'

function isInlineImageSrc(src: string): boolean {
  return src.startsWith('data:') || src.startsWith('blob:')
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('Failed to convert image blob'))
    reader.readAsDataURL(blob)
  })
}

async function viaServerProxy(imageUrl: string): Promise<string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
  const proxyUrl = `${config.api.fullUrl}/corporates/proxy-image?url=${encodeURIComponent(imageUrl)}`
  const response = await fetch(proxyUrl, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!response.ok) {
    throw new Error(`Proxy failed: ${response.status}`)
  }
  const data = await response.json()
  if (!data?.data_url || typeof data.data_url !== 'string') {
    throw new Error('Proxy returned no data URL')
  }
  return data.data_url
}

async function viaCorsFetch(imageUrl: string): Promise<string> {
  const response = await fetch(imageUrl, { mode: 'cors', credentials: 'omit' })
  if (!response.ok) {
    throw new Error(`Fetch failed: ${response.status}`)
  }
  return blobToDataUrl(await response.blob())
}

function viaCanvas(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth || img.width
        canvas.height = img.naturalHeight || img.height
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('Could not get canvas context')
        ctx.drawImage(img, 0, 0)
        resolve(canvas.toDataURL('image/jpeg', 0.92))
      } catch (error) {
        reject(error)
      }
    }
    img.onerror = () => reject(new Error('Image element failed to load'))
    img.src = imageUrl
  })
}

/** Convert a remote/S3 photo URL into a data URL so html2canvas can embed it in PDFs. */
export async function imageUrlToDataUrl(imageUrl: string): Promise<string> {
  if (!imageUrl) return ''
  if (isInlineImageSrc(imageUrl)) return imageUrl

  try {
    return await viaServerProxy(imageUrl)
  } catch {
    try {
      return await viaCorsFetch(imageUrl)
    } catch {
      return viaCanvas(imageUrl)
    }
  }
}

function waitForImage(img: HTMLImageElement): Promise<void> {
  if (img.complete && img.naturalWidth > 0) return Promise.resolve()
  return new Promise((resolve) => {
    img.addEventListener('load', () => resolve(), { once: true })
    img.addEventListener('error', () => resolve(), { once: true })
  })
}

/**
 * Replace remote <img> sources in a resume preview with data URLs so the
 * generated PDF includes auto-populated profile photos the same way as
 * manually uploaded ones.
 */
export async function inlineImagesForPdf(root: HTMLElement): Promise<void> {
  const imgs = Array.from(root.querySelectorAll('img'))
  await Promise.all(
    imgs.map(async (img) => {
      const src = img.currentSrc || img.getAttribute('src') || ''
      if (!src) return
      if (isInlineImageSrc(src)) {
        await waitForImage(img)
        return
      }
      try {
        const dataUrl = await imageUrlToDataUrl(src)
        if (dataUrl && isInlineImageSrc(dataUrl)) {
          img.removeAttribute('crossorigin')
          img.style.removeProperty('display')
          img.src = dataUrl
          await waitForImage(img)
        }
      } catch {
        // Keep the original src so the on-screen preview is unchanged.
      }
    })
  )
}
