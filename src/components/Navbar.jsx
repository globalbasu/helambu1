import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Button,
  Chip,
  Menu,
  MenuItem,
  Avatar,
  Tooltip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import PaletteIcon from '@mui/icons-material/Palette';
import { useAuth } from '../context/AuthContext';
import { usePartyTheme } from '../context/PartyThemeContext';
import PartyBadge from './PartyBadge';

export default function Navbar({ onMobileMenuToggle, onOpenPinModal, onOpenMasterModal }) {
  const { currentUser, settings } = useAuth();
  const { partyConfig, allParties, selectParty } = usePartyTheme();

  const [partyAnchorEl, setPartyAnchorEl] = useState(null);

  const handlePartyMenuOpen = (e) => {
    setPartyAnchorEl(e.currentTarget);
  };

  const handlePartyMenuClose = () => {
    setPartyAnchorEl(null);
  };

  const handleSelectParty = (pId) => {
    selectParty(pId);
    handlePartyMenuClose();
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer - 1,
        bgcolor: '#ffffff',
        color: '#0f172a',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        borderBottom: '1px solid #e2e8f0'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1.5, sm: 2.5 } }}>
        {/* Left: Mobile Menu Toggle & Palika Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={onMobileMenuToggle}
            sx={{ display: { xs: 'flex', md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                bgcolor: partyConfig.primary,
                color: '#ffffff',
                display: { xs: 'none', sm: 'flex' },
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16
              }}
            >
              🗳️
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                {settings.municipality_name || 'Helambu Rural Municipality'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.2 }}>
                <Chip
                  size="small"
                  label="Election Ops v2.0"
                  sx={{
                    height: 18,
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    bgcolor: '#f1f5f9',
                    color: '#475569'
                  }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                  <Box
                    sx={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      bgcolor: '#10b981',
                      boxShadow: '0 0 6px #10b981'
                    }}
                  />
                  <Typography variant="caption" sx={{ color: '#059669', fontWeight: 700, fontSize: '0.68rem', display: { xs: 'none', sm: 'inline' } }}>
                    Supabase Live
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Right: Party Theme Pill & User Login Status */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.8, sm: 1.5 } }}>
          {/* Party Theme Selector Button */}
          <Tooltip title="राजनीतिक दल थिम परिवर्तन (Change Party Theme)">
            <Button
              size="small"
              onClick={handlePartyMenuOpen}
              variant="outlined"
              sx={{
                borderColor: partyConfig.cardBorder,
                bgcolor: partyConfig.accentBg,
                color: partyConfig.primary,
                borderRadius: 2,
                px: { xs: 1, sm: 1.5 },
                py: 0.4,
                fontSize: { xs: '0.75rem', sm: '0.82rem' },
                fontWeight: 700,
                textTransform: 'none',
                gap: 0.6
              }}
            >
              <Typography component="span" sx={{ fontSize: '15px' }}>
                {partyConfig.symbol}
              </Typography>
              <Typography component="span" sx={{ display: { xs: 'none', sm: 'inline' }, fontWeight: 700 }}>
                {partyConfig.shortCode || partyConfig.name}
              </Typography>
            </Button>
          </Tooltip>

          {/* Party Dropdown Menu */}
          <Menu
            anchorEl={partyAnchorEl}
            open={Boolean(partyAnchorEl)}
            onClose={handlePartyMenuClose}
            PaperProps={{
              sx: { borderRadius: 3, boxShadow: '0 10px 30px rgba(0,0,0,0.12)', mt: 1, minWidth: 220 }
            }}
          >
            <Box sx={{ px: 2, py: 1, borderBottom: '1px solid #f1f5f9' }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                पार्टी आधिकारिक ब्रान्डिङ
              </Typography>
            </Box>
            {Object.values(allParties).map((party) => (
              <MenuItem
                key={party.id}
                onClick={() => handleSelectParty(party.id)}
                selected={partyConfig.id === party.id}
                sx={{
                  py: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  '&.Mui-selected': { bgcolor: party.accentBg }
                }}
              >
                <Typography sx={{ fontSize: 20 }}>{party.symbol}</Typography>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: party.primary }}>
                    {party.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    {party.nameEn}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Menu>

          {/* Auth Button or User Badge */}
          {currentUser ? (
            <Chip
              avatar={
                <Avatar sx={{ bgcolor: partyConfig.primary, color: '#ffffff', fontWeight: 700 }}>
                  {currentUser.name.charAt(0)}
                </Avatar>
              }
              label={currentUser.name}
              size="small"
              sx={{
                fontWeight: 700,
                bgcolor: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: { xs: 'none', sm: 'inline-flex' }
              }}
            />
          ) : (
            <Button
              size="small"
              variant="contained"
              startIcon={<LockOpenIcon sx={{ fontSize: 16 }} />}
              onClick={onOpenPinModal}
              sx={{
                bgcolor: partyConfig.primary,
                borderRadius: 2,
                fontSize: '0.8rem',
                fontWeight: 700,
                px: 1.5,
                py: 0.6
              }}
            >
              PIN अनलक
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
