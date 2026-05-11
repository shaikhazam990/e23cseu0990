/**
 * Priority Engine
 * Weight: placement (3) > result (2) > event (1), others = 0
 * Score = typeWeight * 1000 + recencyScore (0-999)
 * Unread notifications are always ranked above read ones at equal score.
 */

const TYPE_WEIGHT = {
  placement: 3,
  result: 2,
  event: 1,
}

const getTypeWeight = (type = '') => TYPE_WEIGHT[type.toLowerCase()] ?? 0

/**
 * Recency score: maps timestamp to 0–999 range within the given set.
 * Most recent = 999, oldest = 0.
 */
const getRecencyScore = (timestamp, minTs, maxTs) => {
  if (maxTs === minTs) return 999
  const ts = new Date(timestamp).getTime() || 0
  return Math.round(((ts - minTs) / (maxTs - minTs)) * 999)
}

/**
 * Score each notification and return sorted list.
 * Unread items (not in viewedSet) are always preferred over read at same score.
 */
export const rankNotifications = (notifications, viewedSet = new Set()) => {
  if (!notifications.length) return []

  const timestamps = notifications
    .map((n) => new Date(n.timestamp).getTime())
    .filter((t) => !isNaN(t))
  const minTs = Math.min(...timestamps)
  const maxTs = Math.max(...timestamps)

  return notifications
    .map((n) => {
      const typeWeight = getTypeWeight(n.type)
      const recency = getRecencyScore(n.timestamp, minTs, maxTs)
      const score = typeWeight * 1000 + recency
      const unread = !viewedSet.has(n.id) ? 1 : 0
      return { ...n, _score: score, _unread: unread }
    })
    .sort((a, b) => {
      // Unread first, then by score descending
      if (b._unread !== a._unread) return b._unread - a._unread
      return b._score - a._score
    })
}

export const TOP_N_OPTIONS = [10, 15, 20, 25, 50]
