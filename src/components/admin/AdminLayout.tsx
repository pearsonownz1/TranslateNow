import React, { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

interface User {
  name: string;
  email: string;
  isLoggedIn: boolean;
  isAdmin?: boolean;
}

const AdminLayout = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in and is an admin
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.isLoggedIn) {
          // For demo purposes, we'll set isAdmin to true
          // In a real app, this would be checked against a database
          parsedUser.isAdmin = true;
          setUser(parsedUser);
        } else {
          navigate("/login");
        }
      } catch (error) {
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader user={user} />

      <div className="flex">
        <AdminSidebar />

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
