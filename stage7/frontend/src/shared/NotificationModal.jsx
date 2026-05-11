import React from 'react'
import {
  Dialog, DialogContent, DialogTitle, IconButton,
  Typography, Box, Chip, Divider,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { formatFullDate } from './utils'

const TYPE_LABELS = {
  ACADEMIC: 'academic',
  EVENT: 'event',
  EMERGENCY: 'emergency',
  ADMINISTRATIVE: 'admin',
  MAINTENANCE: 'maintenance',
  GENERAL: 'general',
}

const PRIORITY_STYLES = {
  HIGH: { bg: '#111111', label: 'high' },
  MEDIUM: { bg: '#555555', label: 'medium' },
  LOW: { bg: '#cccccc', label: 'low' },
}

const NotificationModal = ({ notification, open, onClose }) => {
  if (!notification) return null

  const priority = notification.priority?.toUpperCase() || 'LOW'
  const pStyle = PRIORITY_STYLES[priority] || PRIORITY_STYLES.LOW
  const typeLabel = TYPE_LABELS[notification.type?.toUpperCase()] || notification.type?.toLowerCase() || 'general'

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '2px',
          border: '1px solid #e0e0e0',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          pb: 1,
          pt: 2,
          px: 2.5,
        }}
      >
        <Box sx={{ flex: 1, pr: 2 }}>
          <Typography
            variant="h6"
            sx={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.4, mb: 1 }}
          >
            {notification.title || 'Notification'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Chip
              label={typeLabel}
              size="small"
              sx={{ backgroundColor: '#eeeeee', color: '#555555', fontSize: '0.65rem' }}
            />
            <Chip
              label={pStyle.label}
              size="small"
              sx={{ backgroundColor: pStyle.bg, color: '#ffffff', fontSize: '0.65rem' }}
            />
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: '#999999', mt: -0.5 }}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ px: 2.5, py: 2 }}>
        <Typography
          variant="body2"
          sx={{ fontSize: '0.83rem', color: '#444444', lineHeight: 1.7, mb: 2, whiteSpace: 'pre-wrap' }}
        >
          {notification.message || 'No content available.'}
        </Typography>

        <Divider sx={{ mb: 1.5 }} />

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
          {notification.sender && (
            <Box>
              <Typography variant="caption" sx={{ color: '#aaaaaa', display: 'block', mb: 0.25 }}>From</Typography>
              <Typography variant="caption" sx={{ color: '#555555', fontFamily: "'IBM Plex Mono', monospace" }}>
                {notification.sender}
              </Typography>
            </Box>
          )}
          <Box>
            <Typography variant="caption" sx={{ color: '#aaaaaa', display: 'block', mb: 0.25 }}>Received</Typography>
            <Typography variant="caption" sx={{ color: '#555555', fontFamily: "'IBM Plex Mono', monospace" }}>
              {formatFullDate(notification.timestamp)}
            </Typography>
          </Box>
          {notification.id && (
            <Box>
              <Typography variant="caption" sx={{ color: '#aaaaaa', display: 'block', mb: 0.25 }}>ID</Typography>
              <Typography variant="caption" sx={{ color: '#bbbbbb', fontFamily: "'IBM Plex Mono', monospace" }}>
                #{notification.id}
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default NotificationModal
