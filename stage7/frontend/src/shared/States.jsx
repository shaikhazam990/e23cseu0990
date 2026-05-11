import React from 'react'
import { Box, Typography, CircularProgress, Button } from '@mui/material'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined'

export const LoadingState = ({ message = 'Loading notifications…' }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      py: 8,
      gap: 1.5,
    }}
  >
    <CircularProgress size={22} thickness={3} sx={{ color: '#333333' }} />
    <Typography variant="caption" sx={{ color: '#999999', fontSize: '0.75rem' }}>
      {message}
    </Typography>
  </Box>
)

export const ErrorState = ({ message = 'Failed to load notifications.', onRetry }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      py: 8,
      gap: 1.5,
    }}
  >
    <ErrorOutlineIcon sx={{ fontSize: 28, color: '#cccccc' }} />
    <Typography variant="body2" sx={{ color: '#888888', fontSize: '0.8rem' }}>
      {message}
    </Typography>
    {onRetry && (
      <Button
        size="small"
        variant="outlined"
        onClick={onRetry}
        sx={{
          mt: 0.5,
          fontSize: '0.75rem',
          color: '#444444',
          borderColor: '#cccccc',
          '&:hover': { borderColor: '#999999' },
        }}
      >
        Retry
      </Button>
    )}
  </Box>
)

export const EmptyState = ({ message = 'No notifications found.' }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      py: 8,
      gap: 1.5,
    }}
  >
    <InboxOutlinedIcon sx={{ fontSize: 28, color: '#dddddd' }} />
    <Typography variant="body2" sx={{ color: '#aaaaaa', fontSize: '0.8rem' }}>
      {message}
    </Typography>
  </Box>
)
