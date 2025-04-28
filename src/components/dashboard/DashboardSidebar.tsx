import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase"; // Import supabase for logout
import { useToast } from "@/components/ui/use-toast";
import {
  Settings, // Changed from User for Settings
  FileText,
  ClipboardList,
  CreditCard, // Icon for Payment Methods
  MapPin, // Icon for Addresses
  LogOut,
  HelpCircle,
  Home,
  Zap, // Added Zap icon for Integrations
} from "lucide-react";

const DashboardSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Reordered and renamed menu items
  const menuItems = [
    {
      title: "Home",
      icon: <Home className="h-5 w-5" />,
      href: "/dashboard",
    },
    {
      title: "Orders",
      icon: <FileText className="h-5 w-5" />,
      href: "/dashboard/orders",
    },
    {
      title: "Quotes",
      icon: <ClipboardList className="h-5 w-5" />,
      href: "/dashboard/my-quotes",
    },
    {
      title: "Billing", // Renamed from Payment Methods
      icon: <CreditCard className="h-5 w-5" />,
      href: "/dashboard/payment-methods", // Corrected href to point to existing page
    },
    {
      title: "Addresses",
      icon: <MapPin className="h-5 w-5" />,
      href: "/dashboard/addresses",
    },
    {
      title: "Settings", // Renamed from Account Settings
      icon: <Settings className="h-5 w-5" />, // Changed icon from User
      href: "/dashboard/settings",
    },
    {
      title: "Integrations", // Added Integrations item
      icon: <Zap className="h-5 w-5" />,
      href: "/dashboard/integrations",
    },
    {
      title: "Support", // Renamed from Contact Support
      icon: <HelpCircle className="h-5 w-5 text-gray-500" />,
      href: "/dashboard/support",
    },
    // Logout is handled separately below
  ];

  // Logout handler
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Logout Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Logged out successfully." });
      navigate("/login", { replace: true }); // Redirect to login after logout
    }
  };

  return (
    // Added p-6 back to aside
    <aside className="w-64 bg-white rounded-xl shadow-md p-6 space-y-4 hidden md:block">
       {/* Placeholder div to match height of "Welcome back..." heading + margin */}
       <div className="h-14"></div>
       {/* Optional: Add a title like "Your Account" if needed */}
       {/* <h2 className="text-lg font-semibold text-gray-800 px-3 pt-2">Your Account</h2> */}
      {/* Removed p-6 from nav, padding is on aside */}
      <nav className="space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
              // Slightly adjusted active state for better visibility on white
              location.pathname === item.href
                ? "bg-gray-100 text-gray-900"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
            )}
          >
            <span className="mr-3">{item.icon}</span>
            {item.title}
          </Link>
        ))}
         {/* Logout Button */}
         <button
            onClick={handleLogout}
            className={cn(
              "flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            <span className="mr-3"><LogOut className="h-5 w-5" /></span>
            Logout
          </button>
      </nav>
    </aside>
  );
};

export default DashboardSidebar;
