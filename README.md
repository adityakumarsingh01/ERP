# FundsRoom Mini ERP + CRM Operations Portal

## Overview
This is a comprehensive full-stack Mini ERP and CRM portal built for a wholesale/distribution company. It manages customers, products, inventory, and a complete Sales Challan workflow with strict stock management business logic.

## Features
- **Role-Based Access Control**: ADMIN, SALES, WAREHOUSE, ACCOUNTS roles with specific permissions.
- **Customer CRM**: Manage customers, contact details, and follow-up history.
- **Product & Inventory**: Track products, SKUs, pricing, and view low-stock alerts on the dashboard.
- **Sales Challans**: Create draft challans and confirm them.
- **Stock Validation Transaction**: Confirming a challan executes a database transaction that verifies stock, rejects if insufficient, reduces stock, creates a stock movement log, and updates the challan status.

## Technology Stack
- **Frontend**: React, Vite, TypeScript, Tailwind CSS, React Router, React Query, Axios, Lucide Icons.
- **Backend**: Node.js, Express.js, TypeScript, Prisma ORM, JSON Web Tokens (JWT), bcrypt.
- **Database**: SQLite (Configured to mock PostgreSQL for local offline testing).

## Local Setup

### 1. Prerequisites
- Node.js (v18+)
- npm

### 2. Backend Setup
```bash
cd backend
npm install
npx prisma db push
npx prisma db seed
npm run dev
```
The backend will run on `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend will run on `http://localhost:5173`.

## Demo Credentials
The database seed script automatically provisions these accounts:
- **Admin**: admin@fundsroom.com / Admin@123
- **Sales**: sales@fundsroom.com / Sales@123
- **Warehouse**: warehouse@fundsroom.com / Warehouse@123
- **Accounts**: accounts@fundsroom.com / Accounts@123

## Known Limitations
- The database is currently running on SQLite for immediate local execution without external dependencies. In production, change the Prisma provider to `postgresql` and update the `DATABASE_URL`.
- Product snapshots in Challan items are implemented in the API but the full historical view UI is simplified.
- Cancel functionality for Challans exists in the API but is omitted from the UI to prioritize core flows.

## Architecture
```
User -> React (Vite) -> Axios -> Express API -> Prisma ORM -> SQLite Database
```
