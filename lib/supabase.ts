import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase() {
  // Create client lazily on first use
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        `Missing Supabase environment variables: ` +
        `URL=${supabaseUrl ? 'SET' : 'MISSING'}, ` +
        `KEY=${supabaseAnonKey ? 'SET' : 'MISSING'}`
      );
    }

    console.log('Creating Supabase client with URL:', supabaseUrl);
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }

  return supabaseInstance;
}

// For backwards compatibility, export as default constant that calls the getter
export const supabase = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    return (getSupabase() as any)[prop];
  }
});
