import React from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";

const DashboardLayout = () => {
  const { isAuthenticated, isLoading, user, loginWithRedirect } = useAuth0();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    loginWithRedirect();
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={{ name: user?.name || "", email: user?.email || "" }} />

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
