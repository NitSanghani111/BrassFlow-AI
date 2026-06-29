# AI Brass ERP - Phase 1 Foundation & System Status Report

This document serves as the absolute source of truth for the implemented modules, database schema, architecture patterns, and next steps for the **AI Brass ERP** platform. It has been formatted so that it can be easily shared with other LLM/GPT sessions to resume work or verify features.

---

## 1. Executive Summary & Tech Stack
The foundation of the Brass ERP has been successfully established as a monorepo containing a TypeScript Express Backend and a React Vite Frontend. 

### **Technology Stack**
*   **Backend**: Node.js, Express, TypeScript, Prisma ORM
*   **Database**: PostgreSQL 15 (relational core), Redis 7 (caching/sessions)
*   **Frontend**: React (Vite), Vanilla CSS (glassmorphic dark design system), Axios, Lucide Icons
*   **DevOps**: Docker, Docker-compose (orchestrating Postgres and Redis)
*   **Libraries**: `pdfkit` (GST Invoice PDFs), `multer` (File upload for OCR), `zod` (API contract validation)

---

## 2. Completed Modules & Features

### **Module 1: Authentication & Authorization (RBAC)**
*   **Implementation**: JWT Access Tokens (short-lived) + Refresh Tokens (stored in DB/Redis).
*   **Roles**: Admin, Accountant, Production Manager, Purchase Manager, Warehouse Staff.
*   **End-to-End**: Middleware checks signatures, decodes roles, and restricts routes accordingly (RBAC).

### **Module 2: Customer Registry**
*   **Fields**: GSTIN and PAN validation, contact details, payment terms, outstanding balances.
*   **Validation**: Zod schema verifies GSTIN pattern (Indian standard regex) and PAN pattern.
*   **Relational Integrity**: Uses soft-delete (`isDeleted: true`) so historical invoices remain intact if a customer profile is deactivated.

### **Module 3: Supplier Registry**
*   **Fields**: Similar to Customer registry but tracks outstanding payables for metal scrap / raw material vendors.
*   **Relational Integrity**: Soft-delete pattern implemented in repository layer.

### **Module 4: Product Master & Atomic Inventory Ledger**
*   **SKU Catalog**: tracks name, HSN code, GST rate, unit (KG/PCS/TONS), purchase/selling prices, safety margins.
*   **Atomic Stock Operations**: Uses database transaction isolation (`prisma.$transaction`) to write a log to the `StockTransaction` ledger and update `currentStock` simultaneously, avoiding race conditions.

### **Module 5: GST-Compliant Invoicing & PDF Engine**
*   **Tax Calculator**: Checks customer billing state. If customer is in `Gujarat`, it calculates **CGST** (gstRate/2) and **SGST** (gstRate/2). If out-of-state, it calculates **IGST** (gstRate).
*   **Invoice Sequencing**: Auto-increments sequential invoice numbers by calendar year (e.g. `INV-2026-00001`).
*   **PDF Generation**: Draws a professional GST Tax Invoice using `pdfkit` with table grids, signature blocks, HSN summaries, and tax breakdowns, saving files to `/uploads/invoices/`.

### **Module 6: AI OCR Documents Processing**
*   **Multer File Upload**: Accepts scanned PDFs/Images, saving them to `uploads/ocr/`.
*   **Asynchronous Mock Service**: Simulates a cloud OCR scanner (Document AI / Form Recognizer) by pushing processing to the background, applying a realistic delay, and extracting metal scrap invoices (e.g., weights, rates, and GST credentials).
*   **Approve Flow**: Dashboard users can inspect extracted data and click "Approve" to register vendors and populate purchase ledgers.

### **Module 7: Automated Payment Reminders**
*   **Frequency Schedules**: Daily, Weekly, Bi-weekly, Monthly.
*   **Notification Engine**: Simulates dispatching templated payment reminders to WhatsApp, Email, or SMS with outstanding balances.
*   **Auditing**: Creates a log in the `ReminderLog` table for every transmission and auto-calculates the `nextReminderDate` based on the frequency.

### **Module 8: Dashboard KPIs & Analytics Engine**
*   **Aggregations**: Computes total outstanding receivable, monthly sales, pending invoice volumes, low-stock counts, top customers, and stock categories distribution.

---

## 3. Database Schema Design (Prisma)
The database structure is governed by `backend/prisma/schema.prisma`. Major tables:
*   `User` & `Session`: User credentials, refresh sessions, and Role enum.
*   `Customer` & `Supplier`: Billing info, soft-delete flags, and outstanding balances.
*   `Product` & `StockTransaction`: Master items and double-entry stock logs.
*   `Invoice` & `InvoiceItem`: Core billing records, tax calculations, and static PDF URLs.
*   `OCRDocument`: Scanned file references, processing status, and extracted JSON payloads.
*   `PaymentReminder` & `ReminderLog`: Schedulers and notification logs.

---

## 4. API Endpoints Map
All endpoints (except login/health) expect headers: `Authorization: Bearer <JWT_ACCESS_TOKEN>`.

### **Authentication**
*   `POST /api/auth/login` (Public) - Authenticate email/password.
*   `POST /api/auth/refresh` (Public) - Refresh access token.
*   `POST /api/auth/logout` - Revoke refresh session.

### **Customer & Supplier CRUD**
*   `GET /api/customers` | `POST /api/customers`
*   `GET /api/suppliers` | `POST /api/suppliers`

### **Products & Stock**
*   `GET /api/products` | `POST /api/products`
*   `POST /api/products/:id/adjust-stock` - Log a manual stock adjustment.

### **Invoice Ledger**
*   `GET /api/invoices` | `POST /api/invoices` (Calculates tax + decrements stock + generates PDF)
*   `GET /api/invoices/:id/pdf` - Downloads the generated tax invoice document.

### **AI OCR Module**
*   `POST /api/ocr/upload` - Upload file via form-data.
*   `GET /api/ocr` - List uploads.
*   `POST /api/ocr/:id/review` - Review and approve extracted data.

### **Payment Reminders**
*   `POST /api/reminders` - Schedule reminder.
*   `POST /api/reminders/:id/trigger` - Manually dispatch a notification now.
*   `GET /api/reminders/logs` - Audit trail list.

### **Analytics**
*   `GET /api/analytics/dashboard` - Get KPI figures, recent activities, and charts data.

---

## 5. Next Steps for Development (Phase 2)
Here is what you should focus on next:
1.  **AI Insights**: Integrate OpenAI/Gemini APIs to analyze low-stock logs and suggest purchase times.
2.  **Actual Notifications**: Replace the mock reminders with Twilio WhatsApp API keys and SMTP credentials for automated dispatch.
3.  **Real Document OCR**: Hook up a real Google Document AI processor to the OCR endpoint.
4.  **Multi-currency Support**: Allow invoicing external brass clients in USD/EUR with real-time conversion rates.
