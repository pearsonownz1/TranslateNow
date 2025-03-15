import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
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
    // Check if user is logged in with Supabase Auth
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        navigate("/login");
        return;
      }

      // Get user profile from the database
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (profileError) {
        console.error("Error fetching user profile:", profileError);
        // If profile doesn't exist, create one
        if (profileError.code === "PGRST116") {
          const { error: insertError } = await supabase.from("users").insert({
            id: data.user.id,
            email: data.user.email,
            full_name:
              data.user.user_metadata.full_name ||
              data.user.email.split("@")[0],
          });

          if (insertError) {
            console.error("Error creating user profile:", insertError);
            navigate("/login");
            return;
          }
        } else {
          navigate("/login");
          return;
        }
      }

      setUser({
        name:
          profile?.full_name ||
          data.user.user_metadata.full_name ||
          data.user.email.split("@")[0],
        email: data.user.email || "",
        isLoggedIn: true,
      });
    };

    checkUser();
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
