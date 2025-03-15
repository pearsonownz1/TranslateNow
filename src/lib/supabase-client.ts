import { createClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl) {
  console.error("Missing VITE_SUPABASE_URL environment variable");
}

if (!supabaseAnonKey) {
  console.error("Missing VITE_SUPABASE_ANON_KEY environment variable");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper functions for common operations
export const uploadDocument = async (file: File, userId: string) => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from("documents")
    .upload(filePath, file);

  if (error) {
    throw error;
  }

  return { filePath, fileName, fileSize: file.size };
};

export const createOrder = async (orderData: any) => {
  const { data, error } = await supabase
    .from("orders")
    .insert(orderData)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const getOrders = async (userId: string) => {
  const { data, error } = await supabase
    .from("orders")
    .select("*, documents(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
};

export const getOrderDetails = async (orderId: string) => {
  const { data, error } = await supabase
    .from("orders")
    .select("*, documents(*), translations(*)")
    .eq("id", orderId)
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const updateUserProfile = async (userId: string, userData: any) => {
  const { data, error } = await supabase
    .from("users")
    .update(userData)
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};
