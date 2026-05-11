import React from 'react'
import {
  Box, Typography, Chip, Divider,
} from '@mui/material'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import { formatDate } from './utils'

const TYPE_LABELS = {
  ACADEMIC: 'academic',
  EVENT: 'event',
  EMERGENCY: 'emergency',
  ADMINISTRATIVE: 'admin',
  MAINTENANCE: 'maintenance',
  GENERAL: 'general',
}

const PRIORITY_STYLES = {
  HIGH: { color: '#111111', bg: '#111111', label: 'high' },
  MEDIUM: { color: '#555555', bg: '#555555', label: 'medium' },
  LOW: { color: '#aaaaaa', bg: '#cccccc', label: 'low' },
}

const NotificationCard = ({ notification, isViewed, onClick, compact = false }) => {
  const unread = !isViewed
  const priority = notification.priority?.toUpperCase() || 'LOW'
  const pStyle = PRIORITY_STYLES[priority] || PRIORITY_STYLES.LOW
  const typeLabel = TYPE_LABELS[notification.type?.toUpperCase()] || notification.type?.toLowerCase() || 'general'

  return (
    <>
      <Box
        onClick={() => onClick?.(notification)}
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.5,
          px: compact ? 2 : 2.5,
          py: compact ? 1.25 : 1.75,
          cursor: 'pointer',
          backgroundColor: unread ? '#fafafa' : '#ffffff',
          transition: 'background-color 0.15s ease',
          position: 'relative',
          '&:hover': { backgroundColor: '#f5f5f5' },
          borderLeft: unread ? '3px solid #111111' : '3px solid transparent',
        }}
      >
        {/* Unread dot */}
        <Box sx={{ pt: 0.4, flexShrink: 0 }}>
          {unread ? (
            <FiberManualRecordIcon sx={{ fontSize: 8, color: '#111111' }} />
          ) : (
            <Box sx={{ width: 8, height: 8 }} />
          )}
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.4 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontSize: compact ? '0.8rem' : '0.85rem',
                fontWeight: unread ? 600 : 500,
                color: '#111111',
                lineHeight: 1.3,
                flex: 1,
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {notification.title || 'Untitled'}
            </Typography>

            <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
              <Chip
                label={typeLabel}
                size="small"
                sx={{
                  backgroundColor: '#eeeeee',
                  color: '#555555',
                  fontSize: '0.65rem',
                }}
              />
              <Chip
                label={pStyle.label}
                size="small"
                sx={{
                  backgroundColor: pStyle.bg,
                  color: '#ffffff',
                  fontSize: '0.65rem',
                }}
              />
            </Box>
          </Box>

          {!compact && (
            <Typography
              variant="body2"
              sx={{
                fontSize: '0.78rem',
                color: '#666666',
                lineHeight: 1.5,
                mb: 0.5,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {notification.message || '—'}
            </Typography>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography
              variant="caption"
              sx={{ fontSize: '0.68rem', color: '#aaaaaa' }}
            >
              {formatDate(notification.timestamp)}
            </Typography>
            {notification.sender && (
              <Typography variant="caption" sx={{ fontSize: '0.68rem', color: '#bbbbbb' }}>
                from {notification.sender}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
      <Divider />
    </>
  )
}

export default NotificationCard
