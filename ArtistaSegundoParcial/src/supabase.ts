import { createClient } from "@supabase/supabase-js";

// Intentar usar variables de entorno primero, fallback a hardcoded
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://eyewdvpiokrfqspbjdbf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5ZXdkdnBpb2tyZnFzcGJqZGJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwNjQ3OTQsImV4cCI6MjA2NjY0MDc5NH0.XEb-rCXA5M63nUdnx2N_BFidDK04cl6ZXzYniwnDSgw';

// Log solo en desarrollo
if (import.meta.env.DEV) {
  console.log("🔧 Supabase config:", {
    url: supabaseUrl,
    keyLength: supabaseAnonKey?.length,
    usingFallback: !import.meta.env.VITE_SUPABASE_URL
  });
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ SUPABASE: Missing URL or key!");
  throw new Error("Supabase configuration is missing");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
