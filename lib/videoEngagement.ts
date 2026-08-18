const EVENT = 'disha:video-engagement-changed'

function userKey(kind: 'liked' | 'saved'): string {
  if (typeof window === 'undefined') return `videos:${kind}:guest`
  try {
    const raw = localStorage.getItem('user_data')
    if (!raw) return `videos:${kind}:guest`
    const parsed = JSON.parse(raw) as { id?: string }
    if (parsed?.id && parsed.id !== 'temp-id') {
      return `videos:${kind}:${parsed.id}`
    }
  } catch {
    // ignore
  }
  return `videos:${kind}:guest`
}

function readIds(key: string): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : []
  } catch {
    return []
  }
}

function writeIds(key: string, ids: string[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(ids))
    window.dispatchEvent(new CustomEvent(EVENT))
  } catch {
    // ignore quota / private mode
  }
}

function toggleId(kind: 'liked' | 'saved', videoId: string): boolean {
  if (!videoId) return false
  const key = userKey(kind)
  const ids = readIds(key)
  const exists = ids.includes(videoId)
  writeIds(key, exists ? ids.filter((id) => id !== videoId) : [...ids, videoId])
  return !exists
}

export function isVideoLiked(videoId: string): boolean {
  return readIds(userKey('liked')).includes(videoId)
}

export function isVideoSaved(videoId: string): boolean {
  return readIds(userKey('saved')).includes(videoId)
}

/** Returns true when the video is liked after the toggle. */
export function toggleLikedVideo(videoId: string): boolean {
  return toggleId('liked', videoId)
}

/** Returns true when the video is saved after the toggle. */
export function toggleSavedVideo(videoId: string): boolean {
  return toggleId('saved', videoId)
}

export async function shareVideo(title: string, url: string): Promise<'shared' | 'copied'> {
  const shareData = { title, text: title, url }
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share(shareData)
      return 'shared'
    } catch (error) {
      if ((error as Error)?.name === 'AbortError') {
        throw error
      }
    }
  }
  await navigator.clipboard.writeText(url)
  return 'copied'
}
