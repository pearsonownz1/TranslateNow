import { createClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase";

// Use service role key for admin operations
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_KEY || "";

if (!supabaseUrl) {
  console.error("Missing VITE_SUPABASE_URL environment variable");
}

if (!supabaseServiceKey) {
  console.error("Missing SUPABASE_SERVICE_KEY environment variable");
}

// Create a separate client with the service role key for admin operations
const adminSupabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Create a user without rate limits using the Admin API
 * Only use this for testing or admin operations
 */
export const createUserWithoutRateLimit = async (
  email: string,
  password: string,
  userData: { full_name: string; is_admin?: boolean },
) => {
  try {
    // Create the user with the Admin API
    const { data, error } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm the email
      user_metadata: userData,
    });

    if (error) throw error;

    // If user was created successfully, also create an entry in the users table
    if (data.user) {
      const { error: profileError } = await adminSupabase.from("users").insert({
        id: data.user.id,
        email: email,
        full_name: userData.full_name,
        is_admin: userData.is_admin || false,
      });

      if (profileError) {
        console.error("Error creating user profile:", profileError);
        // Don't throw here as the auth user is already created
      }
    }

    return data;
  } catch (error) {
    console.error("Admin user creation error:", error);
    throw error;
  }
};

/**
 * Get all users - admin function
 */
export const getAllUsers = async () => {
  try {
    const { data, error } = await adminSupabase.auth.admin.listUsers();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

/**
 * Delete a user - admin function
 */
export const deleteUser = async (userId: string) => {
  try {
    const { data, error } = await adminSupabase.auth.admin.deleteUser(userId);
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};
