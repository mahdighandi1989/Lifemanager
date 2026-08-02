/**
 * `?focus=` — the consumer half of the app's row-address primitive.
 *
 * The backend twin is `app/services/focus_service.py`; the two must agree on
 * one spelling of a row's address (`kind:id`), which is why the alias table
 * below mirrors `FOCUS_ALIASES` there.
 *
 * A page opts in with two lines:
 *
 *   const focused = useFocusTarget()                  // inside the component
 *   <tr data-focus-id={`task:${t.id}`} …>             // on each row
 *
 * and nothing else. The hook waits for the rows to exist (data usually
 * arrives after the first paint), scrolls the match into view and flashes a
 * ring on it. A page that has NOT opted in ignores the param completely and
 * renders exactly as it does today — which is what makes it safe for every
 * producer to emit the link before every page consumes it.
 */
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

const ALIASES = {
  todo_item: 'todo',
  item: 'todo',
  todo_list: 'list',
  personal_writing: 'writing',
  note: 'writing',
  contact: 'person',
}

/** `('task', 12)` → `'task:12'`, or `''` when unaddressable. */
export function focusToken(kind, id) {
  const k = String(kind || '').trim().toLowerCase()
  if (!k || id === null || id === undefined || id === '') return ''
  return `${ALIASES[k] || k}:${id}`
}

/** `('/tasks', 'task', 12)` → `'/tasks?focus=task%3A12'`. Never destructive. */
export function focusHref(url, kind, id) {
  if (!url || !url.startsWith('/')) return url
  const token = focusToken(kind, id)
  if (!token || url.includes('focus=')) return url
  return `${url}${url.includes('?') ? '&' : '?'}focus=${encodeURIComponent(token)}`
}

/** Read the current `?focus=` value (normalised), or `''`. */
export function currentFocus(search) {
  const raw = new URLSearchParams(search || '').get('focus') || ''
  const [kind, ...rest] = raw.split(':')
  if (!kind || !rest.length) return ''
  return focusToken(kind, rest.join(':'))
}

/**
 * Scroll to and flash the element carrying `data-focus-id="<token>"`.
 *
 * Returns the token so a page can also style the row itself (e.g. keep it
 * expanded). Retries for a short while because the rows are fetched: on the
 * first render after navigation the list is still empty, and a one-shot
 * lookup would silently find nothing — the exact failure that makes a deep
 * link feel broken even though it is correct.
 */
export function useFocusTarget() {
  const { search } = useLocation()
  const token = currentFocus(search)
  const [found, setFound] = useState('')

  useEffect(() => {
    if (!token) { setFound(''); return }
    let cancelled = false
    let tries = 0
    const tick = () => {
      if (cancelled) return
      const el = document.querySelector(`[data-focus-id="${CSS.escape(token)}"]`)
      if (el) {
        setFound(token)
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        // Tailwind-only, per the repo's no-external-CSS rule.
        el.classList.add('ring-2', 'ring-amber-400', 'ring-offset-2', 'rounded-lg')
        setTimeout(() => {
          el.classList.remove('ring-2', 'ring-amber-400', 'ring-offset-2', 'rounded-lg')
        }, 2600)
        return
      }
      // ~6s of patience, then give up quietly: a stale link (the row was
      // deleted) must not leave a spinner or an error on an otherwise fine page.
      if (++tries < 40) setTimeout(tick, 150)
    }
    tick()
    return () => { cancelled = true }
  }, [token])

  return found || token
}

export default useFocusTarget
