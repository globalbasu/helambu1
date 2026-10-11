import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  Alert,
  IconButton
} from '@mui/material';
import BackspaceIcon from '@mui/icons-material/Backspace';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../context/AuthContext';
import { usePartyTheme } from '../context/PartyThemeContext';

export default function PinKeypadModal({ open, onClose, defaultUserId = null, onAdminSwitch = null }) {
  const { usersList, loginWithPin } = useAuth();
  const { partyConfig } = usePartyTheme();
  const [selectedUser, setSelectedUser] = useState(defaultUserId || '');
  const [pinDigits, setPinDigits] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Check URL query parameters on open
  useEffect(() => {
    if (open) {
      setPinDigits('');
      setErrorMessage('');
      const params = new URLSearchParams(window.location.search);
      const urlWorker = params.get('worker') || params.get('w');
      if (urlWorker) {
        setSelectedUser(urlWorker);
      } else if (defaultUserId) {
        setSelectedUser(defaultUserId);
      } else if (usersList.length > 0 && !selectedUser) {
        // default to first field worker or coordinator
        const firstWorker = usersList.find((u) => u.role !== 'Super Admin') || usersList[0];
        if (firstWorker) setSelectedUser(firstWorker.user_id);
      }
    }
  }, [open, defaultUserId, usersList]);

  const currentUserData = usersList.find((u) => u.user_id === selectedUser);

  const handleKeyPress = (digit) => {
    if (pinDigits.length >= 4) return;
    try {
      if (navigator.vibrate) navigator.vibrate(25);
    } catch (_) {}
    const nextPin = pinDigits + digit;
    setPinDigits(nextPin);
    setErrorMessage('');

    // Auto submit if 4 digits
    if (nextPin.length === 4) {
      submitPin(nextPin);
    }
  };

  const handleBackspace = () => {
    try {
      if (navigator.vibrate) navigator.vibrate(25);
    } catch (_) {}
    setPinDigits((prev) => prev.slice(0, -1));
    setErrorMessage('');
  };

  const submitPin = (pinToTest = pinDigits) => {
    if (!selectedUser) {
      setErrorMessage('कृपया कर्मचारी चयन गर्नुहोस् (Select User)');
      return;
    }
    const res = loginWithPin(selectedUser, pinToTest);
    if (res.success) {
      try {
        if (navigator.vibrate) navigator.vibrate([40, 30, 40]);
      } catch (_) {}
      if (onClose) onClose();
    } else {
      try {
        if (navigator.vibrate) navigator.vibrate(150);
      } catch (_) {}
      setErrorMessage(res.message);
      setPinDigits('');
    }
  };

  const numbers = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['del', '0', 'ok']
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: { xs: '24px 24px 0 0', sm: '24px' },
          position: { xs: 'fixed', sm: 'relative' },
          bottom: { xs: 0, sm: 'auto' },
          m: { xs: 0, sm: 2 },
          width: { xs: '100%', sm: 'auto' },
          maxHeight: '94vh',
          p: 1.5,
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
        }
      }}
    >
      <DialogContent sx={{ p: { xs: 1.5, sm: 2.5 }, textAlign: 'center' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ bgcolor: partyConfig.primary, width: 36, height: 36 }}>
              <LockOutlinedIcon sx={{ fontSize: 20 }} />
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>
              १-सेकेन्ड PIN अनलक
            </Typography>
          </Box>
          {onClose && (
            <IconButton size="small" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          )}
        </Box>

        <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
          बुथ प्रतिनिधि र वडा संयोजकका लागि ४-Digit टच कोड
        </Typography>

        {/* User Selector Dropdown */}
        <FormControl fullWidth size="small" sx={{ mb: 2, textAlign: 'left' }}>
          <InputLabel id="user-select-label">कर्मचारी / प्रतिनिधि छान्नुहोस्</InputLabel>
          <Select
            labelId="user-select-label"
            value={selectedUser}
            label="कर्मचारी / प्रतिनिधि छान्नुहोस्"
            onChange={(e) => {
              setSelectedUser(e.target.value);
              setPinDigits('');
              setErrorMessage('');
            }}
            sx={{ borderRadius: 2.5 }}
          >
            {usersList.map((u) => (
              <MenuItem key={u.user_id} value={u.user_id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 24, height: 24, fontSize: 11, bgcolor: partyConfig.primary }}>
                    {u.name.charAt(0)}
                  </Avatar>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {u.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    ({u.role} - वडा {u.ward || 'All'})
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* PIN Indicators (4 Circles) */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 2.5,
            my: 2.5,
            py: 1
          }}
        >
          {[0, 1, 2, 3].map((index) => {
            const isEntered = pinDigits.length > index;
            return (
              <Box
                key={index}
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  border: `2.5px solid ${isEntered ? partyConfig.primary : '#cbd5e1'}`,
                  backgroundColor: isEntered ? partyConfig.primary : 'transparent',
                  transform: isEntered ? 'scale(1.2)' : 'scale(1)',
                  boxShadow: isEntered ? `0 0 10px ${partyConfig.primaryLight}` : 'none',
                  transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
            );
          })}
        </Box>

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 1.5, py: 0, borderRadius: 2 }}>
            {errorMessage}
          </Alert>
        )}

        {/* 3x4 Touch Numeric Keypad */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: { xs: 1.2, sm: 1.6 },
            maxWidth: 320,
            mx: 'auto'
          }}
        >
          {numbers.map((row, rIdx) =>
            row.map((item, cIdx) => {
              if (item === 'del') {
                return (
                  <Button
                    key={`btn-${rIdx}-${cIdx}`}
                    variant="outlined"
                    onClick={handleBackspace}
                    disabled={pinDigits.length === 0}
                    sx={{
                      height: { xs: 56, sm: 60 },
                      borderRadius: 3,
                      border: '1.5px solid #e2e8f0',
                      color: '#64748b',
                      fontSize: '1.2rem',
                      '&:active': { transform: 'scale(0.95)' }
                    }}
                  >
                    <BackspaceIcon />
                  </Button>
                );
              }
              if (item === 'ok') {
                return (
                  <Button
                    key={`btn-${rIdx}-${cIdx}`}
                    variant="contained"
                    onClick={() => submitPin()}
                    disabled={pinDigits.length !== 4}
                    sx={{
                      height: { xs: 56, sm: 60 },
                      borderRadius: 3,
                      background: partyConfig.gradient || partyConfig.primary,
                      color: '#ffffff',
                      fontSize: '1.2rem',
                      '&:active': { transform: 'scale(0.95)' }
                    }}
                  >
                    <CheckCircleIcon />
                  </Button>
                );
              }
              return (
                <Button
                  key={`btn-${rIdx}-${cIdx}`}
                  variant="outlined"
                  onClick={() => handleKeyPress(item)}
                  sx={{
                    height: { xs: 56, sm: 60 },
                    borderRadius: 3,
                    border: '1.5px solid #e2e8f0',
                    color: '#0f172a',
                    fontSize: '1.45rem',
                    fontWeight: 700,
                    bgcolor: '#ffffff',
                    '&:hover': { bgcolor: '#f8fafc', borderColor: partyConfig.primary },
                    '&:active': { transform: 'scale(0.92)', bgcolor: partyConfig.accentBg }
                  }}
                >
                  {item}
                </Button>
              );
            })
          )}
        </Box>

        {/* Footer info & Admin switch */}
        <Box sx={{ mt: 2.5, pt: 1.5, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" sx={{ color: '#94a3b8' }}>
            डिफल्ट PIN: 1234
          </Typography>
          {onAdminSwitch && (
            <Button size="small" onClick={onAdminSwitch} sx={{ fontSize: '0.8rem', color: partyConfig.primary, textTransform: 'none' }}>
              🔑 एडमिन / मास्टर लगइन
            </Button>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
