import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  FileText, // Icon for Quotes
  Zap, // Added Zap icon for API Quotes
  FileCode, // Icon for Clio Quotes
  // Add other icons as needed
} from "lucide-react";

const AdminSidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: "/admin",
    },
    {
      title: "Orders",
      icon: <ShoppingCart className="h-5 w-5" />,
      href: "/admin/orders",
    },
    {
      title: "Quotes", // Added Quotes link
      icon: <FileText className="h-5 w-5" />,
      href: "/admin/quotes",
    },
    {
      title: "API Quotes", // Added API Quotes link
      icon: <Zap className="h-5 w-5" />,
      href: "/admin/api-quotes", // New route
    },
    {
      title: "Clio Quotes", // Added Clio Quotes link
      icon: <FileCode className="h-5 w-5" />,
      href: "/admin/clio-quotes", // New route for Clio Quotes
    },
    {
      title: "Users",
      icon: <Users className="h-5 w-5" />,
      href: "/admin/users",
    },
    // Add more admin links here
  ];

  return (
    <aside className="w-64 bg-gray-800 text-white border-r border-gray-700 min-h-screen p-4 hidden md:block">
      <div className="mb-8">
        {/* Optional: Add a logo or admin title here */}
        <h2 className="text-lg font-semibold px-3">Admin Panel</h2>
      </div>
      <nav className="space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
              location.pathname === item.href || (location.pathname.startsWith(item.href) && item.href !== '/admin') // Highlight parent route
                ? "bg-gray-700 text-white"
                : "text-gray-300 hover:bg-gray-700 hover:text-white",
            )}
          >
            <span className="mr-3">{item.icon}</span>
            {item.title}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
