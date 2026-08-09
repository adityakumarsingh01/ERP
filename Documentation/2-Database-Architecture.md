# Database Architecture & Schema Design

Building an ERP requires a solid data foundation. We chose **Prisma ORM** because it provides fantastic type safety end-to-end with TypeScript and makes schema migrations a breeze. 

While we are using **SQLite** for easy local development, the schema is designed to be fully compatible with PostgreSQL.

## Core Models

### 1. `User`
Stores the login credentials and roles for employees. Passwords are securely hashed before they ever hit the database.

### 2. `Customer` & `CustomerFollowUp`
The CRM module relies on a one-to-many relationship here. A `Customer` holds the static business details (GST number, contact info, status). The `CustomerFollowUp` table logs every interaction or note made by the sales team, creating a historical timeline for that client.

### 3. `Product` & `StockMovement`
A `Product` represents an item in the warehouse, holding its current price and a `currentStock` integer. 

We don't just increment or decrement the stock blindly. Every time stock changes, a `StockMovement` record is created. This acts as an immutable audit log, showing exactly when stock went IN or OUT, how much, and why (e.g., "Sales Challan CH-2026-0001").

### 4. `Challan` & `ChallanItem`
A `Challan` (Delivery Order) is tied to a specific `Customer`. It has a `status` which dictates whether it's just a draft or a finalized order.

The `ChallanItem` model is particularly interesting. Notice that it contains fields like `productNameSnapshot` and `unitPriceSnapshot`. This is a deliberate design choice. If a product's price or name changes *next week*, we don't want historical invoices from *last month* to suddenly show the new price. By storing snapshots at the time of order creation, we preserve the exact state of the transaction forever.
