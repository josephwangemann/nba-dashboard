import { useSyncExternalStore } from 'react'
import { today } from '../utils/date'
import { parseRoute } from './routes'

const subscribe = (listener: () => void) => {
  window.addEventListener('hashchange', listener)
  window.addEventListener('popstate', listener)
  return () => {
    window.removeEventListener('hashchange', listener)
    window.removeEventListener('popstate', listener)
  }
}

export const useAppRoute = () => {
  const key = useSyncExternalStore(subscribe, () => window.location.hash, () => '')
  return { ...parseRoute(key, today()), key }
}

export const navigate = (href: string) => {
  const destination = href === '#' ? '' : href
  if (window.location.hash === destination) return
  window.history.replaceState({ ...window.history.state, returnScroll: window.scrollY }, '')
  window.history.pushState({ nbaNavigation: true }, '', destination || window.location.pathname + window.location.search)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export const goBack = (fallback = '#') => {
  if (window.history.state?.nbaNavigation) window.history.back()
  else navigate(fallback)
}
