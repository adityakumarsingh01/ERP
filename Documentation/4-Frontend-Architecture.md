# Frontend UI & UX Architecture

The frontend of this ERP was built with a philosophy of speed, clarity, and bold design. We moved away from the boring, sterile enterprise look and embraced a modern, Neo-brutalist aesthetic using **Tailwind CSS**. 

## State Management

Instead of wrestling with complex Redux setups, we utilized **React Query (Tanstack Query)**. 

React Query acts as our server-state manager. It automatically caches API responses, handles background refetching, and provides clean `isLoading` states out of the box. 

For example, when a new Challan is created via a `useMutation`, we simply tell React Query to invalidate the `['challans']` query cache. It instantly refetches the data in the background, updating the table on the UI without requiring a full page refresh or manual state manipulation.

## The Neo-Brutalist Design System

Enterprise software is usually dull. We wanted this portal to feel snappy and visually distinct.

We relied heavily on utility classes from Tailwind CSS to achieve this:
- **High Contrast**: Lots of `bg-slate-900` against stark white backgrounds.
- **Bold Typography**: Widespread use of `font-black`, `uppercase`, and `tracking-widest` to make headers and buttons feel structurally solid.
- **Sharp Edges**: We completely avoided rounded corners (`rounded-none` or default sharp borders) to emphasize the grid-like, data-heavy nature of an ERP.
- **Micro-interactions**: Subtle `hover:bg-slate-800` transitions and interactive colored pills for status tags (e.g., emerald green for Active customers, amber for Draft challans).

## Dashboard & Analytics

The Dashboard acts as the command center. Upon login, the user is greeted with high-level metrics aggregated directly from the database. 

A critical feature here is the **Low Stock Alerts** panel. By surfacing products where `currentStock <= minimumStock` immediately upon login, warehouse managers don't have to go digging through the product catalog to find what needs to be reordered. The system brings the problem to them.
