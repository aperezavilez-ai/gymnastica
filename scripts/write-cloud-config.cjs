const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const envPath = path.join(root, '.env');

if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const idx = trimmed.indexOf('=');
    if (idx < 1) return;
    const key = trimmed.slice(0, idx).trim();
    let val = trimmed.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  });
}

const cfg = {
  url: process.env.VITE_SUPABASE_URL || '',
  anon: process.env.VITE_SUPABASE_ANON_KEY || '',
};

const outDir = path.join(root, 'public');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'cloud-config.json'), JSON.stringify(cfg));

const hint = cfg.url
  ? `Supabase: ${cfg.url.replace(/^(https:\/\/[^.]+).*/, '$1...')}`
  : 'Supabase: sin configurar (agrega VITE_SUPABASE_* en Vercel o .env)';
console.log(`[gymnastica] cloud-config.json → ${hint}`);
