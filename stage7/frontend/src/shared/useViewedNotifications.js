import { useState, useCallback } from 'react'

const STORAGE_KEY = 'campus_notify_viewed'

const getViewed = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

const saveViewed = (set) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]))
  } catch {}
}

export const useViewedNotifications = () => {
  const [viewed, setViewed] = useState(getViewed)

  const markViewed = useCallback((id) => {
    setViewed((prev) => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      saveViewed(next)
      return next
    })
  }, [])

  const markAllViewed = useCallback((ids) => {
    setViewed((prev) => {
      const next = new Set(prev)
      ids.forEach((id) => next.add(id))
      saveViewed(next)
      return next
    })
  }, [])

  const isViewed = useCallback((id) => viewed.has(id), [viewed])

  return { viewed, markViewed, markAllViewed, isViewed }
}
