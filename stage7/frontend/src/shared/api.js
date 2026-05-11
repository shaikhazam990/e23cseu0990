import axios from 'axios'

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// Real API shape: { ID, Type, Message, Timestamp }
// Normalise to a consistent internal shape used everywhere in the UI.
const toTitle = (msg = '') =>
  msg.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()).trim() || 'Notification'

const HIGH_TYPES = ['emergency', 'alert', 'critical']
const MEDIUM_TYPES = ['result', 'placement', 'academic']

const derivePriority = (type = '') => {
  const t = type.toLowerCase()
  if (HIGH_TYPES.includes(t)) return 'HIGH'
  if (MEDIUM_TYPES.includes(t)) return 'MEDIUM'
  return 'LOW'
}

export const normaliseNotification = (raw) => ({
  id: raw.ID ?? raw.id ?? '',
  type: raw.Type ?? raw.type ?? 'General',
  message: raw.Message ?? raw.message ?? '',
  timestamp: raw.Timestamp ?? raw.timestamp ?? raw.createdAt ?? '',
  title: toTitle(raw.Message ?? raw.message ?? ''),
  priority: raw.Priority ?? raw.priority ?? derivePriority(raw.Type ?? raw.type ?? ''),
})

export const fetchNotifications = async (params = {}) => {
  const response = await apiClient.get('/notifications', { params })
  return response.data
}

export default apiClient
