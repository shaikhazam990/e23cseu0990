import { useState, useEffect, useCallback } from 'react'
import { fetchNotifications, normaliseNotification } from '../shared/api'

const PAGE_SIZE = 10

const useNotifications = () => {
  const [allNotifications, setAllNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [types, setTypes] = useState([])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchNotifications()
      // Real API: { Notifications: [...] } or plain array
      let raw = []
      if (Array.isArray(data)) raw = data
      else if (Array.isArray(data?.Notifications)) raw = data.Notifications
      else if (Array.isArray(data?.notifications)) raw = data.notifications
      else if (Array.isArray(data?.data)) raw = data.data
      else if (Array.isArray(data?.content)) raw = data.content

      const items = raw.map(normaliseNotification)
      setAllNotifications(items)

      const uniqueTypes = [...new Set(items.map((n) => n.type).filter(Boolean))]
      setTypes(uniqueTypes)
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load notifications.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [typeFilter])

  const filtered = typeFilter === 'ALL'
    ? allNotifications
    : allNotifications.filter((n) => n.type === typeFilter)

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return {
    notifications: paginated,
    allFiltered: filtered,
    allNotifications,
    loading,
    error,
    page,
    setPage,
    totalPages,
    typeFilter,
    setTypeFilter,
    types,
    reload: load,
  }
}

export default useNotifications
