import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { canAccessPath } from "../config/accessControl";

/* ==============================
   PAGES PUBLIC
============================== */
import Login from "../modules/auth/pages/Login";

/* ==============================
   CORE MODULES
============================== */
import Dashboard from "../modules/dashboard/pages/Dashboard";

import ProductsPage from "../modules/products/pages/ProductsPage";
import MenusPage from "../modules/menus/pages/MenusPage";
import InventoryPage from "../modules/inventory/pages/InventoryPage";
import RecipesPage from "../modules/recipes/pages/RecipesPage";
import TablesPage from "../modules/tables/pages/TablesPage";
import ReservationsPage from "../modules/reservations/pages/ReservationsPage";
import RoulettePage from "../modules/roulette/pages/RoulettePage";
import OrdersPage from "../modules/orders/pages/OrdersPage";
import DiscountPage from "../modules/discounts/pages/DiscountPage";
import DynamicPricingPage from "../modules/discounts/pages/DynamicPricingPage";
import PromotionsPage from "../modules/discounts/pages/PromotionsPage";
import DiscountEventsPage from "../modules/discounts/pages/DiscountEventsPage";

/* ==============================
   ADMIN MODULE ROUTES
============================== */
import { adminRoutes } from "./admin.routes";

/* ==============================
   PRIVATE ROUTE GUARD
============================== */
const PrivateRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

const RoleRoute = ({ path }: { path: string }) => {
  const user = useAuthStore((state) => state.user);
  return canAccessPath(user?.role, path) ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

/* ==============================
   DASHBOARD LAYOUT WRAPPER
============================== */
import DashboardLayout from "../layouts/DashboardLayout";

const DashboardRoutes = () => {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
};

/* ==============================
   APP ROUTER
============================== */
export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================= PUBLIC ================= */}
        <Route path="/" element={<Login />} />

        {/* ================= PRIVATE ================= */}
        <Route element={<PrivateRoute />}>

          {/* WRAPPED LAYOUT */}
          <Route element={<DashboardRoutes />}>

            {/* ================= CORE SYSTEM ================= */}
            <Route element={<RoleRoute path="/dashboard" />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
            <Route element={<RoleRoute path="/products" />}>
              <Route path="/products" element={<ProductsPage />} />
            </Route>
            <Route element={<RoleRoute path="/menus" />}>
              <Route path="/menus" element={<MenusPage />} />
            </Route>
            <Route element={<RoleRoute path="/orders" />}>
              <Route path="/orders" element={<OrdersPage />} />
            </Route>
            <Route element={<RoleRoute path="/discounts" />}>
              <Route path="/discounts" element={<DiscountPage />} />
            </Route>
            <Route element={<RoleRoute path="/discounts/dynamic-pricing" />}>
              <Route path="/discounts/dynamic-pricing" element={<DynamicPricingPage />} />
            </Route>
            <Route element={<RoleRoute path="/discounts/promotions" />}>
              <Route path="/discounts/promotions" element={<PromotionsPage />} />
            </Route>
            <Route element={<RoleRoute path="/discounts/events" />}>
              <Route path="/discounts/events" element={<DiscountEventsPage />} />
            </Route>
            <Route element={<RoleRoute path="/reservations" />}>
              <Route path="/reservations" element={<ReservationsPage />} />
            </Route>
            <Route element={<RoleRoute path="/tables" />}>
              <Route path="/tables" element={<TablesPage />} />
            </Route>
            <Route element={<RoleRoute path="/inventory" />}>
              <Route path="/inventory" element={<InventoryPage />} />
            </Route>
            <Route element={<RoleRoute path="/recipes" />}>
              <Route path="/recipes" element={<RecipesPage />} />
            </Route>
            <Route element={<RoleRoute path="/roulette" />}>
              <Route path="/roulette" element={<RoulettePage />} />
            </Route>

            {/* ================= ADMIN MODULE (DYNAMIC) ================= */}
            {adminRoutes.map((route) => (
              <Route key={route.path} element={<RoleRoute path={route.path} />}>
                <Route path={route.path} element={<route.element />} />
              </Route>
            ))}

          </Route>
        </Route>

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />

      </Routes>
    </BrowserRouter>
  );
}
