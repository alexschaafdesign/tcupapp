// lib/supabase.js
import { createClient } from '@supabase/supabase-js';

// Use environment variables already loaded by loadEnv.js (or server.js)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration:', {
    supabaseUrl: !!supabaseUrl,
    supabaseServiceKey: !!supabaseServiceKey,
  });
}

// Create the Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Optional: Test the Supabase connection
// (This IIFE uses top-level await; if your Node version supports it, this is fine.)
(async () => {
  try {
    // Replace 'forum_messages' and 'count' with a table/column that exists in your DB,
    // or remove this block if you don't want to test the connection here.
    const { data, error } = await supabase.from('forum_messages').select('count');
    if (error) {
      console.error('Supabase connection test error:', error);
    } else {
      console.log('Supabase connection test succeeded:', data);
    }
  } catch (err) {
    console.error('Supabase connection test failed:', err);
  }
})();

export default supabase;