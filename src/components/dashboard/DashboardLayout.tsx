import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase"; // Import Supabase client
import { Session } from "@supabase/supabase-js";
import DashboardSidebar from "./DashboardSidebar";
// import DashboardHeader from "./DashboardHeader"; // Removed DashboardHeader
import Navbar from "../landing/Navbar"; // Added Navbar import
import Footer from "../landing/Footer"; // Added Footer import

const DashboardLayout = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch session and listen for changes
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (!session) {
        // This check might be redundant due to ProtectedRoute, but good for safety
        navigate("/login", { replace: true });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session && !loading) {
        // Redirect if session becomes null after initial load
        navigate("/login", { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, loading]); // Added loading dependency

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // ProtectedRoute should handle the main redirect, but this is a fallback
  if (!session) {
     return null; // Or redirect again, though ProtectedRoute should cover this
  }

  // Extract user info from Supabase session
  const userEmail = session.user?.email || "";
  // Supabase doesn't provide 'name' by default in the session user object.
  // You might need to fetch profile data separately if you store names.
  // User info extraction remains, but might not be needed by Navbar
  // const userEmail = session.user?.email || "";
  // const userName = session.user?.user_metadata?.full_name || userEmail;

  return (
    // Changed background color to match the brief
    <div className="min-h-screen flex flex-col bg-[#f9f9f4]">
      {/* Replaced DashboardHeader with Navbar, added dashboard variant */}
      <Navbar variant="dashboard" />

      {/* Added pt-16 to account for fixed navbar height */}
      <div className="flex flex-1 pt-16">
        {/* Removed wrapper div with margin */}
        <DashboardSidebar />

        {/* Ensured p-6 is on main */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>

      {/* Added Footer */}
      <Footer />
    </div>
  );
};

export default DashboardLayout;
