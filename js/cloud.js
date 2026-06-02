import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL || '';
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let client = null;

export function isCloudEnabled() {
  const placeholders = ['', 'TU_URL', 'TU_CLAVE', 'your-project.supabase.co'];
  return Boolean(
    url &&
      anon &&
      !placeholders.includes(url) &&
      !placeholders.includes(anon)
  );
}

export function getClient() {
  if (!isCloudEnabled()) return null;
  if (!client) client = createClient(url, anon);
  return client;
}

export async function fetchRemoteState() {
  const sb = getClient();
  if (!sb) return null;

  const { data, error } = await sb.from('gymnastica_store').select('id, data');
  if (error) throw error;

  const rows = data || [];
  const db = rows.find((r) => r.id === 'db')?.data;
  const usuarios = rows.find((r) => r.id === 'usuarios')?.data;
  return { db, usuarios };
}

export async function pushRemoteState(db, usuarios) {
  const sb = getClient();
  if (!sb) return false;

  const now = new Date().toISOString();
  const { error } = await sb.from('gymnastica_store').upsert([
    { id: 'db', data: db, updated_at: now },
    { id: 'usuarios', data: usuarios, updated_at: now },
  ]);
  if (error) throw error;
  return true;
}
