import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Key in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConnection() {
  console.log('Checking Supabase connection...');
  console.log('URL:', supabaseUrl);
  
  // Try to fetch time or query ai_consultations table
  const { data, error } = await supabase.from('ai_consultations').select('id').limit(1);
  
  if (error) {
    console.error('Error connecting or querying ai_consultations:', error.message);
    if (error.code === '42P01') {
      console.log('💡 Connection successful! But the table "ai_consultations" does not exist yet. You need to run the SQL script in Supabase.');
    } else {
      console.log('💡 Check if your RLS policies are set up or if the credentials are correct.');
    }
  } else {
    console.log('✅ Connection successful! "ai_consultations" table exists and is accessible.');
    console.log('Data:', data);
  }
}

checkConnection();
