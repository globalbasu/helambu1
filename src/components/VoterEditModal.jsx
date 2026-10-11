import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Typography,
  Box,
  Switch,
  FormControlLabel
} from '@mui/material';
import { usePartyTheme } from '../context/PartyThemeContext';
import { upsertVoter } from '../supabaseClient';

export default function VoterEditModal({ open, onClose, voter, onSaveSuccess }) {
  const { partyConfig } = usePartyTheme();
  const [formData, setFormData] = useState({
    voter_id: '',
    serial_no: '',
    full_name: '',
    phone: '',
    ward_no: 1,
    tole: '',
    booth_no: 'A',
    party_leaning: 'Undecided',
    sentiment: 'swing',
    voted_status: false,
    address: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (voter) {
      setFormData({
        voter_id: voter.voter_id || '',
        serial_no: voter.serial_no || '',
        full_name: voter.full_name || '',
        phone: voter.phone || '',
        ward_no: voter.ward_no || 1,
        tole: voter.tole || '',
        booth_no: voter.booth_no || 'A',
        party_leaning: voter.party_leaning || 'Undecided',
        sentiment: voter.sentiment || 'swing',
        voted_status: !!voter.voted_status,
        address: voter.address || ''
      });
    }
  }, [voter]);

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await upsertVoter(formData);
      if (onSaveSuccess) onSaveSuccess(formData);
      onClose();
    } catch (err) {
      console.error('Failed to save voter:', err);
      alert('मतदाता सुरक्षित गर्न सकिएन: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 800, pb: 1, borderBottom: '1px solid #e2e8f0' }}>
        {voter ? 'मतदाता विवरण सम्पादन' : 'नयाँ मतदाता दर्ता'}
      </DialogTitle>
      <DialogContent sx={{ pt: 2.5 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              label="मतदाता ID"
              size="small"
              fullWidth
              value={formData.voter_id}
              disabled={!!voter}
              onChange={(e) => handleChange('voter_id', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="क्रम संख्या (Serial)"
              size="small"
              fullWidth
              value={formData.serial_no}
              onChange={(e) => handleChange('serial_no', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="वडा नं."
              size="small"
              type="number"
              fullWidth
              value={formData.ward_no}
              onChange={(e) => handleChange('ward_no', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={7}>
            <TextField
              label="पूरा नाम (Full Name)"
              size="small"
              fullWidth
              value={formData.full_name}
              onChange={(e) => handleChange('full_name', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={5}>
            <TextField
              label="मोबाइल नम्बर"
              size="small"
              fullWidth
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="टोल / गाउँ"
              size="small"
              fullWidth
              value={formData.tole}
              onChange={(e) => handleChange('tole', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="मतदान केन्द्र / बुथ (Booth)"
              size="small"
              fullWidth
              value={formData.booth_no}
              onChange={(e) => handleChange('booth_no', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>पार्टी झुकाव (Party Leaning)</InputLabel>
              <Select
                value={formData.party_leaning}
                label="पार्टी झुकाव (Party Leaning)"
                onChange={(e) => handleChange('party_leaning', e.target.value)}
              >
                <MenuItem value="NC">नेपाली काँग्रेस (NC)</MenuItem>
                <MenuItem value="UML">नेकपा (एमाले)</MenuItem>
                <MenuItem value="RSP">राष्ट्रिय स्वतन्त्र पार्टी (RSP)</MenuItem>
                <MenuItem value="Maoist">माओवादी केन्द्र</MenuItem>
                <MenuItem value="RPP">राप्रपा (RPP)</MenuItem>
                <MenuItem value="Independent">स्वतन्त्र</MenuItem>
                <MenuItem value="Undecided">अनिर्णित (Undecided)</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>मतदाता भावना (Sentiment)</InputLabel>
              <Select
                value={formData.sentiment}
                label="मतदाता भावना (Sentiment)"
                onChange={(e) => handleChange('sentiment', e.target.value)}
              >
                <MenuItem value="solid">पक्का समर्थक (Solid)</MenuItem>
                <MenuItem value="favorable">सकारात्मक (Favorable)</MenuItem>
                <MenuItem value="swing">अनिर्णित / स्विङ (Swing)</MenuItem>
                <MenuItem value="opposed">विपक्षी (Opposed)</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.voted_status}
                    onChange={(e) => handleChange('voted_status', e.target.checked)}
                    color="success"
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {formData.voted_status ? '✓ भोट खस्यो (Voted)' : '✕ बाँकी (Not Voted)'}
                  </Typography>
                }
              />
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: '1px solid #e2e8f0' }}>
        <Button onClick={onClose} sx={{ color: '#64748b' }}>
          रद्द गर्नुहोस्
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={saving}
          sx={{ bgcolor: partyConfig.primary, fontWeight: 700 }}
        >
          {saving ? 'सुरक्षित गर्दै...' : 'सुरक्षित गर्नुहोस्'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
