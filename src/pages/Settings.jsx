import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Divider,
  Chip,
  Avatar,
  Link
} from '@mui/material';
import PaletteIcon from '@mui/icons-material/Palette';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import StorageIcon from '@mui/icons-material/Storage';
import { useAuth } from '../context/AuthContext';
import { usePartyTheme } from '../context/PartyThemeContext';

export default function Settings() {
  const { settings } = useAuth();
  const { currentParty, selectParty, allParties, partyConfig } = usePartyTheme();

  return (
    <Box sx={{ pb: { xs: 9, md: 4 } }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
          पार्टी ब्रान्डिङ तथा प्रणाली सेटिङ
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b' }}>
          नेपालका प्रमुख राजनीतिक दलहरूको आधिकारिक रङ, प्रतीक र प्रणाली कन्फिगरेसन
        </Typography>
      </Box>

      {/* Party Selection Section */}
      <Card sx={{ mb: 3, borderRadius: 3.5, border: '1px solid #e2e8f0', p: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 2 }}>
          <Avatar sx={{ bgcolor: partyConfig.primary, width: 36, height: 36 }}>
            <PaletteIcon sx={{ fontSize: 20 }} />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
              आधिकारिक पार्टी रङ तथा थिम छान्नुहोस्
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              छनोट गर्दा सम्पूर्ण प्रणाली (हेडर, बटन, ब्याच र प्रगति बार) सोही दलको आधिकारिक रङमा बदलिनेछ।
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2}>
          {Object.values(allParties).map((party) => {
            const isSelected = currentParty === party.id;
            return (
              <Grid item xs={12} sm={6} md={4} key={party.id}>
                <Card
                  onClick={() => selectParty(party.id)}
                  sx={{
                    borderRadius: 3,
                    p: 2,
                    cursor: 'pointer',
                    border: isSelected ? `2.5px solid ${party.primary}` : '1.5px solid #e2e8f0',
                    bgcolor: isSelected ? party.accentBg : '#ffffff',
                    boxShadow: isSelected ? `0 6px 18px ${party.primary}22` : 'none',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.06)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 2.5,
                          background: party.gradient || party.primary,
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 22,
                          boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
                        }}
                      >
                        {party.symbol}
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                          {party.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          {party.nameEn}
                        </Typography>
                      </Box>
                    </Box>

                    {isSelected && (
                      <CheckCircleIcon sx={{ color: party.primary, fontSize: 24 }} />
                    )}
                  </Box>

                  {/* Swatches */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5, pt: 1, borderTop: '1px solid #f1f5f9' }}>
                    <Box sx={{ display: 'flex', gap: 0.6 }}>
                      <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: party.primary, border: '1px solid rgba(0,0,0,0.1)' }} title="Primary Color" />
                      <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: party.secondary, border: '1px solid rgba(0,0,0,0.1)' }} title="Secondary Color" />
                    </Box>

                    {party.website && (
                      <Link
                        href={party.website}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        sx={{
                          ml: 'auto',
                          fontSize: '0.72rem',
                          color: party.primary,
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.4,
                          textDecoration: 'none'
                        }}
                      >
                        वेबसाइट <OpenInNewIcon sx={{ fontSize: 13 }} />
                      </Link>
                    )}
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Card>

      {/* Supabase Connection Status Card */}
      <Card sx={{ borderRadius: 3.5, border: '1px solid #e2e8f0', p: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 2 }}>
          <Avatar sx={{ bgcolor: '#10b981', width: 36, height: 36 }}>
            <StorageIcon sx={{ fontSize: 20 }} />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
              Supabase क्लाउड डाटाबेस स्थिति
            </Typography>
            <Typography variant="caption" sx={{ color: '#059669', fontWeight: 700 }}>
              ● प्रत्यक्ष जडान सक्रिय (Live Cloud Connected)
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Supabase URL"
              size="small"
              fullWidth
              disabled
              value="https://bmhbuypigsfhvqxxoyoh.supabase.co"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="सञ्चालन पालिका (Municipality)"
              size="small"
              fullWidth
              disabled
              value={settings.municipality_name || 'Helambu Rural Municipality'}
            />
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
}
