import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database';
export declare const getSupabase: () => SupabaseClient<Database>;
export declare const supabase: SupabaseClient<Database, "public", "public", never, {
    PostgrestVersion: "12";
}>;
//# sourceMappingURL=supabase.d.ts.map