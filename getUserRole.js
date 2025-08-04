import { supabase } from './supabaseClient';

export const getUserRole = async (email) => {
  const { data, error } = await supabase
    .from('roles')
    .select('role')
    .eq('email', email)
    .single();

  if (error || !data) {
    return 'user'; // fallback role
  }

  return data.role;
};