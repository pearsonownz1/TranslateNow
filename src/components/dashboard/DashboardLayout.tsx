import React, { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";

interface User {
  name: string;
  email: string;
  isLoggedIn: boolean;
}

const DashboardLayout = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.isLoggedIn) {
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
      <DashboardHeader user={user} />

      <div className="flex">
        <DashboardSidebar />

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
