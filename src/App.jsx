import React, { useState, useEffect } from 'react';
import { Box, Container, CircularProgress } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PartyThemeProvider, usePartyTheme } from './context/PartyThemeContext';
import Navbar from './components/Navbar';
import Sidebar, { DRAWER_WIDTH } from './components/Sidebar';
import BottomNav from './components/BottomNav';
import PinKeypadModal from './components/PinKeypadModal';
import MasterLoginModal from './components/MasterLoginModal';

import Dashboard from './pages/Dashboard';
import VoterRoster from './pages/VoterRoster';
import TurnoutStats from './pages/TurnoutStats';
import UserManagement from './pages/UserManagement';
import Settings from './pages/Settings';

import { getVoters } from './supabaseClient';

function MainApp() {
  const { currentUser } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  // Modals state
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [targetPinUser, setTargetPinUser] = useState(null);
  const [masterModalOpen, setMasterModalOpen] = useState(false);

  // Live voters state
  const [voters, setVoters] = useState([]);
  const [loadingVoters, setLoadingVoters] = useState(true);

  // Fetch voters from Supabase
  const loadVoters = async () => {
    try {
      setLoadingVoters(true);
      const data = await getVoters();
      setVoters(data);
    } catch (err) {
      console.error('Failed to load voters from Supabase:', err);
    } finally {
      setLoadingVoters(false);
    }
  };

  useEffect(() => {
    loadVoters();

    // Check URL parameters for direct worker login link
    const params = new URLSearchParams(window.location.search);
    const workerParam = params.get('worker') || params.get('w');
    if (workerParam && !currentUser) {
      setTargetPinUser(workerParam);
      setPinModalOpen(true);
    }
    const adminParam = params.get('admin');
    if (adminParam && !currentUser) {
      setMasterModalOpen(true);
    }
  }, []);

  const handleOpenPinForUser = (userId) => {
    setTargetPinUser(userId);
    setPinModalOpen(true);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {/* Sidebar Navigation */}
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
      />

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh'
        }}
      >
        {/* Top Navbar */}
        <Navbar
          onMobileMenuToggle={() => setMobileOpen(!mobileOpen)}
          onOpenPinModal={() => {
            setTargetPinUser(null);
            setPinModalOpen(true);
          }}
          onOpenMasterModal={() => setMasterModalOpen(true)}
        />

        {/* Viewport Content */}
        <Container maxWidth="xl" sx={{ flexGrow: 1, p: { xs: 1.5, sm: 3 } }}>
          {loadingVoters && voters.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {currentTab === 'dashboard' && (
                <Dashboard
                  voters={voters}
                  onNavigate={(tab) => setCurrentTab(tab)}
                  onOpenPinModal={() => setPinModalOpen(true)}
                  onRefreshVoters={loadVoters}
                />
              )}
              {currentTab === 'voters' && <VoterRoster voters={voters} onRefreshVoters={loadVoters} />}
              {currentTab === 'turnout' && <TurnoutStats voters={voters} onRefreshVoters={loadVoters} />}
              {currentTab === 'users' && <UserManagement onOpenPinModalForUser={handleOpenPinForUser} />}
              {currentTab === 'settings' && <Settings />}
            </>
          )}
        </Container>

        {/* Mobile 1-Handed Bottom Navigation */}
        <BottomNav currentTab={currentTab} onTabChange={(tab) => setCurrentTab(tab)} />
      </Box>

      {/* 4-Digit Touch PIN Keypad Modal */}
      <PinKeypadModal
        open={pinModalOpen}
        onClose={() => setPinModalOpen(false)}
        defaultUserId={targetPinUser}
        onAdminSwitch={() => {
          setPinModalOpen(false);
          setMasterModalOpen(true);
        }}
      />

      {/* Palika Admin & Master HQ Modal */}
      <MasterLoginModal
        open={masterModalOpen}
        onClose={() => setMasterModalOpen(false)}
        onSwitchToPin={() => {
          setMasterModalOpen(false);
          setPinModalOpen(true);
        }}
      />
    </Box>
  );
}

export default function App() {
  return (
    <PartyThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </PartyThemeProvider>
  );
}
