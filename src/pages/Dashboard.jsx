import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Chip,
  Avatar,
  IconButton
} from '@mui/material';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SyncIcon from '@mui/icons-material/Sync';
import { useAuth } from '../context/AuthContext';
import { usePartyTheme } from '../context/PartyThemeContext';
import PartyBadge from '../components/PartyBadge';

export default function Dashboard({ voters = [], onNavigate, onOpenPinModal, onRefreshVoters }) {
  const { currentUser, settings } = useAuth();
  const { partyConfig } = usePartyTheme();

  // Metrics calculation
  const totalVoters = voters.length;
  const votedCount = voters.filter((v) => v.voted_status).length;
  const remainingCount = totalVoters - votedCount;
  const turnoutPercent = totalVoters > 0 ? Math.round((votedCount / totalVoters) * 100) : 0;

  // Ward summary
  const wardMap = {};
  for (let w = 1; w <= 9; w++) {
    wardMap[w] = { total: 0, voted: 0 };
  }
  voters.forEach((v) => {
    const w = Number(v.ward_no) || 1;
    if (!wardMap[w]) wardMap[w] = { total: 0, voted: 0 };
    wardMap[w].total += 1;
    if (v.voted_status) wardMap[w].voted += 1;
  });

  return (
    <Box sx={{ pb: { xs: 8, md: 4 } }}>
      {/* Hero Banner with Party Branding */}
      <Card
        sx={{
          mb: 3,
          borderRadius: 3.5,
          background: partyConfig.gradient || partyConfig.primary,
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
        }}
      >
        <CardContent sx={{ p: { xs: 2.2, sm: 3.5 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(255,255,255,0.2)', px: 1.5, py: 0.5, borderRadius: 2, mb: 1 }}>
                <Typography sx={{ fontSize: 16 }}>{partyConfig.symbol}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#ffffff' }}>
                  {partyConfig.name} • निर्वाचन कमाण्ड
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
                {settings.municipality_name || 'हेलम्बु गाउँपालिका'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, maxWidth: 520 }}>
                प्रत्यक्ष बुथ टर्नआउट ट्र्याकिङ, १-सेकेन्ड PIN अनलक तथा १-ट्याप भोट प्रमाणीकरण प्रणाली
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                size="small"
                startIcon={<SyncIcon />}
                onClick={onRefreshVoters}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: '#ffffff',
                  fontWeight: 700,
                  backdropFilter: 'blur(8px)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                }}
              >
                सिङ्क
              </Button>
              {!currentUser && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<LockOpenIcon />}
                  onClick={onOpenPinModal}
                  sx={{
                    bgcolor: '#ffffff',
                    color: partyConfig.primary,
                    fontWeight: 800,
                    '&:hover': { bgcolor: '#f8fafc' }
                  }}
                >
                  PIN अनलक
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* KPI Cards Grid */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <CardContent sx={{ p: { xs: 1.8, sm: 2.2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  कुल मतदाता
                </Typography>
                <Avatar sx={{ width: 32, height: 32, bgcolor: '#f1f5f9', color: '#475569' }}>
                  <PeopleAltIcon sx={{ fontSize: 18 }} />
                </Avatar>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
                {totalVoters}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                दर्ता मतदाता सूची
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid #bbf7d0', bgcolor: '#f0fdf4' }}>
            <CardContent sx={{ p: { xs: 1.8, sm: 2.2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>
                  खसेको मत ✓
                </Typography>
                <Avatar sx={{ width: 32, height: 32, bgcolor: '#dcfce7', color: '#16a34a' }}>
                  <CheckCircleIcon sx={{ fontSize: 18 }} />
                </Avatar>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#166534' }}>
                {votedCount}
              </Typography>
              <Typography variant="caption" sx={{ color: '#15803d', fontWeight: 600 }}>
                प्रमाणित मत
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid #fecaca', bgcolor: '#fff1f2' }}>
            <CardContent sx={{ p: { xs: 1.8, sm: 2.2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#9f1239', fontWeight: 700, textTransform: 'uppercase' }}>
                  खस्न बाँकी ✕
                </Typography>
                <Avatar sx={{ width: 32, height: 32, bgcolor: '#ffe4e6', color: '#e11d48' }}>
                  <PendingIcon sx={{ fontSize: 18 }} />
                </Avatar>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#9f1239' }}>
                {remainingCount}
              </Typography>
              <Typography variant="caption" sx={{ color: '#be123c', fontWeight: 600 }}>
                बुथमा आउन बाँकी
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card sx={{ borderRadius: 3, border: `1px solid ${partyConfig.cardBorder}`, bgcolor: partyConfig.accentBg }}>
            <CardContent sx={{ p: { xs: 1.8, sm: 2.2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ color: partyConfig.primary, fontWeight: 700, textTransform: 'uppercase' }}>
                  मतदान दर %
                </Typography>
                <Avatar sx={{ width: 32, height: 32, bgcolor: partyConfig.primary, color: '#ffffff' }}>
                  <HowToVoteIcon sx={{ fontSize: 18 }} />
                </Avatar>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: partyConfig.primary }}>
                {turnoutPercent}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={turnoutPercent}
                sx={{
                  mt: 0.8,
                  height: 6,
                  borderRadius: 3,
                  bgcolor: '#e2e8f0',
                  '& .MuiLinearProgress-bar': { bgcolor: partyConfig.primary }
                }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Ward-by-Ward Quick Grid */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.05rem' }}>
            वडागत मतदान स्थिति (Wards 1 - 9)
          </Typography>
          <Button
            size="small"
            endIcon={<ArrowForwardIcon />}
            onClick={() => onNavigate('turnout')}
            sx={{ color: partyConfig.primary, fontWeight: 700 }}
          >
            विस्तृत टर्नआउट
          </Button>
        </Box>

        <Grid container spacing={1.5}>
          {Object.entries(wardMap).map(([ward, stat]) => {
            const pct = stat.total > 0 ? Math.round((stat.voted / stat.total) * 100) : 0;
            return (
              <Grid item xs={12} sm={6} md={4} key={ward}>
                <Card sx={{ borderRadius: 2.5, border: '1px solid #e2e8f0', p: 1.8 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                      वडा नं. {ward}
                    </Typography>
                    <Chip
                      size="small"
                      label={`${pct}% मत`}
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        bgcolor: pct >= 50 ? '#dcfce7' : '#f1f5f9',
                        color: pct >= 50 ? '#15803d' : '#475569'
                      }}
                    />
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={pct}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: '#f1f5f9',
                      mb: 1,
                      '& .MuiLinearProgress-bar': {
                        bgcolor: pct >= 50 ? '#16a34a' : partyConfig.primary
                      }
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.75rem' }}>
                    <span>खसेको: {stat.voted} मत</span>
                    <span>कुल: {stat.total}</span>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Box>
  );
}
