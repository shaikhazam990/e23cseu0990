import axios from 'axios'

const ACCESS_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJzaGFpa2hhemFtMDk5MEBnbWFpbC5jb20iLCJleHAiOjE3Nzg0ODk5MzIsImlhdCI6MTc3ODQ4OTAzMiwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6Ijg5YmNlODVlLTFhMDgtNDM3NS1iOGM2LTAxZDg2YzdhMTRkMSIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6Im1vaGQgYXphbSIsInN1YiI6IjQ3NTJlYzc2LTAyZTQtNGM2Yi04ZjRlLWQxOWE5MmI0MDAzOSJ9LCJlbWFpbCI6InNoYWlraGF6YW0wOTkwQGdtYWlsLmNvbSIsIm5hbWUiOiJtb2hkIGF6YW0iLCJyb2xsTm8iOiJlMjNjc2V1MDk5MCIsImFjY2Vzc0NvZGUiOiJUZkR4Z3IiLCJjbGllbnRJRCI6IjQ3NTJlYzc2LTAyZTQtNGM2Yi04ZjRlLWQxOWE5MmI0MDAzOSIsImNsaWVudFNlY3JldCI6IkN3Q1RqeXJGQ1FSQ05zWnEifQ.YuarcgR0vG09zorkO2sa9vShifrME9TRRk_CVtWAxTg'

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${ACCESS_TOKEN}`,
  },
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
