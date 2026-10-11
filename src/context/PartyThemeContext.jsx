import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { PARTY_THEMES, DEFAULT_PARTY, getPartyConfig } from '../theme/partyThemes';
import { createAppTheme } from '../theme';

const PartyThemeContext = createContext();

export function PartyThemeProvider({ children, initialParty = null }) {
  const [currentParty, setCurrentParty] = useState(() => {
    return initialParty || localStorage.getItem('election_app_party') || DEFAULT_PARTY;
  });

  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (initialParty) {
      setCurrentParty(initialParty);
      localStorage.setItem('election_app_party', initialParty);
    }
  }, [initialParty]);

  const selectParty = (partyId) => {
    setCurrentParty(partyId);
    localStorage.setItem('election_app_party', partyId);
  };

  const partyConfig = useMemo(() => getPartyConfig(currentParty), [currentParty]);
  const muiTheme = useMemo(() => createAppTheme(currentParty, darkMode), [currentParty, darkMode]);

  return (
    <PartyThemeContext.Provider
      value={{
        currentParty,
        selectParty,
        partyConfig,
        allParties: PARTY_THEMES,
        darkMode,
        setDarkMode
      }}
    >
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </PartyThemeContext.Provider>
  );
}

export function usePartyTheme() {
  const context = useContext(PartyThemeContext);
  if (!context) {
    throw new Error('usePartyTheme must be used within a PartyThemeProvider');
  }
  return context;
}
