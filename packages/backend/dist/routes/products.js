"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productsRouter = void 0;
const express_1 = require("express");
const supabase_1 = require("../db/supabase");
const router = (0, express_1.Router)();
exports.productsRouter = router;
// Get all products
router.get('/', async (_req, res) => {
    try {
        const supabase = (0, supabase_1.getSupabase)();
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('is_active', true)
            .order('name');
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
// Get product by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const supabase = (0, supabase_1.getSupabase)();
        const { data, error } = await supabase
            .from('products')
            .select('*')
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
// Create product
router.post('/', async (req, res) => {
    try {
        const supabase = (0, supabase_1.getSupabase)();
        const { data, error } = await supabase
            .from('products')
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
// Update product
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const supabase = (0, supabase_1.getSupabase)();
        const updateData = req.body;
        const { data, error } = await supabase
            .from('products')
            // @ts-expect-error - Supabase client lacks database schema types
            .update(updateData)
            .eq('id', id)
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
// Delete product
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const supabase = (0, supabase_1.getSupabase)();
        const { error } = await supabase
            .from('products')
            // @ts-expect-error - Supabase client lacks database schema types
            .update({ is_active: false })
            .eq('id', id);
        if (error)
            throw error;
        res.json({
            success: true,
            message: 'Product deleted'
        });
    }
    catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
});
//# sourceMappingURL=products.js.map