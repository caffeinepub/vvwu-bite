import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { AdminNavbar } from "./components/AdminNavbar";
import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";
import { CartProvider } from "./context/CartContext";
import { ThemeProvider } from "./context/ThemeContext";

import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { MenuPage } from "./pages/MenuPage";
import { OrderConfirmation } from "./pages/OrderConfirmation";
import { RatingsPage } from "./pages/RatingsPage";
// Pages
import { UserHome } from "./pages/UserHome";
import { AdminCompletedOrders } from "./pages/admin/AdminCompletedOrders";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminLogin } from "./pages/admin/AdminLogin";
import { AdminMenuManager } from "./pages/admin/AdminMenuManager";
import { AdminQueueManager } from "./pages/admin/AdminQueueManager";
import { AdminSalesHistory } from "./pages/admin/AdminSalesHistory";

// ─── Layout Components ────────────────────────────────────────────────

function UserLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function AdminLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <AdminNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

// ─── Routes ────────────────────────────────────────────────────────────

const rootRoute = createRootRoute();

// User routes
const userLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "user-layout",
  component: UserLayout,
});

const homeRoute = createRoute({
  getParentRoute: () => userLayoutRoute,
  path: "/",
  component: UserHome,
});

const menuRoute = createRoute({
  getParentRoute: () => userLayoutRoute,
  path: "/menu",
  component: MenuPage,
});

const cartRoute = createRoute({
  getParentRoute: () => userLayoutRoute,
  path: "/cart",
  component: CartPage,
});

const checkoutRoute = createRoute({
  getParentRoute: () => userLayoutRoute,
  path: "/checkout",
  component: CheckoutPage,
});

const orderRoute = createRoute({
  getParentRoute: () => userLayoutRoute,
  path: "/order/$id",
  component: OrderConfirmation,
});

const ratingsRoute = createRoute({
  getParentRoute: () => userLayoutRoute,
  path: "/ratings",
  component: RatingsPage,
});

// Admin routes
const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminLogin,
});

const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "admin-layout",
  component: AdminLayout,
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/dashboard",
  component: AdminDashboard,
});

const adminMenuRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/menu",
  component: AdminMenuManager,
});

const adminQueueRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/queue",
  component: AdminQueueManager,
});

const adminOrdersRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/orders",
  component: AdminCompletedOrders,
});

const adminHistoryRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/history",
  component: AdminSalesHistory,
});

// ─── Router ──────────────────────────────────────────────────────────

const routeTree = rootRoute.addChildren([
  userLayoutRoute.addChildren([
    homeRoute,
    menuRoute,
    cartRoute,
    checkoutRoute,
    orderRoute,
    ratingsRoute,
  ]),
  adminLoginRoute,
  adminLayoutRoute.addChildren([
    adminDashboardRoute,
    adminMenuRoute,
    adminQueueRoute,
    adminOrdersRoute,
    adminHistoryRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// ─── App ─────────────────────────────────────────────────────────────

export default function App() {
  return (
    <ThemeProvider>
      <CartProvider>
        <RouterProvider router={router} />
        <Toaster
          position="top-right"
          toastOptions={{
            classNames: {
              toast:
                "bg-card border border-border text-foreground font-heading text-sm",
              success: "border-green-500/30",
              error: "border-destructive/30",
            },
          }}
        />
      </CartProvider>
    </ThemeProvider>
  );
}
