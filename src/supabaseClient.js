import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://bmhbuypigsfhvqxxoyoh.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_1J2kZOka9zrcaHkcGAD5XA_moqVXj2P';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

// 1. Fetch system settings
export async function getSystemSettings() {
  const { data, error } = await supabase.from('system_settings').select('*');
  if (error) {
    console.warn('Supabase getSystemSettings error:', error);
    return [];
  }
  return data || [];
}

// 2. Fetch all users (Admins, Coordinators, Field Workers)
export async function getUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.warn('Supabase getUsers error:', error);
    return [];
  }
  return data || [];
}

// 3. Upsert a user
export async function upsertUser(user) {
  const payload = {
    user_id: user.user_id,
    name: user.name,
    phone: user.phone,
    role: user.role || 'Field Worker',
    pin: user.pin || '1234',
    ward: user.ward || 'All',
    tole: user.tole || '',
    booth_no: user.booth_no || '',
    active: user.active !== false,
    notes: user.notes || ''
  };

  const { data, error } = await supabase
    .from('users')
    .upsert(payload, { onConflict: 'user_id' })
    .select();

  if (error) throw error;
  return data;
}

// 4. Fetch voters (with optional filters)
export async function getVoters(wardNo = null) {
  let query = supabase.from('voters').select('*').order('voter_id', { ascending: true });
  if (wardNo && wardNo !== 'All') {
    query = query.eq('ward_no', Number(wardNo));
  }
  const { data, error } = await query;
  if (error) {
    console.warn('Supabase getVoters error:', error);
    return [];
  }
  return data || [];
}

// 5. 1-Tap Polling Status Toggle ( भोट खस्यो ✓ / बाँकी ✕ )
export async function toggleVoterPollingStatus(voterId, isVoted) {
  const now = isVoted ? new Date().toISOString() : null;
  const { data, error } = await supabase
    .from('voters')
    .update({
      voted_status: isVoted,
      voted_time: now,
      updated_at: new Date().toISOString()
    })
    .eq('voter_id', voterId)
    .select();

  if (error) throw error;
  return data;
}

// 6. Upsert voter details
export async function upsertVoter(voter) {
  const payload = {
    voter_id: voter.voter_id,
    serial_no: voter.serial_no || '',
    full_name: voter.full_name,
    phone: voter.phone || '',
    gender: voter.gender || '',
    age_group: voter.age_group || '',
    ward_no: Number(voter.ward_no) || 1,
    tole: voter.tole || '',
    booth_no: voter.booth_no || 'A',
    party_leaning: voter.party_leaning || 'Undecided',
    sentiment: voter.sentiment || 'swing',
    address: voter.address || '',
    notes: typeof voter.notes === 'string' ? voter.notes : JSON.stringify(voter.notes || {}),
    voted_status: !!voter.voted_status,
    voted_time: voter.voted_time || null
  };

  const { data, error } = await supabase
    .from('voters')
    .upsert(payload, { onConflict: 'voter_id' })
    .select();

  if (error) throw error;
  return data;
}
