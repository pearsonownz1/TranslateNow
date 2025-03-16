import { useState } from "react";
import { PutBlobResult } from "@vercel/blob";
import { upload } from "@vercel/blob/client";

export function useClientBlobStorage() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const uploadFile = async (file: File, userId: string = "anonymous") => {
    try {
      setUploading(true);
      setError(null);

      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("File size exceeds 10MB limit");
      }

      // Generate a unique filename
      const fileExt = file.name.split(".").pop();
      const uniqueFileName = `${userId}/${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;

      // Upload directly to Vercel Blob from the client
      const result = await upload(uniqueFileName, file, {
        access: "public",
        handleUploadUrl: "/api/upload-handler",
        clientPayload: JSON.stringify({
          userId,
          originalFileName: file.name,
          fileSize: file.size,
          fileType: file.type,
        }),
      });

      return {
        filePath: result.pathname,
        fileName: file.name,
        fileSize: file.size,
        url: result.url,
      };
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
    return url;
  };

  return {
    uploadFile,
    getFileUrl,
    uploading,
    error,
  };
}
