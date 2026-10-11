import React from 'react';
import { Chip, Box, Typography } from '@mui/material';
import { usePartyTheme } from '../context/PartyThemeContext';

export default function PartyBadge({ partyId = null, clickable = false, onClick = null, size = 'medium' }) {
  const { partyConfig, allParties } = usePartyTheme();
  const config = partyId ? allParties[partyId] || partyConfig : partyConfig;

  if (!config) return null;

  return (
    <Chip
      size={size}
      clickable={clickable}
      onClick={onClick}
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
          <Typography component="span" sx={{ fontSize: size === 'small' ? '14px' : '17px' }}>
            {config.symbol}
          </Typography>
          <Typography component="span" sx={{ fontWeight: 700, fontSize: size === 'small' ? '0.75rem' : '0.85rem' }}>
            {config.name}
          </Typography>
        </Box>
      }
      sx={{
        backgroundColor: config.badgeBg || '#e2e8f0',
        color: config.badgeColor || '#0f172a',
        border: `1.5px solid ${config.cardBorder || '#cbd5e1'}`,
        boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
        cursor: clickable ? 'pointer' : 'default',
        '&:hover': clickable ? { filter: 'brightness(0.96)' } : {}
      }}
    />
  );
}
