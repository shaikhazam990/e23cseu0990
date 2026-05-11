import React, { useState, useMemo } from 'react'
import {
  Box, Paper, Typography, Chip, Pagination,
  ToggleButtonGroup, ToggleButton, Divider, Tooltip,
} from '@mui/material'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import useNotifications from './useNotifications'
import { useViewedNotifications } from '../shared/useViewedNotifications'
import NotificationCard from '../shared/NotificationCard'
import NotificationModal from '../shared/NotificationModal'
import FilterBar from '../shared/FilterBar'
import { LoadingState, ErrorState, EmptyState } from '../shared/States'
import { rankNotifications, TOP_N_OPTIONS } from '../shared/priorityEngine'

const PAGE_SIZE = 10

const WEIGHT_LEGEND = [
  { type: 'Placement', weight: 3 },
  { type: 'Result', weight: 2 },
  { type: 'Event', weight: 1 },
  { type: 'Others', weight: 0 },
]

const PriorityInboxPage = () => {
  const {
    allNotifications, allFiltered,
    loading, error, reload,
    typeFilter, setTypeFilter, types,
  } = useNotifications()

  const { markViewed, markAllViewed, isViewed, viewed } = useViewedNotifications()
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [topN, setTopN] = useState(10)
  const [page, setPage] = useState(1)

  const handleCardClick = (notification) => {
    markViewed(notification.id)
    setSelectedNotification(notification)
    setModalOpen(true)
  }

  const handleMarkAllRead = () => {
    markAllViewed(ranked.map((n) => n.id))
  }

  const handleTopNChange = (_, value) => {
    if (value !== null) {
      setTopN(value)
      setPage(1)
    }
  }

  // Rank notifications using priority engine then slice to top N
  const ranked = useMemo(() => {
    const results = rankNotifications(allFiltered, viewed)
    return results.slice(0, topN)
  }, [allFiltered, viewed, topN])

  const totalPages = Math.max(1, Math.ceil(ranked.length / PAGE_SIZE))
  const paginated = ranked.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const unreadCount = ranked.filter((n) => !isViewed(n.id)).length

  return (
    <Box sx={{ maxWidth: 780, mx: 'auto', px: { xs: 1.5, sm: 2 }, py: 3 }}>
      {/* Page Header */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h5"
            sx={{ fontSize: '1rem', fontWeight: 600, color: '#111111', mb: 0.25 }}
          >
            Priority Inbox
          </Typography>
          <Typography variant="caption" sx={{ color: '#aaaaaa' }}>
            Top notifications ranked by type weight × recency
          </Typography>
        </Box>

        {unreadCount > 0 && !loading && !error && (
          <Chip
            label={`${unreadCount} unread`}
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

      {/* Top-N selector + weight legend */}
      {!loading && !error && allFiltered.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 1.5,
            flexWrap: 'wrap',
          }}
        >
          {/* Top-N toggle */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="caption"
              sx={{ fontFamily: "'IBM Plex Mono', monospace", color: '#888888', fontSize: '0.7rem' }}
            >
              show top
            </Typography>
            <ToggleButtonGroup
              value={topN}
              exclusive
              onChange={handleTopNChange}
              size="small"
            >
              {TOP_N_OPTIONS.map((n) => (
                <ToggleButton
                  key={n}
                  value={n}
                  sx={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '0.68rem',
                    px: 1.25,
                    py: 0.25,
                    border: '1px solid #e0e0e0 !important',
                    color: '#666666',
                    height: 26,
                    '&.Mui-selected': {
                      backgroundColor: '#111111',
                      color: '#ffffff',
                      '&:hover': { backgroundColor: '#333333' },
                    },
                  }}
                >
                  {n}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          <Box sx={{ flex: 1 }} />

          {/* Weight legend */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Tooltip
              title="Priority score = type weight × 1000 + recency (0–999). Unread always ranked above read."
              placement="top"
            >
              <InfoOutlinedIcon sx={{ fontSize: 13, color: '#cccccc', cursor: 'help' }} />
            </Tooltip>
            {WEIGHT_LEGEND.map((w) => (
              <Chip
                key={w.type}
                label={`${w.type} ×${w.weight}`}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.62rem',
                  fontFamily: "'IBM Plex Mono', monospace",
                  backgroundColor: w.weight > 0 ? '#eeeeee' : '#f7f7f7',
                  color: w.weight > 0 ? '#444444' : '#bbbbbb',
                }}
              />
            ))}
          </Box>
        </Box>
      )}

      <Paper>
        {/* Filter Bar */}
        {!loading && !error && (
          <FilterBar
            types={types}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            totalCount={allNotifications.length}
            filteredCount={ranked.length}
            onMarkAllRead={handleMarkAllRead}
          />
        )}

        {loading && <LoadingState />}
        {error && !loading && <ErrorState message={error} onRetry={reload} />}

        {!loading && !error && ranked.length === 0 && (
          <EmptyState
            message={
              typeFilter !== 'ALL'
                ? `No ${typeFilter.toLowerCase()} notifications.`
                : 'Your inbox is empty.'
            }
          />
        )}

        {/* Ranked list */}
        {!loading && !error && paginated.length > 0 && (
          <Box>
            {paginated.map((n, idx) => (
              <Box key={n.id} sx={{ position: 'relative' }}>
                {/* Rank badge */}
                <Box
                  sx={{
                    position: 'absolute',
                    left: 6,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 1,
                    width: 18,
                    height: 18,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: '0.58rem',
                      color: '#cccccc',
                      lineHeight: 1,
                    }}
                  >
                    {(page - 1) * PAGE_SIZE + idx + 1}
                  </Typography>
                </Box>
                <Box sx={{ pl: '22px' }}>
                  <NotificationCard
                    notification={n}
                    isViewed={isViewed(n.id)}
                    onClick={handleCardClick}
                    compact
                  />
                </Box>
              </Box>
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
