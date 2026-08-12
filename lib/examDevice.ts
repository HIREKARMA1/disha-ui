/**
 * Detect exam client device class for warnings + attempt metadata.
 * Uses viewport width and User-Agent (mobile/tablet/laptop).
 */

export type ExamDeviceType = 'mobile' | 'tablet' | 'laptop'

const TABLET_UA =
  /ipad|tablet|playbook|silk|(android(?!.*mobile))|kindle|nexus 7|nexus 9|sm-t/i
const MOBILE_UA =
  /iphone|ipod|android.*mobile|windows phone|blackberry|bb10|opera mini|iemobile|mobile/i

export function detectExamDevice(): ExamDeviceType {
  if (typeof window === 'undefined') return 'laptop'

  const ua = navigator.userAgent || ''
  const width = window.innerWidth || 0

  if (TABLET_UA.test(ua) || (width >= 768 && width < 1024 && MOBILE_UA.test(ua))) {
    return 'tablet'
  }
  if (MOBILE_UA.test(ua) || width < 768) {
    return 'mobile'
  }
  // Narrow tablet-sized landscape without phone UA → tablet
  if (width < 1024) {
    return 'tablet'
  }
  return 'laptop'
}

export function formatExamDeviceLabel(device?: string | null): string {
  switch ((device || '').toLowerCase()) {
    case 'mobile':
      return 'Mobile'
    case 'tablet':
      return 'Tablet'
    case 'laptop':
      return 'Laptop'
    default:
      return '—'
  }
}

export function isHandheldExamDevice(device?: ExamDeviceType | null): boolean {
  const d = device ?? detectExamDevice()
  return d === 'mobile' || d === 'tablet'
}
