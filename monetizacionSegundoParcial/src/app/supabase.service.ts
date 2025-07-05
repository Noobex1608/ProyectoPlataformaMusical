// src/app/supabase.service.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://TU_PROYECTO.supabase.co';
const supabaseKey = 'TU_ANON_KEY';
export const supabase = createClient(supabaseUrl, supabaseKey);
