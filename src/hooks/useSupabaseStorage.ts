import { useState } from "react";
import { supabase } from "../lib/supabase-client";

export function useSupabaseStorage() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const uploadFile = async (file: File, bucket: string, path: string) => {
    try {
      setUploading(true);
      setError(null);

      // Generate file path first
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${path}/${fileName}`;

      // Attempt direct upload
      try {
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: true,
          });

        if (error) {
          // If error is about bucket not existing, try to create it
          if (
            error.message.includes("bucket") ||
            error.message.includes("not found")
          ) {
            console.log("Bucket may not exist, attempting to create:", bucket);

            try {
              await supabase.storage.createBucket(bucket, {
                public: true,
                fileSizeLimit: 10485760, // 10MB
              });

              // Try upload again after creating bucket
              const retryUpload = await supabase.storage
                .from(bucket)
                .upload(filePath, file, {
                  cacheControl: "3600",
                  upsert: true,
                });

              if (retryUpload.error) {
                throw retryUpload.error;
              }

              return { filePath, fileName, fileSize: file.size };
            } catch (bucketError) {
              console.error("Error creating bucket:", bucketError);
              throw new Error(
                `Failed to create storage bucket: ${bucketError.message || "Unknown error"}`,
              );
            }
          } else {
            throw error;
          }
        }

        return { filePath, fileName, fileSize: file.size };
      } catch (uploadError) {
        console.error("Upload error details:", uploadError);
        throw new Error(
          `File upload failed: ${uploadError.message || "Unknown error"}`,
        );
      }
    } catch (err) {
      console.error("Complete error details:", err);
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
