import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Chip,
  IconButton
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import BadgeIcon from '@mui/icons-material/Badge';
import PaletteIcon from '@mui/icons-material/Palette';
import LogoutIcon from '@mui/icons-material/Logout';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../context/AuthContext';
import { usePartyTheme } from '../context/PartyThemeContext';
import PartyBadge from './PartyBadge';

const DRAWER_WIDTH = 250;

export default function Sidebar({ mobileOpen, onMobileClose, currentTab, onTabChange }) {
  const { currentUser, logout, settings } = useAuth();
  const { partyConfig } = usePartyTheme();

  const navItems = [
    { id: 'dashboard', label: 'ड्यासबोर्ड', icon: <DashboardIcon /> },
    { id: 'voters', label: 'मतदाता नामावली', icon: <PeopleAltIcon /> },
    { id: 'turnout', label: 'मतदान टर्नआउट %', icon: <HowToVoteIcon /> },
    { id: 'users', label: 'टोली / प्रतिनिधि', icon: <BadgeIcon /> },
    { id: 'settings', label: 'पार्टी थिम / सेटिङ', icon: <PaletteIcon /> }
  ];

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#ffffff',
        borderRight: '1px solid #e2e8f0'
      }}
    >
      {/* Brand Header */}
      <Box
        sx={{
          p: 2.2,
          borderBottom: '1px solid #f1f5f9',
          background: `linear-gradient(180deg, ${partyConfig.accentBg} 0%, #ffffff 100%)`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '10px',
                background: partyConfig.gradient || partyConfig.primary,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.12)'
              }}
            >
              🗳️
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                निर्वाचन अपरेसन
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 600 }}>
                {settings.municipality_name || 'Helambu Palika'}
              </Typography>
            </Box>
          </Box>
          {onMobileClose && (
            <IconButton
              size="small"
              onClick={onMobileClose}
              sx={{ display: { xs: 'flex', md: 'none' }, color: '#64748b' }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </Box>

        {/* Dynamic Party Symbol Badge */}
        <Box sx={{ mt: 1 }}>
          <PartyBadge size="small" />
        </Box>
      </Box>

      {/* Navigation List */}
      <List sx={{ px: 1.2, py: 1.5, flexGrow: 1 }}>
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <ListItem key={item.id} disablePadding sx={{ mb: 0.6 }}>
              <ListItemButton
                onClick={() => {
                  onTabChange(item.id);
                  if (onMobileClose) onMobileClose();
                }}
                sx={{
                  borderRadius: 2.5,
                  py: 1.1,
                  px: 1.8,
                  bgcolor: isActive ? partyConfig.accentBg : 'transparent',
                  color: isActive ? partyConfig.primary : '#475569',
                  border: isActive ? `1px solid ${partyConfig.cardBorder}` : '1px solid transparent',
                  fontWeight: isActive ? 700 : 500,
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: partyConfig.accentBg,
                    color: partyConfig.primary
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 38,
                    color: isActive ? partyConfig.primary : '#64748b'
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.88rem',
                    fontWeight: isActive ? 700 : 600
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: '#f1f5f9' }} />

      {/* User Profile Card */}
      {currentUser && (
        <Box sx={{ p: 1.8, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 0 }}>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: partyConfig.primary,
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: 700
                }}
              >
                {currentUser.name ? currentUser.name.charAt(0) : 'U'}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    color: '#0f172a',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {currentUser.name}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                  {currentUser.role}
                </Typography>
              </Box>
            </Box>
            <IconButton size="small" onClick={logout} sx={{ color: '#94a3b8', '&:hover': { color: '#ef4444' } }}>
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      {/* Mobile Temporary Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
            borderRight: 'none'
          }
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Permanent Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
            borderRight: '1px solid #e2e8f0',
            position: 'fixed',
            top: 0,
            left: 0,
            bottom: 0,
            height: '100vh'
          }
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </>
  );
}
export { DRAWER_WIDTH };
