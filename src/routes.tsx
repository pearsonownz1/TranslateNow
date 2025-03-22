import { createBrowserRouter, Navigate } from "react-router-dom";
import LoginPage from "./components/auth/LoginPage";
import RegisterPage from "./components/auth/RegisterPage";
import ForgotPasswordPage from "./components/auth/ForgotPasswordPage";
import ResetPasswordPage from "./components/auth/ResetPasswordPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminRoute from "./components/auth/AdminRoute";
import LandingPage from "./components/landing/LandingPage";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import DashboardHome from "./components/dashboard/DashboardHome";
import OrdersPage from "./components/dashboard/OrdersPage";
import OrderDetailsPage from "./components/dashboard/OrderDetailsPage";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminOrdersPage from "./components/admin/AdminOrdersPage";
import AdminOrderDetailsPage from "./components/admin/AdminOrderDetailsPage";
import AdminUsersPage from "./components/admin/AdminUsersPage";
import AdminPendingOrdersPage from "./components/admin/AdminPendingOrdersPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },

  {
    path: "/dashboard",
    element: <ProtectedRoute />,
    children: [
      {
        path: "",
        element: <DashboardLayout />,
        children: [
          {
            path: "",
            element: <DashboardHome />,
          },
          {
            path: "orders",
            element: <OrdersPage />,
          },
          {
            path: "orders/:orderId",
            element: <OrderDetailsPage />,
          },
          // Add more dashboard routes as needed
        ],
      },
    ],
  },
  {
    path: "/admin",
    element: <AdminRoute />,
    children: [
      {
        path: "",
        element: <AdminLayout />,
        children: [
          {
            path: "",
            element: <AdminDashboard />,
          },
          {
            path: "orders",
            element: <AdminOrdersPage />,
          },
          {
            path: "orders/:orderId",
            element: <AdminOrderDetailsPage />,
          },
          {
            path: "users",
            element: <AdminUsersPage />,
          },
          {
            path: "pending-orders",
            element: <AdminPendingOrdersPage />,
          },
          // Add more admin routes as needed
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

export default router;
