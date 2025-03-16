import { useState } from "react";
import { uploadToBlob, getBlobUrl, deleteFromBlob } from "../lib/blob-client";

export function useBlobStorage() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const uploadFile = async (file: File, path: string, userId: string) => {
    try {
      setUploading(true);
      setError(null);

      const result = await uploadToBlob(file, userId);
      return result;
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

  const getFileUrl = (url: string) => {
    try {
      return getBlobUrl(url);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Error generating file URL"),
      );
      throw err;
    }
  };

  const deleteFile = async (url: string) => {
    try {
      await deleteFromBlob(url);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Unknown error during deletion"),
      );
      throw err;
    }
  };

  return {
    uploadFile,
    getFileUrl,
    deleteFile,
    uploading,
    error,
  };
}
