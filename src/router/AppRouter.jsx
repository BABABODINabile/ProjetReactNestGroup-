import { Routes, Route } from "react-router-dom";

import LoginPage from "../auth/LoginPage";
import DashboardLayout from "../dashboard/DashboardLayout";

import ProtectedRoute from "./ProtectedRoute";
import RoleGuard from "./RoleGuard";

import DashboardHome from "../dashboard/pages/DashboardHome";
import CategoriesPage from "../dashboard/pages/CategoriesPage";
import TransactionsPage from "../dashboard/pages/TransactionsPage";
import ProfilePage from "../dashboard/pages/ProfilePage";
import RolePermissionPage from "../dashboard/pages/UsersPage";

export default function AppRouter() {
  return (
    
    <Routes>
      {/* Page publique */}
      <Route path="/login" element={<LoginPage />} />

      {/* Dashboard + protected */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Sous-pages du dashboard */}
        <Route index element={<DashboardHome />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="profile" element={<ProfilePage />} />

        {/* Page réservée au super admin */}
        <Route
          path="users"
          element={
            <RoleGuard allowedRoles={["Directeur"]}>
              <RolePermissionPage />
            </RoleGuard>
          }
        />
      </Route>

      {/* Redirection par défaut */}
      <Route path="*" element={<LoginPage />} />
    </Routes>
  );
}
