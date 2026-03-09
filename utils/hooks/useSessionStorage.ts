import { Dispatch, SetStateAction, useEffect, useState } from 'react'

function getSessionStorageOrDefault<T>(key: string, defaultValue: T): T {
  const stored = sessionStorage.getItem(key)
  if (!stored) {
    return defaultValue
  }
  return JSON.parse(stored)
}

export function useSessionStorage<T>(
  key: string,
  defaultValue: T
): [T, Dispatch<SetStateAction<T>>] {
  const [initialized, setInitialized] = useState<boolean>(false)
  const [value, setValue] = useState<T>(defaultValue)

  useEffect(() => {
    if (initialized) {
      if (value !== undefined)
        sessionStorage.setItem(key, JSON.stringify(value))
      else sessionStorage.removeItem(key)
    }
  }, [value])

  useEffect(() => {
    // setTimeout évite d'appeler setState synchronement dans l'effect (SSR-safe)
    const id = setTimeout(() => {
      setValue(getSessionStorageOrDefault(key, defaultValue))
      setInitialized(true)
    }, 0)
    return () => clearTimeout(id)
  }, [])

  return [value, setValue]
}
