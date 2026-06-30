# AI Brass ERP - Phase 1 Completion & Run Instructions

This document summarizes the completed modules in Phase 1 of the **AI Brass ERP** project, confirms Phase 1 status, and outlines the exact steps required to run the environment.

---

## Is Phase 1 Completed?

**Yes. Phase 1 is fully completed and ready for production testing.**

All foundation ledgers, transactional safety mechanisms (isolation transactions), compliant invoicing rules (CGST/SGST/IGST), background AI OCR processors, automated notification schedules, dynamic dashboards, and modular component structures have been successfully built, validated, and compiled without any errors.

---

## Steps to Run the Project

Follow these steps to initialize and start the entire ecosystem:

### 1. Spin up Database and Caching Services
Ensure Docker is running, then start the PostgreSQL database and Redis services using Docker Compose:
```bash
docker compose up -d
```

### 2. Generate Prisma Schema Client
Generate the type-safe client based on the Prisma schema definition:
```bash
cd backend
npm run prisma:generate
```

### 3. Deploy Database Migrations
Deploy the relational database migrations to setup all schemas:
```bash
npx prisma migrate deploy
```

### 4. Seed the Database
Seed the catalog with mock products, suppliers, customers, and the default admin user:
```bash
npm run prisma:seed
```

### 5. Launch Development Servers
Navigate back to the root of the project and launch both the backend and frontend concurrently:
```bash
cd ..
npm run dev
```

*   **Vite Frontend Dev Server**: Running on `http://localhost:5173` (or `http://localhost:5174`)
*   **Express Backend API**: Running on `http://localhost:5000`

### 6. Login Credentials (Admin)
- **Email**: `admin@brassflow.in`
- **Password**: `Admin@123`

---

## Phase 1 Completed Modules & Features

### 1. Unified Authentication & Authorization (RBAC)
- Token-based JWT flow using short-lived Access Tokens and DB-stored Refresh Tokens.
- Access level control supporting roles like `Admin`, `Accountant`, `Production Manager`, `Purchase Manager`, and `Warehouse Staff`.

### 2. Verified Customer Registry
- Regulated validation for standard Indian GSTIN/PAN patterns.
- Soft-delete status flag logic to protect historical database links while inactivating customer profiles.

### 3. Supplier Registry
- Procurement tracking system monitoring purchase accounts, credit terms, and supplier payloads.

### 4. Product Catalog & Double-Entry Stock Ledger
- Comprehensive item index tracking categories, measurement units (KG, PCS, TONS), HSN codes, and safety minimum alerts.
- Thread-safe transaction isolation (`prisma.$transaction`) adjusting database stock balances while logging a historical journal entry.

### 5. Compliant Invoicing Engine
- Auto-sequencing invoice numbering.
- Automatic tax breakdown calculator: CGST + SGST for Gujarat billing state, IGST for interstate clients.
- Automated generation of GST Tax Invoices in PDF format downloadable on submission.

### 6. AI OCR Document Scanner
- Mock document recognition pipeline parsing scanned supplier invoices.
- Auto-mapping extracted vendor details, purchase items, units, rates, and tax parameters directly into the purchase order wizard.
- Easy register interface for new items suggested by the OCR analyzer.

### 7. Automated Payment Reminders
- Schedule builder supporting daily, weekly, bi-weekly, and monthly dispatches.
- Simulated delivery log audits tracking dispatches across WhatsApp, Email, and SMS channels.

### 8. Analytics & Visual Dashboard
- Interactive KPIs displaying outstanding receivables, low-stock items, monthly sales, and supplier payables.
- Split listings for recent invoices, audit action logs, active reminders, and visual category stock distributions.
