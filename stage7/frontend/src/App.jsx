import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, CssBaseline, Box } from '@mui/material'
import theme from './shared/theme'
import NavBar from './shared/NavBar'
import NotificationsPage from './notifications/NotificationsPage'
import PriorityInboxPage from './notifications/PriorityInboxPage'

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f7f7f7' }}>
          <NavBar />
          <Box component="main">
            <Routes>
              <Route path="/" element={<NotificationsPage />} />
              <Route path="/priority" element={<PriorityInboxPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Box>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
