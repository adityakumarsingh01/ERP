# The Sales Challan Workflow & Transaction Logic

The most critical part of this entire ERP system is how it handles inventory allocation. If a sales rep creates a challan, we need to ensure that the warehouse actually has the stock available before fulfilling it. If multiple reps are placing orders at the exact same time, we need to prevent race conditions that could lead to negative stock.

## The Workflow

The workflow is split into two distinct phases to give the sales team flexibility:

1. **Draft Phase**: A sales rep creates a Challan, adding the customer and selecting the products and quantities they want to order. At this stage, the challan is marked as `DRAFT`. It sits in the system as a pending intent to sell. **Crucially, no stock is deducted yet.** This allows reps to build orders over time or wait for customer approval.
2. **Confirmation Phase**: When the order is ready to go, the rep hits "Confirm". This is where the backend takes over and executes a strict transactional flow.

## The Transaction API

When a `POST` request is sent to `/api/challans/:id/confirm`, the Express backend leverages Prisma's `$transaction` API. 

A database transaction ensures that a series of database operations either **all succeed completely** or **all fail completely**. There is no middle ground where stock is deducted but the challan status isn't updated.

Here is what happens inside that transaction:
1. **Verification**: The API pulls the draft challan and looks at every `ChallanItem`. It queries the `Product` table to verify if `Product.currentStock >= ChallanItem.quantity`. 
2. **Rejection**: If even a single product lacks sufficient stock, an Error is thrown. The transaction instantly aborts, rolls back, and returns a `400 Bad Request` to the frontend explaining exactly which product is out of stock.
3. **Execution**: If the stock checks out, the API updates the `Product` table to decrement the `currentStock`.
4. **Audit Trail**: For every product deducted, a new `StockMovement` row is created, permanently logging that stock went `OUT` because of this specific challan.
5. **Finalization**: The Challan's status is finally updated to `CONFIRMED`.

This entire process guarantees that our digital inventory always accurately reflects physical reality.
