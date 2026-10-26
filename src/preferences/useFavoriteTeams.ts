import { useMemo, useSyncExternalStore } from 'react'
import { parseFavoriteTeams } from './favorites'

const STORAGE_KEY = 'nothing-but-net-favorite-teams'
const CHANGE_EVENT = 'favorite-teams-changed'
let memoryValue = '[]'
let storageAvailable = true

const getSnapshot = () => {
  if (!storageAvailable) return memoryValue
  try {
    memoryValue = window.localStorage.getItem(STORAGE_KEY) ?? '[]'
  } catch {
    storageAvailable = false
  }
  return memoryValue
}

const subscribe = (listener: () => void) => {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) listener()
  }
  window.addEventListener('storage', onStorage)
  window.addEventListener(CHANGE_EVENT, listener)
  return () => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener(CHANGE_EVENT, listener)
  }
}

const toggleFavorite = (id: string) => {
  const favorites = parseFavoriteTeams(getSnapshot())
  memoryValue = JSON.stringify(favorites.includes(id) ? favorites.filter(team => team !== id) : [...favorites, id])
  try {
    if (storageAvailable) window.localStorage.setItem(STORAGE_KEY, memoryValue)
  } catch {
    storageAvailable = false
  }
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export const useFavoriteTeams = () => {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => '[]')
  const favoriteTeams = useMemo(() => parseFavoriteTeams(snapshot), [snapshot])
  return { favoriteTeams, toggleFavorite }
}
