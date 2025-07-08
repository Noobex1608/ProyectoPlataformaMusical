// Script para debuggear variables de entorno en ArtistaSegundoParcial
export function debugEnvironment() {
  console.log('=== ENV DEBUG - ArtistaSegundoParcial ===');
  console.log('import.meta.env:', import.meta.env);
  console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
  console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY);
  console.log('NODE_ENV:', import.meta.env.NODE_ENV);
  console.log('MODE:', import.meta.env.MODE);
  console.log('DEV:', import.meta.env.DEV);
  console.log('PROD:', import.meta.env.PROD);
  console.log('========================================');
  
  // Test directo con valores hardcoded
  const hardcodedUrl = 'https://eyewdvpiokrfqspbjdbf.supabase.co';
  const hardcodedKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5ZXdkdnBpb2tyZnFzcGJqZGJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwNjQ3OTQsImV4cCI6MjA2NjY0MDc5NH0.XEb-rCXA5M63nUdnx2N_BFidDK04cl6ZXzYniwnDSgw';
  
  console.log('=== HARDCODED VALUES TEST ===');
  console.log('Hardcoded URL:', hardcodedUrl);
  console.log('Hardcoded Key:', hardcodedKey);
  console.log('==============================');
  
  return {
    envUrl: import.meta.env.VITE_SUPABASE_URL,
    envKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    hardcodedUrl,
    hardcodedKey
  };
}
