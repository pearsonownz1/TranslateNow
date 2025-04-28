import React from "react";
import { Outlet } from "react-router-dom"; // Import Outlet
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

interface AdminLayoutProps {
  // children prop is no longer needed when using Outlet
  user: {
    name: string;
    email: string;
  }; // Add semicolon
} // Add closing brace for interface

const AdminLayout: React.FC<AdminLayoutProps> = ({ user }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader user={user} /> {/* Pass user prop */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <Outlet /> {/* Render nested routes here */}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
