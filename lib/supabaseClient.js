import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymkrutqomkvjasmqjnnh.supabase.co';
const supabaseAnonKey = 'sb_publishable_gtgr6xhfTqPV5wHDN7DURg_cuhjs71Z';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
