
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oanurhkxqdxtqoauiizy.supabase.co';
const supabaseKey = 'sb_publishable_DlDSyq8nUsw5D-SkGd6dyw_9rULN-gE';

export const supabase = createClient(supabaseUrl, supabaseKey);
