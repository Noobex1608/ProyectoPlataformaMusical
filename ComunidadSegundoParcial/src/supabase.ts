import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://eyewdvpiokrfqspbjdbf.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5ZXdkdnBpb2tyZnFzcGJqZGJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwNjQ3OTQsImV4cCI6MjA2NjY0MDc5NH0.XEb-rCXA5M63nUdnx2N_BFidDK04cl6ZXzYniwnDSgw";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);