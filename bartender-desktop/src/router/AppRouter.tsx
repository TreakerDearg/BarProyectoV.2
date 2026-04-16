import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Login from "../modules/auth/pages/Login";
import ProductsPage from "../modules/products/pages/ProductsPage";
import MenusPage from "../modules/menus/pages/MenusPage";
import InventoryPage from "../modules/inventory/pages/InventoryPage";
import RecipesPage from "../modules/recipes/pages/RecipesPage";
import TablesPage from "../modules/tables/pages/TablesPage";
import EmployeesPage from "../modules/admin/pages/EmployeesPage";
import ReservationsPage from "../modules/reservations/pages/ReservationsPage";
import OrdersPage from "../modules/orders/pages/OrdersPage";
import Dashboard from "../modules/dashboard/pages/Dashboard";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuthStore } from "../store/authStore";

// Componente para proteger rutas privadas
const PrivateRoute = () => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

// Layout para las rutas del dashboard
const DashboardRoutes = () => {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
};

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública */}
        <Route path="/" element={<Login />} />

        {/* Rutas privadas */}
        <Route element={<PrivateRoute />}>
          <Route element={<DashboardRoutes />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/menus" element={<MenusPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/reservations" element={<ReservationsPage />} />
            <Route path="/tables" element={<TablesPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/recipes" element={<RecipesPage />} />
            <Route path="/employees" element={<EmployeesPage />} />
          </Route>
        </Route>

        {/* Redirección para rutas inexistentes */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}