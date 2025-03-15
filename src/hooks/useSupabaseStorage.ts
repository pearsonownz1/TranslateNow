import { useState } from "react";
import { supabase } from "../lib/supabase-client";

export function useSupabaseStorage() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const uploadFile = async (file: File, bucket: string, path: string) => {
    try {
      setUploading(true);
      setError(null);

      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${path}/${fileName}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (error) {
        throw error;
      }

      return { filePath, fileName, fileSize: file.size };
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Unknown error during upload"),
      );
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const getFileUrl = (bucket: string, filePath: string) => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  };

  const downloadFile = async (bucket: string, filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(filePath);

      if (error) {
        throw error;
      }

      return data;
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Unknown error during download"),
      );
      throw err;
    }
  };

  return {
    uploadFile,
    getFileUrl,
    downloadFile,
    uploading,
    error,
  };
}
