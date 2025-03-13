import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  HelpCircle,
  BarChart,
  CheckSquare,
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
      icon: <FileText className="h-5 w-5" />,
      href: "/admin/orders",
    },
    {
      title: "Pending Orders",
      icon: <CheckSquare className="h-5 w-5" />,
      href: "/admin/pending-orders",
    },
    {
      title: "Users",
      icon: <Users className="h-5 w-5" />,
      href: "/admin/users",
    },
    {
      title: "Analytics",
      icon: <BarChart className="h-5 w-5" />,
      href: "/admin/analytics",
    },
    {
      title: "Settings",
      icon: <Settings className="h-5 w-5" />,
      href: "/admin/settings",
    },
    {
      title: "Help & Support",
      icon: <HelpCircle className="h-5 w-5" />,
      href: "/admin/support",
    },
  ];

  return (
    <aside className="w-64 bg-gray-800 text-white min-h-[calc(100vh-4rem)] p-4 hidden md:block">
      <nav className="space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
              location.pathname === item.href
                ? "bg-gray-900 text-white"
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
