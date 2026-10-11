import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Chip,
  Button,
  Avatar,
  Divider,
  Paper
} from '@mui/material';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import SyncIcon from '@mui/icons-material/Sync';
import { useAuth } from '../context/AuthContext';
import { usePartyTheme } from '../context/PartyThemeContext';

export default function TurnoutStats({ voters = [], onRefreshVoters }) {
  const { settings } = useAuth();
  const { partyConfig } = usePartyTheme();

  // Total Metrics
  const totalVoters = voters.length;
  const votedCount = voters.filter((v) => v.voted_status).length;
  const remainingCount = totalVoters - votedCount;
  const turnoutPercent = totalVoters > 0 ? ((votedCount / totalVoters) * 100).toFixed(1) : 0;

  // Ward data aggregation
  const wardStats = {};
  for (let w = 1; w <= 9; w++) {
    wardStats[w] = { total: 0, voted: 0, booths: { A: { total: 0, voted: 0 }, B: { total: 0, voted: 0 } } };
  }

  voters.forEach((v) => {
    const w = Number(v.ward_no) || 1;
    const b = v.booth_no === 'B' ? 'B' : 'A';
    if (!wardStats[w]) {
      wardStats[w] = { total: 0, voted: 0, booths: { A: { total: 0, voted: 0 }, B: { total: 0, voted: 0 } } };
    }
    wardStats[w].total += 1;
    if (v.voted_status) wardStats[w].voted += 1;

    wardStats[w].booths[b].total += 1;
    if (v.voted_status) wardStats[w].booths[b].voted += 1;
  });

  return (
    <Box sx={{ pb: { xs: 9, md: 4 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
            लाइभ बुथ मतदान दर (Live Polling Turnout %)
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            {settings.municipality_name || 'हेलम्बु गाउँपालिका'} - वास्तविक समय प्रगति बार
          </Typography>
        </Box>
        <Button
          variant="outlined"
          size="small"
          startIcon={<SyncIcon />}
          onClick={onRefreshVoters}
          sx={{ borderRadius: 2, borderColor: '#cbd5e1', fontWeight: 700 }}
        >
          ताजा गर्नुहोस्
        </Button>
      </Box>

      {/* Main Overall Progress Hero Card */}
      <Card
        sx={{
          mb: 3,
          borderRadius: 3.5,
          border: `1.5px solid ${partyConfig.cardBorder}`,
          bgcolor: '#ffffff',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <Avatar sx={{ bgcolor: partyConfig.primary, width: 42, height: 42 }}>
                <HowToVoteIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  समग्र मतदान प्रतिशत (Turnout %)
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  कुल {totalVoters} मतदाता मध्ये
                </Typography>
              </Box>
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 900, color: partyConfig.primary }}>
              {turnoutPercent}%
            </Typography>
          </Box>

          {/* Large Animated Linear Progress Bar */}
          <LinearProgress
            variant="determinate"
            value={Number(turnoutPercent)}
            sx={{
              height: 14,
              borderRadius: 7,
              bgcolor: '#e2e8f0',
              mb: 2.5,
              '& .MuiLinearProgress-bar': {
                background: partyConfig.gradient || partyConfig.primary,
                borderRadius: 7
              }
            }}
          />

          {/* Counts pill grid */}
          <Grid container spacing={2}>
            <Grid item xs={6} sm={4}>
              <Box sx={{ p: 1.5, bgcolor: '#f0fdf4', borderRadius: 2.5, border: '1px solid #bbf7d0' }}>
                <Typography variant="caption" sx={{ color: '#166534', fontWeight: 700 }}>
                  खसेको मत (Voted ✓)
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#166534', mt: 0.3 }}>
                  {votedCount}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Box sx={{ p: 1.5, bgcolor: '#fff1f2', borderRadius: 2.5, border: '1px solid #fecaca' }}>
                <Typography variant="caption" sx={{ color: '#9f1239', fontWeight: 700 }}>
                  खस्न बाँकी (Remaining ✕)
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#9f1239', mt: 0.3 }}>
                  {remainingCount}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2.5, border: '1px solid #e2e8f0' }}>
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700 }}>
                  कुल नामावली (Registered)
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.3 }}>
                  {totalVoters}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Ward-by-Ward Breakdown */}
      <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
        वडागत विस्तृत विवरण (Wards 1 - 9)
      </Typography>

      <Grid container spacing={2}>
        {Object.entries(wardStats).map(([ward, stat]) => {
          const wardPct = stat.total > 0 ? ((stat.voted / stat.total) * 100).toFixed(1) : 0;
          const aPct = stat.booths.A.total > 0 ? Math.round((stat.booths.A.voted / stat.booths.A.total) * 100) : 0;
          const bPct = stat.booths.B.total > 0 ? Math.round((stat.booths.B.voted / stat.booths.B.total) * 100) : 0;

          return (
            <Grid item xs={12} md={6} key={ward}>
              <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={`वडा नं. ${ward}`}
                      sx={{ bgcolor: partyConfig.accentBg, color: partyConfig.primary, fontWeight: 800 }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b' }}>
                      {stat.voted} / {stat.total} मत
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: partyConfig.primary }}>
                    {wardPct}%
                  </Typography>
                </Box>

                <LinearProgress
                  variant="determinate"
                  value={Number(wardPct)}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: '#f1f5f9',
                    mb: 2,
                    '& .MuiLinearProgress-bar': { bgcolor: partyConfig.primary }
                  }}
                />

                {/* Booth level mini bars */}
                <Box sx={{ bgcolor: '#f8fafc', p: 1.5, borderRadius: 2, border: '1px solid #f1f5f9' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 1 }}>
                    मतदान केन्द्र (बुथ) स्थिति:
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ color: '#334155', fontWeight: 600 }}>
                      बुथ क (A): {stat.booths.A.voted} / {stat.booths.A.total} ({aPct}%)
                    </Typography>
                    <Box sx={{ width: 100 }}>
                      <LinearProgress variant="determinate" value={aPct} sx={{ height: 5, borderRadius: 2.5 }} />
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#334155', fontWeight: 600 }}>
                      बुथ ख (B): {stat.booths.B.voted} / {stat.booths.B.total} ({bPct}%)
                    </Typography>
                    <Box sx={{ width: 100 }}>
                      <LinearProgress variant="determinate" value={bPct} sx={{ height: 5, borderRadius: 2.5 }} color="secondary" />
                    </Box>
                  </Box>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
