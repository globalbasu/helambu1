import { createTheme } from '@mui/material/styles';
import { getPartyConfig } from './partyThemes';

export function createAppTheme(partyId = 'INDEPENDENT', darkMode = false) {
  const party = getPartyConfig(partyId);

  return createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: party.primary,
        dark: party.primaryDark,
        light: party.primaryLight,
        contrastText: '#ffffff'
      },
      secondary: {
        main: party.secondary,
        contrastText: '#ffffff'
      },
      background: {
        default: darkMode ? '#0f172a' : '#f8fafc',
        paper: darkMode ? '#1e293b' : '#ffffff'
      },
      partyMeta: party
    },
    typography: {
      fontFamily: [
        'Noto Sans Devanagari',
        'Inter',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        'sans-serif'
      ].join(','),
      h5: {
        fontWeight: 700
      },
      h6: {
        fontWeight: 700
      },
      subtitle1: {
        fontWeight: 600
      },
      button: {
        textTransform: 'none',
        fontWeight: 600
      }
    },
    shape: {
      borderRadius: 12
    },
    components: {
      MuiButton: {
        defaultProps: {
          disableElevation: true
        },
        styleOverrides: {
          root: {
            borderRadius: 10,
            padding: '8px 18px',
            fontSize: '0.9rem'
          },
          containedPrimary: {
            background: party.gradient || party.primary,
            '&:hover': {
              filter: 'brightness(1.08)'
            }
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
          }
        }
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: party.headerBg || party.primaryDark,
            boxShadow: '0 2px 12px rgba(0,0,0,0.1)'
          }
        }
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            borderRadius: 8
          }
        }
      },
      MuiBottomNavigation: {
        styleOverrides: {
          root: {
            height: 64,
            backgroundColor: darkMode ? '#1e293b' : '#ffffff',
            borderTop: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`
          }
        }
      }
    }
  });
}
