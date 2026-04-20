"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = exports.getSupabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
let client = null;
const getSupabase = () => {
    if (!client) {
        const supabaseUrl = process.env.SUPABASE_URL || '';
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
        if (!supabaseUrl) {
            throw new Error('SUPABASE_URL is not defined in environment variables');
        }
        client = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
    }
    return client;
};
exports.getSupabase = getSupabase;
// For backward compatibility
exports.supabase = (0, exports.getSupabase)();
//# sourceMappingURL=supabase.js.map