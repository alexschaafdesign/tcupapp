import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = process.env.NODE_ENV === 'production' 
  ? path.resolve(__dirname, '../.env.production')
  : path.resolve(__dirname, '../.env.development');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;  // This will be different from your anon key

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase configuration:', {
        url: !!supabaseUrl,
        serviceKey: !!supabaseServiceKey
    });
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Add connection test
const { data, error } = await supabase.from('forum_messages').select('count');
if (error) {
  console.error('Supabase connection error:', error);
}
export default supabase;