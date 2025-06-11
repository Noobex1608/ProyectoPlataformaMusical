// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pxqvdtlsyvwckxmluzdj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsYm52aml2ZmFldmJ6ZW51bGxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMzg4ODgsImV4cCI6MjA2NDkxNDg4OH0.hOeNwKnNCX6zLBa3rbIs8wEItt88t0f4YwW7WJevcdA'

export const supabase = createClient(supabaseUrl, supabaseKey)
