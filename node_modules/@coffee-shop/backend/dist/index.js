"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./config/env");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const products_1 = require("./routes/products");
const invoices_1 = require("./routes/invoices");
const staff_1 = require("./routes/staff");
const tables_1 = require("./routes/tables");
const auth_1 = require("./routes/auth");
const shiftReports_1 = __importDefault(require("./routes/shiftReports"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/auth', auth_1.authRouter);
app.use('/api/products', products_1.productsRouter);
app.use('/api/invoices', invoices_1.invoicesRouter);
app.use('/api/staff', staff_1.staffRouter);
app.use('/api/tables', tables_1.tablesRouter);
app.use('/api/shift-reports', shiftReports_1.default);
// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map