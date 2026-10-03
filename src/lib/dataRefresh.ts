import { useSyncExternalStore } from 'react'

// A tiny "bell" that any part of the app can ring after changing data
// (for example after assigning a container). Every list that loads data
// listens to it and reloads itself, so screens never show stale information.

let version = 0
const listeners = new Set<() => void>()

export function notifyDataChanged() {
  version += 1
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useDataVersion() {
  return useSyncExternalStore(subscribe, () => version)
}