"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabase_1 = require("../db/supabase");
const router = (0, express_1.Router)();
// Get all shift reports with filters
router.get('/', async (req, res) => {
    try {
        const { staffId, startDate, endDate } = req.query;
        const supabase = (0, supabase_1.getSupabase)();
        let query = supabase
            .from('shift_reports')
            .select(`
        *,
        staff:staff_id(id, email)
      `)
            .order('created_at', { ascending: false });
        if (staffId)
            query = query.eq('staff_id', staffId);
        if (startDate)
            query = query.gte('created_at', startDate);
        if (endDate)
            query = query.lte('created_at', endDate);
        const { data, error } = await query;
        if (error)
            throw error;
        res.json({
            success: true,
            data
        });
    }
    catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
});
// Get shift report by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const supabase = (0, supabase_1.getSupabase)();
        const { data, error } = await supabase
            .from('shift_reports')
            .select(`
        *,
        staff:staff_id(id, email)
      `)
            .eq('id', id)
            .single();
        if (error)
            throw error;
        res.json({
            success: true,
            data
        });
    }
    catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
});
// Create new shift report
router.post('/', async (req, res) => {
    try {
        const supabase = (0, supabase_1.getSupabase)();
        const { data, error } = await supabase
            .from('shift_reports')
            .insert(req.body)
            .select()
            .single();
        if (error)
            throw error;
        res.json({
            success: true,
            data
        });
    }
    catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
});
exports.default = router;
//# sourceMappingURL=shiftReports.js.map