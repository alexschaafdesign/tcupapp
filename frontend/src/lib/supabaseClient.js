// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables')
    throw new Error('Missing Supabase environment variables. Please check your .env.development file.')
}

// Create the default client with anon key
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Create an authenticated client with JWT
export const getSupabaseClient = (jwt) => {
    if (!jwt) {
        console.warn('No JWT provided to getSupabaseClient')
        return supabase // Return the default client if no JWT
    }

    try {
        return createClient(supabaseUrl, supabaseAnonKey, {
            global: {
                headers: {
                    Authorization: `Bearer ${jwt}`
                }
            }
        })
    } catch (error) {
        console.error('Error creating authenticated Supabase client:', error)
        return supabase // Fall back to default client if there's an error
    }
}

// Optional: Add a helper for checking connection
export const testSupabaseConnection = async () => {
    try {
        const { data, error } = await supabase.from('forum_messages').select('id').limit(1)
        if (error) throw error
        return true
    } catch (error) {
        console.error('Supabase connection test failed:', error)
        return false
    }
}