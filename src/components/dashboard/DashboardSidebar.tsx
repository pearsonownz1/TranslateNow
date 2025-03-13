import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  ShoppingCart,
  CreditCard,
  Settings,
  HelpCircle,
} from "lucide-react";

const DashboardSidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: "/dashboard",
    },
    {
      title: "My Orders",
      icon: <FileText className="h-5 w-5" />,
      href: "/dashboard/orders",
    },
    {
      title: "New Order",
      icon: <ShoppingCart className="h-5 w-5" />,
      href: "/checkout",
    },
    {
      title: "Billing",
      icon: <CreditCard className="h-5 w-5" />,
      href: "/dashboard/billing",
    },
    {
      title: "Settings",
      icon: <Settings className="h-5 w-5" />,
      href: "/dashboard/settings",
    },
    {
      title: "Help & Support",
      icon: <HelpCircle className="h-5 w-5" />,
      href: "/dashboard/support",
    },
  ];

  return (
    <aside className="w-64 bg-white border-r min-h-[calc(100vh-4rem)] p-4 hidden md:block">
      <nav className="space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
              location.pathname === item.href
                ? "bg-blue-50 text-blue-700"
                : "text-gray-700 hover:bg-gray-100",
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

export default DashboardSidebar;
