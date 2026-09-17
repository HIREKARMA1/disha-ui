type Listener = (editing: boolean) => void

let activeEditors = 0
const listeners = new Set<Listener>()

function emit() {
  const editing = activeEditors > 0
  listeners.forEach((listener) => listener(editing))
}

/**
 * Acquire/release while a profile section form is open on mobile.
 * Supports multiple forms (e.g. Basic + Academic merge) via ref-count.
 */
export function setProfileFormEditing(value: boolean) {
  if (value) {
    activeEditors += 1
  } else {
    activeEditors = Math.max(0, activeEditors - 1)
  }
  emit()
}

export function isProfileFormEditing() {
  return activeEditors > 0
}

export function subscribeProfileFormEditing(listener: Listener): () => void {
  listeners.add(listener)
  listener(activeEditors > 0)
  return () => {
    listeners.delete(listener)
  }
}
