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

  const { data, error } = await sb.from('gymnastica_store').select('id, data, updated_at');
  if (error) throw error;

  const rows = data || [];
  const dbRow = rows.find((r) => r.id === 'db');
  const usersRow = rows.find((r) => r.id === 'usuarios');
  return {
    db: dbRow?.data,
    usuarios: usersRow?.data,
    dbUpdatedAt: dbRow?.updated_at || null,
    usuariosUpdatedAt: usersRow?.updated_at || null,
  };
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
