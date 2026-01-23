import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://butmwjdaqjpzfrbcuvyw.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1dG13amRhcWpwemZyYmN1dnl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1OTc5MzAsImV4cCI6MjA4MDE3MzkzMH0.t8BTDRxPUEtoiIbU27grjuqPnraZfmt-CyCpZVzwksA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});