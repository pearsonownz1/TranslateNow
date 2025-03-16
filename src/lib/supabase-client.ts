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
// This function is kept for backward compatibility
// For new uploads, use the AWS S3 client from aws-client.ts
export const uploadDocument = async (file: File, userId: string) => {
  // Import dynamically to avoid circular dependencies
  const { uploadToBlob } = await import("./blob-client");

  try {
    // Use Vercel Blob for document uploads
    return await uploadToBlob(file, userId);
  } catch (error) {
    console.error(
      "Vercel Blob upload failed, falling back to Supabase:",
      error,
    );

    // Fallback to Supabase storage if Vercel Blob fails
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { data, error: supabaseError } = await supabase.storage
      .from("documents")
      .upload(filePath, file);

    if (supabaseError) {
      throw supabaseError;
    }

    return {
      filePath,
      fileName,
      fileSize: file.size,
      url: supabase.storage.from("documents").getPublicUrl(filePath).data
        .publicUrl,
    };
  }
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
