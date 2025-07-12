// src/app/supabase.client.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppbmxlaHluZnRmaGl4YnVvYm1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzOTk4MzksImV4cCI6MjA2NDk3NTgzOX0.xKMlIAUcpeZKQDpI7rfbzaToLe-zUHT5GHJW9IQQQVc';       // ← Reemplaza esto
const supabaseKey = 'eyTU-API-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppbmxlaHluZnRmaGl4YnVvYm1iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTM5OTgzOSwiZXhwIjoyMDY0OTc1ODM5fQ.7QK7uZDG1mN06oevCVcmIC90E60odPwYVQyoUCt_ENg';                          // ← Reemplaza esto también

export const supabase = createClient(supabaseUrl, supabaseKey);
