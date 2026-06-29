import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/auth.routes';
import customerRoutes from './routes/customer.routes';
import supplierRoutes from './routes/supplier.routes';
import productRoutes from './routes/product.routes';
import invoiceRoutes from './routes/invoice.routes';
import ocrRoutes from './routes/ocr.routes';
import reminderRoutes from './routes/reminder.routes';
import analyticsRoutes from './routes/analytics.routes';
import purchaseRoutes from './routes/purchase.routes';
import { logger } from './utils/logger';

const app = express();

// 1. Core middlewares
app.use(cors({
  origin: '*', // Adjust to specific origins (e.g., http://localhost:5173) in production
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// 2. Request Logger Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.http(`${req.method} ${req.url}`);
  next();
});

// 3. Register endpoints
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/products', productRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/ocr', ocrRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/purchases', purchaseRoutes);

// 4. Base API test route
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'AI Brass ERP API is healthy and running.',
  });
});

// 5. Fallback 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Path not found: ${req.method} ${req.url}`,
  });
});

// 6. Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Global Error: ${err.message}`);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

export default app;
