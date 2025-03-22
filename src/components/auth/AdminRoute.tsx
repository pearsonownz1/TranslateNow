import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// List of admin user emails
const ADMIN_EMAILS = [
  "admin@immitranslate.com",
  // Add other admin emails as needed
];

export default function AdminRoute() {
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if user is authenticated and is an admin
  const isAdmin = user && user.email && ADMIN_EMAILS.includes(user.email);

  // Redirect if not authenticated or not an admin
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Render child routes if authenticated and admin
  return <Outlet />;
}
