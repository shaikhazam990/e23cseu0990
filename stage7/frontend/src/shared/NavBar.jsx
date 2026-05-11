import React from 'react'
import { AppBar, Toolbar, Typography, Box, Button, Divider } from '@mui/material'
import { useNavigate, useLocation } from 'react-router-dom'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined'

const NavBar = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { label: 'Notifications', path: '/', icon: <NotificationsNoneOutlinedIcon sx={{ fontSize: 16 }} /> },
    { label: 'Priority Inbox', path: '/priority', icon: <InboxOutlinedIcon sx={{ fontSize: 16 }} /> },
  ]

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e0e0e0',
        color: '#111111',
      }}
    >
      <Toolbar sx={{ minHeight: '52px !important', px: { xs: 2, sm: 3 } }}>
        {/* Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mr: 4 }}>
          <Box
            sx={{
              width: 22,
              height: 22,
              backgroundColor: '#111111',
              borderRadius: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <NotificationsNoneOutlinedIcon sx={{ fontSize: 14, color: '#ffffff' }} />
          </Box>
          <Typography
            variant="subtitle1"
            sx={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '0.8rem',
              fontWeight: 600,
              letterSpacing: '0.03em',
              color: '#111111',
              userSelect: 'none',
            }}
          >
            CAMPUS<span style={{ color: '#888888' }}>/</span>NOTIFY
          </Typography>
        </Box>

        <Divider orientation="vertical" flexItem sx={{ mr: 3, my: 1.5 }} />

        {/* Nav Links */}
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {navItems.map((item) => {
            const active = location.pathname === item.path
            return (
              <Button
                key={item.path}
                onClick={() => navigate(item.path)}
                startIcon={item.icon}
                size="small"
                sx={{
                  color: active ? '#111111' : '#888888',
                  backgroundColor: active ? '#f0f0f0' : 'transparent',
                  fontWeight: active ? 600 : 400,
                  fontSize: '0.78rem',
                  px: 1.5,
                  py: 0.5,
                  '&:hover': { backgroundColor: '#f5f5f5', color: '#111111' },
                }}
              >
                {item.label}
              </Button>
            )
          })}
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default NavBar
