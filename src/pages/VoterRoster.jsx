import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Chip,
  Card,
  CardContent,
  IconButton,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PhoneIcon from '@mui/icons-material/Phone';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { usePartyTheme } from '../context/PartyThemeContext';
import { toggleVoterPollingStatus } from '../supabaseClient';
import VoterEditModal from '../components/VoterEditModal';

export default function VoterRoster({ voters = [], onRefreshVoters }) {
  const { partyConfig } = usePartyTheme();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWard, setSelectedWard] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All'); // 'All', 'voted', 'remaining'
  const [selectedBooth, setSelectedBooth] = useState('All');
  const [updatingVoterId, setUpdatingVoterId] = useState(null);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [activeVoter, setActiveVoter] = useState(null);

  // Filtered voters
  const filteredVoters = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return voters.filter((v) => {
      // 1. Search filter (Name, Phone, Serial, Voter ID)
      if (q) {
        const nameMatch = (v.full_name || '').toLowerCase().includes(q);
        const phoneMatch = (v.phone || '').includes(q);
        const serialMatch = String(v.serial_no || '').includes(q);
        const idMatch = (v.voter_id || '').toLowerCase().includes(q);
        if (!nameMatch && !phoneMatch && !serialMatch && !idMatch) return false;
      }

      // 2. Ward filter
      if (selectedWard !== 'All' && String(v.ward_no) !== String(selectedWard)) {
        return false;
      }

      // 3. Status filter
      if (selectedStatus === 'voted' && !v.voted_status) return false;
      if (selectedStatus === 'remaining' && v.voted_status) return false;

      // 4. Booth filter
      if (selectedBooth !== 'All' && (v.booth_no || 'A') !== selectedBooth) {
        return false;
      }

      return true;
    });
  }, [voters, searchTerm, selectedWard, selectedStatus, selectedBooth]);

  // 1-Tap Toggle Polling Status
  const handleToggleVote = async (voter) => {
    const newStatus = !voter.voted_status;
    try {
      setUpdatingVoterId(voter.voter_id);
      if (navigator.vibrate) navigator.vibrate(40);
      await toggleVoterPollingStatus(voter.voter_id, newStatus);
      if (onRefreshVoters) onRefreshVoters();
    } catch (err) {
      console.error('Failed to toggle vote status:', err);
      alert('भोट स्थिति अपडेट गर्न सकिएन: ' + err.message);
    } finally {
      setUpdatingVoterId(null);
    }
  };

  const handleEdit = (v) => {
    setActiveVoter(v);
    setEditModalOpen(true);
  };

  const handleAddNew = () => {
    setActiveVoter({
      voter_id: `VOT_${Date.now().toString().slice(-6)}`,
      serial_no: '',
      full_name: '',
      phone: '',
      ward_no: selectedWard === 'All' ? 1 : Number(selectedWard),
      tole: '',
      booth_no: 'A',
      party_leaning: 'Undecided',
      voted_status: false
    });
    setEditModalOpen(true);
  };

  return (
    <Box sx={{ pb: { xs: 9, md: 4 } }}>
      {/* Title & Action */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
            मतदाता सूची तथा १-ट्याप भोटिङ
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            जम्मा {filteredVoters.length} मतदाता भेटिए (१-सेकेन्ड खोज)
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={handleAddNew}
          sx={{
            bgcolor: partyConfig.primary,
            fontWeight: 700,
            borderRadius: 2.5
          }}
        >
          नयाँ मतदाता थप्नुहोस्
        </Button>
      </Box>

      {/* Instant Search Bar */}
      <Card sx={{ mb: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', p: 1.5 }}>
        <TextField
          fullWidth
          placeholder="नाम, फोन नम्बर, परिचयपत्र नं, वा क्रम संख्या खोज्नुहोस्..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: partyConfig.primary }} />
              </InputAdornment>
            ),
            sx: { borderRadius: 2.5, bgcolor: '#f8fafc' }
          }}
          size="small"
        />

        {/* Quick Filters */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mt: 1.5, flexWrap: 'wrap' }}>
          <Chip
            label="सबै (All)"
            clickable
            color={selectedStatus === 'All' ? 'primary' : 'default'}
            onClick={() => setSelectedStatus('All')}
            sx={{ fontWeight: 700 }}
          />
          <Chip
            label="✓ भोट खसेको"
            clickable
            color={selectedStatus === 'voted' ? 'success' : 'default'}
            onClick={() => setSelectedStatus('voted')}
            sx={{ fontWeight: 700 }}
          />
          <Chip
            label="✕ खस्न बाँकी"
            clickable
            color={selectedStatus === 'remaining' ? 'error' : 'default'}
            onClick={() => setSelectedStatus('remaining')}
            sx={{ fontWeight: 700 }}
          />

          <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
            <FormControl size="small" sx={{ minWidth: 110 }}>
              <InputLabel>वडा छान्नुहोस्</InputLabel>
              <Select value={selectedWard} label="वडा छान्नुहोस्" onChange={(e) => setSelectedWard(e.target.value)}>
                <MenuItem value="All">सबै वडा</MenuItem>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((w) => (
                  <MenuItem key={w} value={w}>
                    वडा नं. {w}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>बुथ (Booth)</InputLabel>
              <Select value={selectedBooth} label="बुथ (Booth)" onChange={(e) => setSelectedBooth(e.target.value)}>
                <MenuItem value="All">सबै बुथ</MenuItem>
                <MenuItem value="A">बुथ क (A)</MenuItem>
                <MenuItem value="B">बुथ ख (B)</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Card>

      {/* Voters List / Cards */}
      <Grid container spacing={1.5}>
        {filteredVoters.map((v) => {
          const isVoted = !!v.voted_status;
          const isUpdating = updatingVoterId === v.voter_id;
          const cleanPhone = (v.phone || '').replace(/[^0-9]/g, '');

          return (
            <Grid item xs={12} sm={6} md={4} key={v.voter_id}>
              <Card
                sx={{
                  borderRadius: 3,
                  border: isVoted ? '1.5px solid #bbf7d0' : '1px solid #e2e8f0',
                  bgcolor: isVoted ? '#f0fdf4' : '#ffffff',
                  boxShadow: isVoted ? '0 4px 12px rgba(22, 163, 74, 0.08)' : 'none',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  {/* Top: Serial & Ward */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Chip
                      size="small"
                      label={`क्र.सं. ${v.serial_no || '-'}`}
                      sx={{ fontWeight: 800, bgcolor: '#f1f5f9', color: '#334155', height: 22, fontSize: '0.72rem' }}
                    />
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Chip
                        size="small"
                        label={`वडा ${v.ward_no}`}
                        sx={{ fontWeight: 700, bgcolor: partyConfig.accentBg, color: partyConfig.primary, height: 22, fontSize: '0.72rem' }}
                      />
                      <Chip
                        size="small"
                        label={`बुथ ${v.booth_no || 'A'}`}
                        sx={{ fontWeight: 700, bgcolor: '#f8fafc', color: '#64748b', height: 22, fontSize: '0.72rem' }}
                      />
                    </Box>
                  </Box>

                  {/* Name & Tole */}
                  <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.02rem', color: '#0f172a', mb: 0.2 }}>
                    {v.full_name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem', mb: 1.5 }}>
                    {v.tole ? `${v.tole} • ` : ''}
                    {v.gender ? `${v.gender} • ` : ''}
                    {v.age_group || ''}
                  </Typography>

                  {/* Contact & Edit Bar */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    {cleanPhone ? (
                      <>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<PhoneIcon sx={{ fontSize: 15 }} />}
                          href={`tel:${cleanPhone}`}
                          sx={{ borderRadius: 2, py: 0.4, px: 1, fontSize: '0.75rem', fontWeight: 700, color: '#0f172a', borderColor: '#cbd5e1' }}
                        >
                          {v.phone}
                        </Button>
                        <IconButton
                          size="small"
                          href={`https://wa.me/977${cleanPhone.slice(-10)}`}
                          target="_blank"
                          sx={{ bgcolor: '#dcfce7', color: '#16a34a', '&:hover': { bgcolor: '#bbf7d0' } }}
                        >
                          <WhatsAppIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </>
                    ) : (
                      <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                        फोन नम्बर छैन
                      </Typography>
                    )}

                    <IconButton size="small" onClick={() => handleEdit(v)} sx={{ ml: 'auto', color: '#64748b' }}>
                      <EditIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Box>

                  {/* 1-Tap Polling Toggle Button */}
                  <Button
                    fullWidth
                    variant={isVoted ? 'contained' : 'outlined'}
                    disabled={isUpdating}
                    onClick={() => handleToggleVote(v)}
                    startIcon={
                      isUpdating ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : isVoted ? (
                        <CheckCircleIcon sx={{ fontSize: 20 }} />
                      ) : (
                        <RadioButtonUncheckedIcon sx={{ fontSize: 20 }} />
                      )
                    }
                    sx={{
                      py: 1.2,
                      borderRadius: 2.5,
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      ...(isVoted
                        ? {
                            bgcolor: '#16a34a',
                            color: '#ffffff',
                            boxShadow: '0 4px 10px rgba(22, 163, 74, 0.25)',
                            '&:hover': { bgcolor: '#15803d' }
                          }
                        : {
                            borderColor: '#cbd5e1',
                            color: '#475569',
                            bgcolor: '#ffffff',
                            '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' }
                          })
                    }}
                  >
                    {isVoted ? '✓ भोट खस्यो (Voted)' : 'बाँकी (Not Voted ✕)'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Edit Modal */}
      <VoterEditModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        voter={activeVoter}
        onSaveSuccess={() => {
          if (onRefreshVoters) onRefreshVoters();
        }}
      />
    </Box>
  );
}
