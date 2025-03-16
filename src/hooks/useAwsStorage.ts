import { useState } from "react";
import { uploadToS3, getS3FileUrl, downloadFromS3 } from "../lib/aws-client";

export function useAwsStorage() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const uploadFile = async (file: File, path: string, userId: string) => {
    try {
      setUploading(true);
      setError(null);

      const result = await uploadToS3(file, userId);
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

  const getFileUrl = async (filePath: string) => {
    try {
      return await getS3FileUrl(filePath);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Error generating file URL"),
      );
      throw err;
    }
  };

  const downloadFile = async (filePath: string) => {
    try {
      return await downloadFromS3(filePath);
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
