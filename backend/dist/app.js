"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const customer_routes_1 = __importDefault(require("./routes/customer.routes"));
const supplier_routes_1 = __importDefault(require("./routes/supplier.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const invoice_routes_1 = __importDefault(require("./routes/invoice.routes"));
const ocr_routes_1 = __importDefault(require("./routes/ocr.routes"));
const reminder_routes_1 = __importDefault(require("./routes/reminder.routes"));
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes"));
const purchase_routes_1 = __importDefault(require("./routes/purchase.routes"));
const logger_1 = require("./utils/logger");
const app = (0, express_1.default)();
// 1. Core middlewares
app.use((0, cors_1.default)({
    origin: '*', // Adjust to specific origins (e.g., http://localhost:5173) in production
    credentials: true,
}));
app.use(express_1.default.json());
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
// 2. Request Logger Middleware
app.use((req, res, next) => {
    logger_1.logger.http(`${req.method} ${req.url}`);
    next();
});
// 3. Register endpoints
app.use('/api/auth', auth_routes_1.default);
app.use('/api/customers', customer_routes_1.default);
app.use('/api/suppliers', supplier_routes_1.default);
app.use('/api/products', product_routes_1.default);
app.use('/api/invoices', invoice_routes_1.default);
app.use('/api/ocr', ocr_routes_1.default);
app.use('/api/reminders', reminder_routes_1.default);
app.use('/api/analytics', analytics_routes_1.default);
app.use('/api/purchases', purchase_routes_1.default);
// 4. Base API test route
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'AI Brass ERP API is healthy and running.',
    });
});
// 5. Fallback 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Path not found: ${req.method} ${req.url}`,
    });
});
// 6. Global error handler
app.use((err, req, res, next) => {
    logger_1.logger.error(`Global Error: ${err.message}`);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});
exports.default = app;
