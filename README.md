# FundsRoom Mini ERP & CRM Portal

**🚀 Live Demo:** [https://erp-ruby-seven.vercel.app](https://erp-ruby-seven.vercel.app)

Hey there! Welcome to the repository for the FundsRoom Mini ERP and CRM portal. I built this project to handle the core operations of a wholesale/distribution business—tracking inventory, managing customers, and processing sales challans with strict stock validations.

I split the project into a robust Node.js/Express backend and a modern React/Vite frontend. 

## What does this do?

At a high level, this system solves a few key operational problems:
- **Role-Based Access**: Not everyone needs to see everything. The app locks down views and APIs based on whether you're an Admin, Sales Rep, Warehouse Manager, or Accountant.
- **Customer CRM**: A central place to keep track of clients (retailers, wholesalers, distributors) and their contact info.
- **Inventory Management**: Real-time tracking of product stock. You can see what's running low instantly on the dashboard.
- **Sales Challans (Delivery Orders)**: The core workflow. Sales reps can draft challans, but the magic happens on confirmation: the backend runs a strict database transaction to ensure we actually have the stock before deducting it and finalizing the order.

## Tech Stack

I kept things modern and type-safe:
- **Frontend**: React, TypeScript, Vite, Tailwind CSS (for that clean, snappy UI), React Router, and Tanstack Query for smooth data fetching.
- **Backend**: Node.js, Express, TypeScript, and Prisma ORM.
- **Database**: PostgreSQL (hosted on Render).

## Getting Started Locally

It takes about two minutes to get everything running.

### 1. Boot up the Backend
Open your terminal and navigate to the `backend` folder:
```bash
cd backend
npm install
```
Next, push the database schema and seed it with our test data:
```bash
npx prisma db push
npx prisma db seed
```
Finally, start the dev server:
```bash
npm run dev
```
*The API is now listening on `http://localhost:5000`.*

### 2. Boot up the Frontend
Open a new terminal tab and go to the `frontend` folder:
```bash
cd frontend
npm install
npm run dev
```
*The app is now running on `http://localhost:5173`.*

## Test Accounts

The database seed creates a few accounts so you can test the Role-Based Access Control right away. You can use these on the live demo as well!

- `admin@fundsroom.com` — Password: **Admin@123**
- `sales@fundsroom.com` — Password: **Sales@123**
- `warehouse@fundsroom.com` — Password: **Warehouse@123**
- `accounts@fundsroom.com` — Password: **Accounts@123**

## Deep Dive Documentation

If you want to understand the architecture, database schema, or how the transactional logic works under the hood, check out the markdown files in the `/Documentation` folder!
