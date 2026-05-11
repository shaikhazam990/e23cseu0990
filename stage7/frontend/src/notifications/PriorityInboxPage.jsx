import React, { useState, useMemo } from 'react'
import {
  Box, Paper, Typography, Divider, Chip, Pagination,
} from '@mui/material'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import RemoveIcon from '@mui/icons-material/Remove'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import useNotifications from '../notifications/useNotifications'
import { useViewedNotifications } from '../shared/useViewedNotifications'
import NotificationCard from '../shared/NotificationCard'
import NotificationModal from '../shared/NotificationModal'
import FilterBar from '../shared/FilterBar'
import { LoadingState, ErrorState, EmptyState } from '../shared/States'
import { getPriorityWeight } from '../shared/utils'

const SECTIONS = [
  {
    key: 'HIGH',
    label: 'High Priority',
    icon: <KeyboardArrowUpIcon sx={{ fontSize: 14 }} />,
    color: '#111111',
    bg: '#111111',
  },
  {
    key: 'MEDIUM',
    label: 'Medium',
    icon: <RemoveIcon sx={{ fontSize: 14 }} />,
    color: '#555555',
    bg: '#666666',
  },
  {
    key: 'LOW',
    label: 'Low',
    icon: <KeyboardArrowDownIcon sx={{ fontSize: 14 }} />,
    color: '#aaaaaa',
    bg: '#cccccc',
  },
]

const PAGE_SIZE = 8

const PrioritySection = ({ section, notifications, isViewed, onClick }) => {
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(notifications.length / PAGE_SIZE))
  const paginated = notifications.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const unreadCount = notifications.filter((n) => !isViewed(n.id)).length

  if (notifications.length === 0) return null

  return (
    <Box sx={{ mb: 2 }}>
      {/* Section Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          px: 2.5,
          py: 1,
          borderBottom: '1px solid #eeeeee',
          backgroundColor: '#f9f9f9',
        }}
      >
        <Box sx={{ color: section.color, display: 'flex', alignItems: 'center' }}>
          {section.icon}
        </Box>
        <Typography
          variant="caption"
          sx={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontWeight: 600,
            fontSize: '0.7rem',
            color: section.color,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          {section.label}
        </Typography>
        <Chip
          label={notifications.length}
          size="small"
          sx={{
            height: 18,
            fontSize: '0.62rem',
            fontFamily: "'IBM Plex Mono', monospace",
            backgroundColor: section.bg,
            color: '#ffffff',
            ml: 0.5,
          }}
        />
        {unreadCount > 0 && (
          <Chip
            label={`${unreadCount} unread`}
            size="small"
            sx={{
              height: 18,
              fontSize: '0.62rem',
              fontFamily: "'IBM Plex Mono', monospace",
              backgroundColor: '#eeeeee',
              color: '#777777',
            }}
          />
        )}
      </Box>

      {/* Notifications */}
      {paginated.map((n) => (
        <NotificationCard
          key={n.id}
          notification={n}
          isViewed={isViewed(n.id)}
          onClick={onClick}
          compact
        />
      ))}

      {/* Section pagination */}
      {totalPages > 1 && (
        <Box sx={{ py: 1.5, borderTop: '1px solid #f0f0f0' }}>
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
                fontSize: '0.68rem',
                borderRadius: '2px',
                color: '#666666',
              },
              '& .Mui-selected': {
                backgroundColor: '#111111 !important',
                color: '#ffffff',
              },
            }}
          />
        </Box>
      )}
    </Box>
  )
}

const PriorityInboxPage = () => {
  const {
    allNotifications, allFiltered,
    loading, error, reload,
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

  // Group filtered notifications by priority
  const grouped = useMemo(() => {
    const groups = { HIGH: [], MEDIUM: [], LOW: [] }
    allFiltered.forEach((n) => {
      const p = n.priority?.toUpperCase()
      if (groups[p]) groups[p].push(n)
      else groups.LOW.push(n)
    })
    return groups
  }, [allFiltered])

  const totalUnread = allFiltered.filter((n) => !isViewed(n.id)).length

  return (
    <Box sx={{ maxWidth: 780, mx: 'auto', px: { xs: 1.5, sm: 2 }, py: 3 }}>
      {/* Page Header */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography
            variant="h5"
            sx={{ fontSize: '1rem', fontWeight: 600, color: '#111111', mb: 0.25 }}
          >
            Priority Inbox
          </Typography>
          <Typography variant="caption" sx={{ color: '#aaaaaa' }}>
            Notifications grouped by urgency
          </Typography>
        </Box>
        {totalUnread > 0 && !loading && !error && (
          <Chip
            label={`${totalUnread} unread`}
            size="small"
            sx={{
              backgroundColor: '#111111',
              color: '#ffffff',
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '0.68rem',
              height: 22,
              borderRadius: '2px',
            }}
          />
        )}
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

        {loading && <LoadingState />}
        {error && !loading && <ErrorState message={error} onRetry={reload} />}

        {!loading && !error && allFiltered.length === 0 && (
          <EmptyState
            message={
              typeFilter !== 'ALL'
                ? `No ${typeFilter.toLowerCase()} notifications.`
                : 'Your inbox is empty.'
            }
          />
        )}

        {!loading && !error && allFiltered.length > 0 && (
          <Box>
            {SECTIONS.map((section) => (
              <PrioritySection
                key={section.key}
                section={section}
                notifications={grouped[section.key] || []}
                isViewed={isViewed}
                onClick={handleCardClick}
              />
            ))}
          </Box>
        )}
      </Paper>

      <NotificationModal
        notification={selectedNotification}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </Box>
  )
}

export default PriorityInboxPage
