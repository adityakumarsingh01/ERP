# Authentication & Role-Based Access Control

Security and access isolation were huge priorities for this ERP. We didn't just want a simple login; we needed to make sure that different departments (Sales, Warehouse, Accounts) only had access to the data they absolutely needed to see or modify.

## How Authentication Works

We went with a standard, stateless **JSON Web Token (JWT)** approach. 
1. When a user logs in via the `/api/auth/login` endpoint, the backend compares their hashed password using `bcrypt`.
2. If it matches, we sign a JWT containing their `id`, `email`, and most importantly, their `role`. 
3. This token is passed back to the frontend, which stores it locally and attaches it as a `Bearer` token to the `Authorization` header for all future Axios requests.

## Role-Based Access Control (RBAC)

The backend handles RBAC through a custom Express middleware called `requireRole`. 

Instead of just checking if a user is logged in, specific routes check if the user belongs to an allowed array of roles. For example, creating a new product is restricted like this:
```typescript
router.post('/', requireRole(['ADMIN', 'WAREHOUSE']), async (req, res) => { ... })
```

### The Roles
- **ADMIN**: The superuser. Has unrestricted access to create, read, update, and delete anything.
- **SALES**: Can view the product catalog (to know what to sell) and manage Customers and Challans. They cannot modify inventory directly.
- **WAREHOUSE**: Can manage products, view stock movements, and update inventory. They don't need to see CRM data.
- **ACCOUNTS**: A read-only role. They can view challans, customers, and inventory for reconciliation and auditing purposes, but they can't change any records.

## Frontend Enforcement

We didn't just want the backend throwing `403 Forbidden` errors; we wanted the UI to adapt. 
The React frontend uses an `AuthContext` to make the current user's role available to every component. If a user logs in as `SALES`, the "Add Product" button in the inventory screen simply won't render for them. This keeps the interface clean and prevents users from trying actions they aren't authorized to complete.
