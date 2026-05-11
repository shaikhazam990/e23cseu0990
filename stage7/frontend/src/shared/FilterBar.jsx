import React from 'react'
import {
  Box, Select, MenuItem, FormControl, InputLabel,
  Typography, Button,
} from '@mui/material'
import TuneIcon from '@mui/icons-material/Tune'

const FilterBar = ({ types, typeFilter, setTypeFilter, totalCount, filteredCount, onMarkAllRead }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        flexWrap: 'wrap',
        px: 2.5,
        py: 1.5,
        borderBottom: '1px solid #eeeeee',
        backgroundColor: '#fdfdfd',
      }}
    >
      <TuneIcon sx={{ fontSize: 15, color: '#aaaaaa' }} />

      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel
          sx={{ fontSize: '0.75rem', fontFamily: "'IBM Plex Mono', monospace" }}
        >
          Type
        </InputLabel>
        <Select
          value={typeFilter}
          label="Type"
          onChange={(e) => setTypeFilter(e.target.value)}
          sx={{
            fontSize: '0.75rem',
            fontFamily: "'IBM Plex Mono', monospace",
            height: 32,
            '& .MuiSelect-select': { py: 0.75 },
          }}
        >
          <MenuItem value="ALL" sx={{ fontSize: '0.75rem' }}>All types</MenuItem>
          {types.map((t) => (
            <MenuItem key={t} value={t} sx={{ fontSize: '0.75rem', textTransform: 'lowercase' }}>
              {t.toLowerCase()}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Typography
        variant="caption"
        sx={{ color: '#bbbbbb', fontSize: '0.7rem', fontFamily: "'IBM Plex Mono', monospace" }}
      >
        {filteredCount} / {totalCount}
      </Typography>

      <Box sx={{ flex: 1 }} />

      {onMarkAllRead && (
        <Button
          size="small"
          onClick={onMarkAllRead}
          sx={{
            fontSize: '0.72rem',
            color: '#666666',
            '&:hover': { color: '#111111' },
          }}
        >
          Mark all read
        </Button>
      )}
    </Box>
  )
}

export default FilterBar
