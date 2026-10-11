import React from 'react';
import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import BadgeIcon from '@mui/icons-material/Badge';
import PaletteIcon from '@mui/icons-material/Palette';
import { usePartyTheme } from '../context/PartyThemeContext';

export default function BottomNav({ currentTab, onTabChange }) {
  const { partyConfig } = usePartyTheme();

  return (
    <Paper
      elevation={6}
      sx={{
        display: { xs: 'block', md: 'none' },
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        borderTop: '1px solid #e2e8f0',
        pb: 'env(safe-area-inset-bottom, 0px)'
      }}
    >
      <BottomNavigation
        value={currentTab}
        onChange={(_, newValue) => onTabChange(newValue)}
        showLabels
        sx={{
          height: 60,
          '& .Mui-selected': {
            color: partyConfig.primary,
            fontWeight: 700
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.72rem',
            '&.Mui-selected': {
              fontSize: '0.75rem'
            }
          }
        }}
      >
        <BottomNavigationAction label="ड्यासबोर्ड" value="dashboard" icon={<DashboardIcon sx={{ fontSize: 22 }} />} />
        <BottomNavigationAction label="मतदाता" value="voters" icon={<PeopleAltIcon sx={{ fontSize: 22 }} />} />
        <BottomNavigationAction label="टर्नआउट %" value="turnout" icon={<HowToVoteIcon sx={{ fontSize: 22 }} />} />
        <BottomNavigationAction label="टोली" value="users" icon={<BadgeIcon sx={{ fontSize: 22 }} />} />
        <BottomNavigationAction label="थिम / सेटिङ" value="settings" icon={<PaletteIcon sx={{ fontSize: 22 }} />} />
      </BottomNavigation>
    </Paper>
  );
}
