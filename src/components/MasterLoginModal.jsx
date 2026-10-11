import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  TextField,
  Button,
  Tabs,
  Tab,
  Alert,
  IconButton,
  Avatar
} from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SecurityIcon from '@mui/icons-material/Security';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../context/AuthContext';
import { usePartyTheme } from '../context/PartyThemeContext';

export default function MasterLoginModal({ open, onClose, onSwitchToPin = null }) {
  const { loginAsAdmin, loginSuperAdmin, settings } = useAuth();
  const { partyConfig } = usePartyTheme();
  const [tabIndex, setTabIndex] = useState(0); // 0: Palika Admin, 1: Super Admin

  const [adminUser, setAdminUser] = useState('helambu_admin');
  const [adminPass, setAdminPass] = useState('');
  const [masterKey, setMasterKey] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const res = loginAsAdmin(adminUser, adminPass);
    if (res.success) {
      if (onClose) onClose();
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleSuperSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const res = loginSuperAdmin(masterKey);
    if (res.success) {
      if (onClose) onClose();
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          p: 1.5,
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
        }
      }}
    >
      <DialogContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ bgcolor: partyConfig.primary, width: 38, height: 38 }}>
              {tabIndex === 0 ? <AdminPanelSettingsIcon /> : <SecurityIcon />}
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>
              {tabIndex === 0 ? 'पालिका एडमिन लगइन' : 'Super Admin Master HQ'}
            </Typography>
          </Box>
          {onClose && (
            <IconButton size="small" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          )}
        </Box>

        <Tabs
          value={tabIndex}
          onChange={(_, val) => {
            setTabIndex(val);
            setErrorMsg('');
          }}
          variant="fullWidth"
          sx={{ mb: 2.5, borderBottom: '1px solid #e2e8f0' }}
        >
          <Tab label="पालिका एडमिन" sx={{ fontWeight: 700 }} />
          <Tab label="Super Admin HQ" sx={{ fontWeight: 700 }} />
        </Tabs>

        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {errorMsg}
          </Alert>
        )}

        {tabIndex === 0 ? (
          <form onSubmit={handleAdminSubmit}>
            <TextField
              fullWidth
              size="small"
              label="Admin Username"
              value={adminUser}
              onChange={(e) => setAdminUser(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              size="small"
              type="password"
              label="Password / PIN (डिफल्ट: 1234)"
              value={adminPass}
              onChange={(e) => setAdminPass(e.target.value)}
              sx={{ mb: 2.5 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                py: 1.2,
                borderRadius: 2.5,
                background: partyConfig.gradient || partyConfig.primary,
                fontWeight: 700
              }}
            >
              पालिका कन्सोल खोल्नुहोस्
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSuperSubmit}>
            <TextField
              fullWidth
              size="small"
              type="password"
              label="Super Admin Master Key (1234 / admin)"
              value={masterKey}
              onChange={(e) => setMasterKey(e.target.value)}
              sx={{ mb: 2.5 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                py: 1.2,
                borderRadius: 2.5,
                background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
                fontWeight: 700
              }}
            >
              Master HQ Unlocked
            </Button>
          </form>
        )}

        {onSwitchToPin && (
          <Box sx={{ mt: 2.5, pt: 1.5, textAlign: 'center', borderTop: '1px solid #f1f5f9' }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={onSwitchToPin}
              size="small"
              sx={{ color: '#64748b', fontWeight: 600 }}
            >
              फिल्ड कर्मचारी PIN अनलकमा फर्कनुहोस्
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
