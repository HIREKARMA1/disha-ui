type Listener = (open: boolean) => void

let isOpen = false
const listeners = new Set<Listener>()

function emit() {
  listeners.forEach((listener) => listener(isOpen))
}

/** Open the profile-completion dialog (no auto-dismiss). */
export function showProfileCompletionDialog() {
  isOpen = true
  emit()
}

export function hideProfileCompletionDialog() {
  isOpen = false
  emit()
}

export function subscribeProfileCompletionDialog(listener: Listener): () => void {
  listeners.add(listener)
  listener(isOpen)
  return () => {
    listeners.delete(listener)
  }
}
