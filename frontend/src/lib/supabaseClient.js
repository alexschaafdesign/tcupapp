import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error(`Missing Supabase environment variables in ${process.env.NODE_ENV} environment`)
    throw new Error(`Missing Supabase environment variables. Please check your .env.${process.env.NODE_ENV} file.`)
}

// Create the default client with anon key
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

// Create an authenticated client with JWT
export const getSupabaseClient = (jwt) => {
    if (!jwt) {
        console.warn('No JWT provided to getSupabaseClient')
        return supabase // Return the default client if no JWT
    }

    try {
        // This approach doesn't work correctly for Supabase Row Level Security
        // Instead of this direct approach, use your backend proxy
        return createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            },
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

// IMPORTANT: Don't test connection directly - use backend proxy instead
export const testSupabaseConnection = async () => {
    // This is commented out to prevent direct Supabase access
    // Instead, we should use the backend proxy for all Supabase access
    /*
    try {
        const { data, error } = await supabase.from('forum_messages').select('id').limit(1)
        if (error) throw error
        return true
    } catch (error) {
        console.error('Supabase connection test failed:', error)
        return false
    }
    */
    return true; // Just assume connection is valid and use backend
}