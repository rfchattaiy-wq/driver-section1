import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iulrrxjildssjubifwxm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1bHJyeGppbGRzc2p1Ymlmd3htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5OTQ1MjUsImV4cCI6MjEwNzU3MDUyNX0.UAQ36RfrPYG6_vAZ8qiwu5K7JaM_uSLGqoHL7xQHkMg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
