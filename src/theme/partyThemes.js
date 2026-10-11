// Official Brand Palette & Design Tokens for Nepal's Political Parties
export const PARTY_THEMES = {
  NC: {
    id: 'NC',
    name: 'नेपाली काँग्रेस',
    nameEn: 'Nepali Congress',
    shortCode: 'रुख',
    symbol: '🌳',
    website: 'https://nepalicongress.org',
    primary: '#1d4ed8',        // Official Royal Blue
    primaryDark: '#1e40af',
    primaryLight: '#3b82f6',
    secondary: '#dc2626',      // Crimson Four Stars accent
    accentBg: '#eff6ff',
    badgeColor: '#1e40af',
    badgeBg: '#dbeafe',
    gradient: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
    headerBg: '#1e3a8a',
    cardBorder: '#bfdbfe'
  },
  UML: {
    id: 'UML',
    name: 'नेकपा (एमाले)',
    nameEn: 'CPN (UML)',
    shortCode: 'सूर्य',
    symbol: '☀️',
    website: 'https://cpnuml.org',
    primary: '#dc2626',        // Communist Red
    primaryDark: '#b91c1c',
    primaryLight: '#ef4444',
    secondary: '#f59e0b',      // Sun Gold
    accentBg: '#fef2f2',
    badgeColor: '#991b1b',
    badgeBg: '#fee2e2',
    gradient: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
    headerBg: '#991b1b',
    cardBorder: '#fecaca'
  },
  RSP: {
    id: 'RSP',
    name: 'राष्ट्रिय स्वतन्त्र पार्टी',
    nameEn: 'Rastriya Swatantra Party (RSP)',
    shortCode: 'घण्टी',
    symbol: '🔔',
    website: 'https://rspnepal.org',
    primary: '#0284c7',        // Signature Bell Blue
    primaryDark: '#0369a1',
    primaryLight: '#38bdf8',
    secondary: '#eab308',      // Bell Yellow / Gold
    accentBg: '#f0f9ff',
    badgeColor: '#075985',
    badgeBg: '#e0f2fe',
    gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
    headerBg: '#0c4a6e',
    cardBorder: '#bae6fd'
  },
  MAOIST: {
    id: 'MAOIST',
    name: 'नेकपा (माओवादी केन्द्र)',
    nameEn: 'CPN (Maoist Centre)',
    shortCode: 'हँसिया-हथौडा',
    symbol: '☭',
    website: 'https://cpnmaoistcentre.org',
    primary: '#991b1b',        // Revolutionary Deep Red
    primaryDark: '#7f1d1d',
    primaryLight: '#b91c1c',
    secondary: '#fbbf24',      // Golden Star & Hammer
    accentBg: '#fef2f2',
    badgeColor: '#7f1d1d',
    badgeBg: '#fee2e2',
    gradient: 'linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%)',
    headerBg: '#450a0a',
    cardBorder: '#fca5a5'
  },
  RPP: {
    id: 'RPP',
    name: 'राष्ट्रिय प्रजातन्त्र पार्टी',
    nameEn: 'Rastriya Prajatantra Party (RPP)',
    shortCode: 'हलो / गाई',
    symbol: '🌾',
    website: 'https://rpp.org.np',
    primary: '#d97706',        // Saffron Amber
    primaryDark: '#b45309',
    primaryLight: '#f59e0b',
    secondary: '#15803d',      // Forest Green
    accentBg: '#fffbeb',
    badgeColor: '#92400e',
    badgeBg: '#fef3c7',
    gradient: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
    headerBg: '#78350f',
    cardBorder: '#fde68a'
  },
  INDEPENDENT: {
    id: 'INDEPENDENT',
    name: 'स्वतन्त्र / साझा मुख्यालय',
    nameEn: 'Independent / Neutral HQ',
    shortCode: 'स्वतन्त्र',
    symbol: '⚖️',
    website: '',
    primary: '#0f172a',        // Midnight Slate
    primaryDark: '#020617',
    primaryLight: '#334155',
    secondary: '#4f46e5',      // Indigo Accent
    accentBg: '#f8fafc',
    badgeColor: '#1e293b',
    badgeBg: '#e2e8f0',
    gradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    headerBg: '#0f172a',
    cardBorder: '#cbd5e1'
  }
};

export const DEFAULT_PARTY = 'INDEPENDENT';

export function getPartyConfig(partyId) {
  if (!partyId) return PARTY_THEMES.INDEPENDENT;
  const key = String(partyId).toUpperCase().trim();
  if (PARTY_THEMES[key]) return PARTY_THEMES[key];
  if (key.includes('CONGRESS') || key.includes('रुख') || key.includes('NC')) return PARTY_THEMES.NC;
  if (key.includes('UML') || key.includes('एमाले') || key.includes('सूर्य')) return PARTY_THEMES.UML;
  if (key.includes('RSP') || key.includes('घन्टी') || key.includes('घण्टी')) return PARTY_THEMES.RSP;
  if (key.includes('MAOIST') || key.includes('माओवादी')) return PARTY_THEMES.MAOIST;
  if (key.includes('RPP') || key.includes('राप्रपा') || key.includes('हलो')) return PARTY_THEMES.RPP;
  return PARTY_THEMES.INDEPENDENT;
}
