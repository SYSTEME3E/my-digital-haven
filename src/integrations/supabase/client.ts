import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://qtuytjxocivhnjvrdvfw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0dXl0anhvY2l2aG5qdnJkdmZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMzg1MjAsImV4cCI6MjA4OTYxNDUyMH0.bFNxoVnlmPf9k1Y9GlVtCQeqJHbn09zHYkUSTB70cPU";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
