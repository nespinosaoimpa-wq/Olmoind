import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const value = parts.slice(1).join('=').trim();
    if (key && !key.startsWith('#')) {
      env[key] = value;
    }
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseKey = env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  try {
    const { data: sales, error: sError } = await supabase.from('sales').select('*').limit(20);
    if (sError) throw sError;
    console.log('Fetched', sales.length, 'sales.');
    sales.forEach((s, idx) => {
      console.log(`Sale ${idx}: id=${s.id}, keys=${Object.keys(s)}, customer_info=${JSON.stringify(s.customer_info)}`);
    });
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
