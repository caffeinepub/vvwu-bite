# VVWU Bite: Smart Canteen Pre-Ordering & Queue Management System

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add

**App Identity**
- App name: "🍴🍽️🥄 VVWU-Bite: Smart Canteen Pre-Ordering & Queue Management System"
- Black, red, golden color theme
- Light/dark mode toggle (system-wide)

**Admin Side**
- Admin login page (single admin with hardcoded or stored credentials)
- Admin dashboard with:
  - Day-wise menu management (Mon–Sun), each day has unique food items
  - CRUD for food items: image upload, name, price, quantity
  - Queue management page: active orders with order ID, time required, dine-in/takeaway label, payment status (cash/online), action to mark as delivered (moves to completed)
  - Completed orders page: today's completed orders
  - Sales history page: past orders by date (calendar/date picker), with export to CSV/Excel
  - Ratings view: see user ratings per food item

**User Side (open, no login required)**
- Attractive canteen-themed landing/home page
- Today's menu shown by default; day changes dynamically at midnight
- Users can browse yesterday's or tomorrow's menu (view-only, cannot order from them)
- Food item cards: image, name, price, available quantity (dynamic)
- Add to cart (multiple items)
- Cart page: review order, select dine-in or takeaway
- Payment selection: cash or online; if online, show QR code for payment
- Order confirmation: assign unique order ID to user
- Ratings page: users can rate food items (1–5 stars)

**Day-wise Menu (from reference image)**
- Monday: Pav Bhaji, Vada Pav, Masala Chai, Samosa, Poha
- Tuesday: Chole Bhature, Lassi, Aloo Tikki, Jalebi, Bread Pakora
- Wednesday: Idli Sambar, Dosa, Filter Coffee, Upma, Medu Vada
- Thursday: Dal Tadka Rice, Roti Sabzi, Buttermilk, Khichdi, Papad
- Friday: Rajma Rice, Paneer Tikka, Mango Lassi, Gulab Jamun, Naan
- Saturday: Biryani, Raita, Shahi Tukda, Seekh Kebab, Shorba
- Sunday: Thali (Roti+Dal+Sabzi+Rice+Papad), Kheer, Aam Panna, Pakora, Chutney

**Queue Management**
- Live queue list with order ID, items ordered, dine-in/takeaway, estimated time, payment status
- Mark as delivered button → moves order to completed
- Real-time quantity decrement on ordering

**Export**
- Export completed orders and sales history as CSV

### Modify
- Nothing (new project)

### Remove
- Nothing (new project)

## Implementation Plan

1. Select components: `authorization` (admin login), `qr-code` (payment QR)
2. Generate Motoko backend:
   - Admin authentication
   - Menu items store (day-wise, CRUD)
   - Orders store (place order, update status, queue, completed)
   - Ratings store (per item, per user session)
3. Generate food item images for each day's menu
4. Build frontend:
   - App shell with dark/light theme toggle, nav
   - User: Home/menu page, cart, checkout, order confirmation, ratings page
   - Admin: Login, dashboard, menu management, queue page, completed orders, sales history with CSV export
   - Dynamic day detection (auto-switch menu at midnight)
   - QR code display for online payment
