"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoicesRouter = void 0;
const express_1 = require("express");
const supabase_1 = require("../db/supabase");
const router = (0, express_1.Router)();
exports.invoicesRouter = router;
// Get all invoices with filters
router.get('/', async (req, res) => {
    try {
        const { staffId, startDate, endDate, status } = req.query;
        const supabase = (0, supabase_1.getSupabase)();
        let query = supabase
            .from('invoices')
            .select(`
        *,
        items:invoice_items(*, product:products(name))
      `)
            .order('created_at', { ascending: false });
        if (staffId)
            query = query.eq('staff_id', staffId);
        if (status)
            query = query.eq('status', status);
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
// Get invoice by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const supabase = (0, supabase_1.getSupabase)();
        const { data, error } = await supabase
            .from('invoices')
            .select(`
        *,
        items:invoice_items(*, product:products(name))
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
// Create invoice
router.post('/', async (req, res) => {
    try {
        const { invoice, items } = req.body;
        const supabase = (0, supabase_1.getSupabase)();
        // Create invoice
        const { data: invoiceData, error: invoiceError } = await supabase
            .from('invoices')
            .insert(invoice)
            .select()
            .single();
        if (invoiceError)
            throw invoiceError;
        // Create invoice items
        const itemsWithInvoiceId = items.map((item) => ({
            ...item,
            invoice_id: invoiceData.id
        }));
        const { error: itemsError } = await supabase
            .from('invoice_items')
            .insert(itemsWithInvoiceId);
        if (itemsError)
            throw itemsError;
        // Update table status
        const supabase2 = (0, supabase_1.getSupabase)();
        await supabase2
            .from('cafe_tables')
            .update({ is_occupied: true })
            .eq('id', invoice.table_id);
        res.json({
            success: true,
            data: invoiceData
        });
    }
    catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
});
// Update invoice (payment)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, payment_method, paid_at } = req.body;
        const supabase = (0, supabase_1.getSupabase)();
        const { data, error } = await supabase
            .from('invoices')
            .update({ status, payment_method, paid_at })
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw error;
        // If paid, free up the table
        if (status === 'paid') {
            const supabase2 = (0, supabase_1.getSupabase)();
            await supabase2
                .from('cafe_tables')
                .update({ is_occupied: false })
                .eq('id', data.table_id);
        }
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
// Get revenue summary
router.get('/summary/revenue', async (req, res) => {
    try {
        const { startDate, endDate, staffId } = req.query;
        const supabase = (0, supabase_1.getSupabase)();
        let query = supabase
            .from('invoices')
            .select('*')
            .eq('status', 'paid');
        if (staffId)
            query = query.eq('staff_id', staffId);
        if (startDate)
            query = query.gte('created_at', startDate);
        if (endDate)
            query = query.lte('created_at', endDate);
        const { data, error } = await query;
        if (error)
            throw error;
        const cash = data
            ?.filter((i) => i.payment_method === 'cash')
            .reduce((sum, i) => sum + i.total_amount, 0) || 0;
        const transfer = data
            ?.filter((i) => i.payment_method === 'transfer')
            .reduce((sum, i) => sum + i.total_amount, 0) || 0;
        res.json({
            success: true,
            summary: {
                total: cash + transfer,
                cash,
                transfer,
                count: data?.length || 0
            }
        });
    }
    catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
});
//# sourceMappingURL=invoices.js.map