/**
 * Error handling utilities for better user experience
 */

export interface ApiError {
  response?: {
    /** Raw body from axios (object, string, or unknown) */
    data?: unknown;
    status?: number;
  };
  message?: string;
}

/** Narrow unknown (e.g. from `catch`) to Axios-like shape without forcing casts at call sites. */
function toApiError(error: unknown): ApiError {
  if (!error || typeof error !== 'object') {
    return {}
  }
  const o = error as Record<string, unknown>
  const message = typeof o.message === 'string' ? o.message : undefined
  const resp = o.response
  if (resp && typeof resp === 'object' && !Array.isArray(resp)) {
    const r = resp as Record<string, unknown>
    const status = typeof r.status === 'number' ? r.status : undefined
    return {
      response: { data: r.data, status },
      message,
    }
  }
  return { message }
}

function parseResponseData(raw: unknown): Record<string, unknown> | null {
  if (raw == null) return null
  if (typeof raw === 'string') {
    const trimmed = raw.trim()
    if (!trimmed) return null
    try {
      const parsed = JSON.parse(trimmed) as unknown
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>
      }
    } catch {
      return { message: trimmed }
    }
    return { message: trimmed }
  }
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as Record<string, unknown>
  }
  return null
}

/** Normalize FastAPI-style `detail` / our backend's `error` field (string or validation array). */
function messageFromDetailLike(value: unknown): string | null {
  if (value == null) return null
  if (typeof value === 'string') {
    const t = value.trim()
    return t.length > 0 ? t : null
  }
  if (Array.isArray(value)) {
    const parts = value
      .map((err: unknown) => {
        if (typeof err === 'string') return err
        if (err && typeof err === 'object' && 'msg' in (err as object)) {
          const e = err as { msg?: string; loc?: unknown[] }
          const loc = Array.isArray(e.loc) ? e.loc.filter(Boolean).join('.') : 'Field'
          return e.msg ? `${loc}: ${e.msg}` : null
        }
        return null
      })
      .filter(Boolean) as string[]
    return parts.length > 0 ? parts.join('; ') : null
  }
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  return String(value)
}

/**
 * Extract user-friendly error message from API error
 */
export function getErrorMessage(error: unknown, fallbackMessage: string = 'An error occurred'): string {
  const e = toApiError(error)
  const data = parseResponseData(e.response?.data)

  // HireKarma backend wraps HTTPException as { error, status_code, tenant_id } (see disha-server app/main.py)
  const fromWrapped = data ? messageFromDetailLike(data.error) : null
  if (fromWrapped) return fromWrapped

  // Standard FastAPI / OpenAPI shape
  const fromDetail = data ? messageFromDetailLike(data.detail) : null
  if (fromDetail) return fromDetail

  if (data && typeof data.message === 'string' && data.message.trim()) {
    return data.message.trim()
  }

  // Check for validation errors array
  if (data?.errors && Array.isArray(data.errors)) {
    const parts = data.errors.filter((e): e is string => typeof e === 'string')
    if (parts.length > 0) return parts.join(', ')
  }
  
  // Check for HTTP status code specific messages
  if (e.response?.status) {
    switch (e.response.status) {
      case 400:
        return 'Invalid request. Please check your input and try again.'
      case 401:
        return 'Authentication required. Please log in again.'
      case 403:
        return 'Access denied. You do not have permission to perform this action.'
      case 404:
        return 'Resource not found.'
      case 409:
        return 'Conflict: This resource already exists.'
      case 422:
        return 'Validation error. Please check your input and try again.'
      case 429:
        return 'Too many requests. Please try again later.'
      case 500:
        return 'Server error. Please try again later.'
      default:
        return `Request failed with status ${e.response.status}.`
    }
  }
  
  // Axios uses "Request failed with status code N" when the server returned no parseable body we handled above
  const axiosGeneric = /^Request failed with status code \d+$/i.test(e.message || '')
  if (axiosGeneric) {
    return fallbackMessage
  }

  return e.message || fallbackMessage
}

/**
 * Get error type for styling purposes
 */
export function getErrorType(error: unknown): 'error' | 'warning' | 'info' {
  const e = toApiError(error)
  if (e.response?.status) {
    switch (e.response.status) {
      case 400:
      case 422:
        return 'warning';
      case 401:
      case 403:
        return 'error';
      case 409:
        return 'warning';
      case 429:
        return 'info';
      case 500:
        return 'error';
      default:
        return 'error';
    }
  }
  return 'error';
}

/**
 * Check if error is a specific type
 */
export function isErrorType(error: unknown, type: string): boolean {
  const needle = type.toLowerCase()
  return getErrorMessage(error, '').toLowerCase().includes(needle)
}
