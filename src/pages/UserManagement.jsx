import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import BadgeIcon from '@mui/icons-material/Badge';
import { useAuth } from '../context/AuthContext';
import { usePartyTheme } from '../context/PartyThemeContext';
import { upsertUser } from '../supabaseClient';
import PartyBadge from '../components/PartyBadge';

export default function UserManagement({ onOpenPinModalForUser }) {
  const { usersList, refreshUsers, settings } = useAuth();
  const { partyConfig, allParties, selectParty } = usePartyTheme();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    user_id: '',
    name: '',
    phone: '',
    role: 'Field Worker',
    pin: '1234',
    ward: '1',
    tole: '',
    booth_no: 'A',
    party: 'NC'
  });
  const [saving, setSaving] = useState(false);

  const handleOpenAdd = () => {
    setFormData({
      user_id: `USR_${Date.now().toString().slice(-6)}`,
      name: '',
      phone: '',
      role: 'Booth Representative',
      pin: Math.floor(1000 + Math.random() * 9000).toString(),
      ward: '1',
      tole: '',
      booth_no: 'A',
      party: partyConfig.id || 'NC'
    });
    setAddModalOpen(true);
  };

  const handleSaveUser = async () => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('कृपया नाम र फोन नम्बर अनिवार्य भर्नुहोस्!');
      return;
    }

    try {
      setSaving(true);
      const userPayload = {
        user_id: formData.user_id,
        name: formData.name,
        phone: formData.phone,
        role: formData.role,
        pin: formData.pin,
        ward: formData.ward,
        tole: formData.tole,
        booth_no: formData.booth_no,
        active: true,
        notes: JSON.stringify({ party: formData.party })
      };

      await upsertUser(userPayload);
      await refreshUsers();
      setAddModalOpen(false);
    } catch (err) {
      console.error('Failed to create user:', err);
      alert('कर्मचारी सिर्जना गर्न सकिएन: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const generateWorkerShareLink = (user) => {
    const origin = window.location.origin;
    const path = window.location.pathname;
    return `${origin}${path}?worker=${user.user_id}`;
  };

  const handleShareWhatsApp = (user) => {
    const link = generateWorkerShareLink(user);
    const pin = user.pin || '1234';
    const text = encodeURIComponent(
      `नमस्ते ${user.name} ज्यू!\n\nतपाईंलाई ${settings.municipality_name || 'हेलम्बु'} निर्वाचन प्रणालीमा ${user.role} (वडा ${user.ward}) को जिम्मेवारी दिइएको छ।\n\nसिधै खोल्ने लिङ्क:\n${link}\n\nतपाईंको ४-अङ्कको PIN कोड: ${pin}\n\nधन्यवाद!`
    );
    const cleanPhone = (user.phone || '').replace(/[^0-9]/g, '');
    const url = cleanPhone.length >= 10
      ? `https://api.whatsapp.com/send?phone=977${cleanPhone.slice(-10)}&text=${text}`
      : `https://api.whatsapp.com/send?text=${text}`;
    window.open(url, '_blank');
  };

  const handleCopyLink = (user) => {
    const link = generateWorkerShareLink(user);
    navigator.clipboard.writeText(link);
    alert('कर्मचारी लिङ्क क्लिपबोर्डमा कपी गरियो!');
  };

  return (
    <Box sx={{ pb: { xs: 9, md: 4 } }}>
      {/* Top Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
            टोली तथा बुथ प्रतिनिधि व्यवस्थापन
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            कर्मचारी सिर्जना गर्दा पार्टी पहिचान, ४-अङ्कको PIN र ह्वाट्सएप लगइन लिङ्क
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={handleOpenAdd}
          sx={{
            bgcolor: partyConfig.primary,
            fontWeight: 700,
            borderRadius: 2.5
          }}
        >
          नयाँ प्रतिनिधि / कार्यकर्ता थप्नुहोस्
        </Button>
      </Box>

      {/* Users Grid */}
      <Grid container spacing={2}>
        {usersList.map((u) => {
          let userParty = 'INDEPENDENT';
          if (u.notes) {
            try {
              const p = typeof u.notes === 'string' ? JSON.parse(u.notes) : u.notes;
              if (p.party) userParty = p.party;
            } catch (_) {}
          }
          const pConfig = allParties[userParty] || partyConfig;

          return (
            <Grid item xs={12} sm={6} md={4} key={u.user_id}>
              <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                    <Avatar sx={{ bgcolor: pConfig.primary, color: '#ffffff', fontWeight: 800 }}>
                      {u.name ? u.name.charAt(0) : 'U'}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                        {u.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                        {u.role}
                      </Typography>
                    </Box>
                  </Box>
                  <PartyBadge partyId={userParty} size="small" />
                </Box>

                <Box sx={{ bgcolor: '#f8fafc', p: 1.2, borderRadius: 2, mb: 1.5, border: '1px solid #f1f5f9' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', mb: 0.5 }}>
                    <span style={{ color: '#64748b' }}>वडा / बुथ:</span>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>
                      वडा {u.ward || 'All'} {u.booth_no ? `(बुथ ${u.booth_no})` : ''}
                    </span>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', mb: 0.5 }}>
                    <span style={{ color: '#64748b' }}>मोबाइल:</span>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{u.phone}</span>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                    <span style={{ color: '#64748b' }}>४-Digit PIN:</span>
                    <span style={{ fontWeight: 800, color: pConfig.primary, letterSpacing: 2 }}>{u.pin || '1234'}</span>
                  </Box>
                </Box>

                {/* Actions */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<LockOpenIcon sx={{ fontSize: 16 }} />}
                    onClick={() => onOpenPinModalForUser(u.user_id)}
                    sx={{ flex: 1, borderRadius: 2, fontSize: '0.75rem', fontWeight: 700 }}
                  >
                    PIN अनलक
                  </Button>
                  <Tooltip title="ह्वाट्सएपमा लिङ्क पठाउनुहोस्">
                    <IconButton
                      size="small"
                      onClick={() => handleShareWhatsApp(u)}
                      sx={{ bgcolor: '#dcfce7', color: '#16a34a', '&:hover': { bgcolor: '#bbf7d0' } }}
                    >
                      <WhatsAppIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="लगइन लिङ्क कपी">
                    <IconButton size="small" onClick={() => handleCopyLink(u)} sx={{ bgcolor: '#f1f5f9', color: '#475569' }}>
                      <ContentCopyIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Add User Dialog with Party Selector */}
      <Dialog open={addModalOpen} onClose={() => setAddModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid #e2e8f0', pb: 1 }}>
          नयाँ प्रतिनिधि / कार्यकर्ता दर्ता (Party & PIN)
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="पूरा नाम"
                size="small"
                fullWidth
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="मोबाइल नम्बर"
                size="small"
                fullWidth
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Grid>

            {/* Political Party Selector */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>राजनीतिक पार्टी (Political Party)</InputLabel>
                <Select
                  value={formData.party}
                  label="राजनीतिक पार्टी (Political Party)"
                  onChange={(e) => setFormData({ ...formData, party: e.target.value })}
                >
                  {Object.values(allParties).map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{p.symbol}</span>
                        <span>{p.name}</span>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>जिम्मेवारी (Role)</InputLabel>
                <Select
                  value={formData.role}
                  label="जिम्मेवारी (Role)"
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <MenuItem value="Booth Representative">बुथ प्रतिनिधि (Booth Rep)</MenuItem>
                  <MenuItem value="Ward Coordinator">वडा संयोजक (Ward Coordinator)</MenuItem>
                  <MenuItem value="Field Worker">फिल्ड कार्यकर्ता (Field Worker)</MenuItem>
                  <MenuItem value="Palika Admin">पालिका एडमिन (Palika Admin)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="वडा नं."
                size="small"
                fullWidth
                value={formData.ward}
                onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="बुथ कोड (A / B)"
                size="small"
                fullWidth
                value={formData.booth_no}
                onChange={(e) => setFormData({ ...formData, booth_no: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="४-Digit PIN"
                size="small"
                fullWidth
                value={formData.pin}
                onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #e2e8f0' }}>
          <Button onClick={() => setAddModalOpen(false)} sx={{ color: '#64748b' }}>
            रद्द गर्नुहोस्
          </Button>
          <Button
            onClick={handleSaveUser}
            variant="contained"
            disabled={saving}
            sx={{ bgcolor: partyConfig.primary, fontWeight: 700 }}
          >
            {saving ? 'दर्ता गर्दै...' : 'दर्ता तथा PIN सिर्जना'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
