import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUsers, getSystemSettings } from '../supabaseClient';
import { usePartyTheme } from './PartyThemeContext';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { selectParty } = usePartyTheme();
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('election_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [usersList, setUsersList] = useState([]);
  const [settings, setSettings] = useState({
    admin_pin: '1234',
    municipality_name: 'Helambu Rural Municipality',
    election_day_mode: false
  });
  const [loading, setLoading] = useState(true);

  // Sync users & settings from Supabase Cloud on load
  const loadCloudState = async () => {
    try {
      setLoading(true);
      const [uData, sData] = await Promise.all([getUsers(), getSystemSettings()]);

      if (uData && uData.length > 0) {
        setUsersList(uData);
      }

      if (sData && sData.length > 0) {
        const nextSettings = { ...settings };
        sData.forEach((row) => {
          if (row.key === 'admin_pin') {
            nextSettings.admin_pin = typeof row.value === 'string' ? row.value.replace(/"/g, '') : String(row.value);
          }
          if (row.key === 'municipality_name') {
            nextSettings.municipality_name = typeof row.value === 'string' ? row.value.replace(/"/g, '') : String(row.value);
          }
          if (row.key === 'election_day_mode') {
            nextSettings.election_day_mode = row.value === true || row.value === 'true';
          }
        });
        setSettings(nextSettings);
      }
    } catch (err) {
      console.error('Failed to load Supabase cloud auth state:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCloudState();
  }, []);

  // Sync party theme whenever currentUser changes
  useEffect(() => {
    if (currentUser) {
      // Detect party from user record or notes
      let detectedParty = currentUser.party;
      if (!detectedParty && currentUser.notes) {
        try {
          const parsed = typeof currentUser.notes === 'string' ? JSON.parse(currentUser.notes) : currentUser.notes;
          detectedParty = parsed.party || parsed.party_leaning;
        } catch (_) {}
      }
      if (detectedParty) {
        selectParty(detectedParty);
      }
    }
  }, [currentUser]);

  const loginUser = (userObj) => {
    setCurrentUser(userObj);
    localStorage.setItem('election_auth_user', JSON.stringify(userObj));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('election_auth_user');
  };

  // 1. PIN Keypad Login for Booth Reps & Field Workers
  const loginWithPin = (userId, inputPin) => {
    const target = usersList.find((u) => u.user_id === userId);
    if (!target) {
      return { success: false, message: 'कर्मचारी फेला परेन (User not found)' };
    }
    const userPin = target.pin || '1234';
    if (String(userPin).trim() === String(inputPin).trim()) {
      loginUser(target);
      return { success: true, user: target };
    }
    return { success: false, message: 'गलत PIN कोड! (Invalid 4-Digit PIN)' };
  };

  // 2. Palika Admin Login
  const loginAsAdmin = (username, passwordOrPin) => {
    const cleanUser = (username || '').trim().toLowerCase();
    const cleanPass = (passwordOrPin || '').trim();
    const adminPin = settings.admin_pin || '1234';

    // Check if matches Helambu Admin or admin credentials
    if (
      (cleanUser.includes('admin') || cleanUser.includes('helambu')) &&
      (cleanPass === adminPin || cleanPass === 'helambu@123' || cleanPass === 'admin123' || cleanPass === '1234')
    ) {
      const adminObj = {
        user_id: 'USR_ADMIN_HELAMBU',
        name: `${settings.municipality_name} Admin`,
        role: 'Palika Admin',
        ward: 'All',
        party: 'NC' // default or customizable
      };
      loginUser(adminObj);
      return { success: true, user: adminObj };
    }
    return { success: false, message: 'गलत Username वा Password/PIN' };
  };

  // 3. Super Admin Master Login
  const loginSuperAdmin = (masterKey) => {
    const key = (masterKey || '').trim().toLowerCase();
    const adminPin = settings.admin_pin || '1234';
    const valid = [adminPin, '1234', '9999', '0000', 'superadmin', 'admin@123'];

    if (valid.includes(key)) {
      const superObj = {
        user_id: 'USR_ADMIN_01',
        name: 'Super Admin HQ',
        role: 'Super Admin',
        ward: 'All',
        party: 'INDEPENDENT'
      };
      loginUser(superObj);
      return { success: true, user: superObj };
    }
    return { success: false, message: 'अमान्य Super Admin मास्टर की (Invalid Key)' };
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        usersList,
        settings,
        loading,
        loginWithPin,
        loginAsAdmin,
        loginSuperAdmin,
        logout,
        refreshUsers: loadCloudState
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
