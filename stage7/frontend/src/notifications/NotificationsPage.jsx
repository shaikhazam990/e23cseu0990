import React, { useState } from 'react'
import {
  Box, Paper, Typography, Pagination,
} from '@mui/material'
import useNotifications from './useNotifications'
import { useViewedNotifications } from '../shared/useViewedNotifications'
import NotificationCard from '../shared/NotificationCard'
import NotificationModal from '../shared/NotificationModal'
import FilterBar from '../shared/FilterBar'
import { LoadingState, ErrorState, EmptyState } from '../shared/States'

const NotificationsPage = () => {
  const {
    notifications, allFiltered, allNotifications,
    loading, error, reload,
    page, setPage, totalPages,
    typeFilter, setTypeFilter, types,
  } = useNotifications()

  const { markViewed, markAllViewed, isViewed } = useViewedNotifications()

  const [selectedNotification, setSelectedNotification] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  const handleCardClick = (notification) => {
    markViewed(notification.id)
    setSelectedNotification(notification)
    setModalOpen(true)
  }

  const handleMarkAllRead = () => {
    markAllViewed(allFiltered.map((n) => n.id))
  }

  return (
    <Box sx={{ maxWidth: 780, mx: 'auto', px: { xs: 1.5, sm: 2 }, py: 3 }}>
      {/* Page Header */}
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="h5"
          sx={{ fontSize: '1rem', fontWeight: 600, color: '#111111', mb: 0.25 }}
        >
          Notifications
        </Typography>
        <Typography variant="caption" sx={{ color: '#aaaaaa' }}>
          All campus updates and announcements
        </Typography>
      </Box>

      <Paper>
        {/* Filter Bar */}
        {!loading && !error && (
          <FilterBar
            types={types}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            totalCount={allNotifications.length}
            filteredCount={allFiltered.length}
            onMarkAllRead={handleMarkAllRead}
          />
        )}

        {/* States */}
        {loading && <LoadingState />}
        {error && !loading && <ErrorState message={error} onRetry={reload} />}

        {!loading && !error && notifications.length === 0 && (
          <EmptyState
            message={
              typeFilter !== 'ALL'
                ? `No ${typeFilter.toLowerCase()} notifications.`
                : 'No notifications yet.'
            }
          />
        )}

        {/* List */}
        {!loading && !error && notifications.length > 0 && (
          <Box>
            {notifications.map((n) => (
              <NotificationCard
                key={n.id}
                notification={n}
                isViewed={isViewed(n.id)}
                onClick={handleCardClick}
              />
            ))}
          </Box>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <Box sx={{ py: 2, borderTop: '1px solid #eeeeee' }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, v) => setPage(v)}
              size="small"
              sx={{
                display: 'flex',
                justifyContent: 'center',
                '& .MuiPaginationItem-root': {
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '0.72rem',
                  color: '#555555',
                  borderRadius: '2px',
                },
                '& .Mui-selected': {
                  backgroundColor: '#111111 !important',
                  color: '#ffffff',
                },
              }}
            />
          </Box>
        )}
      </Paper>

      {/* Detail Modal */}
      <NotificationModal
        notification={selectedNotification}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </Box>
  )
}

export default NotificationsPage
