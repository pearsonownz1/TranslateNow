import { put, del, list, PutBlobResult } from "@vercel/blob";

// Helper functions for Vercel Blob operations
export const uploadToBlob = async (
  file: File,
  userId: string,
): Promise<{
  filePath: string;
  fileName: string;
  fileSize: number;
  url: string;
}> => {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // Upload to Vercel Blob using client-side API
    const blob: PutBlobResult = await put(filePath, file, {
      access: "public",
      // Don't use addRandomSuffix as it causes CORS issues
      // Use import.meta.env for Vite environment variables
      token: import.meta.env.VITE_BLOB_READ_WRITE_TOKEN || "",
    });

    return {
      filePath: blob.pathname,
      fileName,
      fileSize: file.size,
      url: blob.url,
    };
  } catch (error) {
    console.error("Error uploading to Vercel Blob:", error);
    throw error;
  }
};

export const getBlobUrl = (url: string): string => {
  return url;
};

export const deleteFromBlob = async (url: string): Promise<void> => {
  try {
    await del(url);
  } catch (error) {
    console.error("Error deleting from Vercel Blob:", error);
    throw error;
  }
};

export const listBlobFiles = async (prefix?: string): Promise<any[]> => {
  try {
    const { blobs } = await list({ prefix });
    return blobs;
  } catch (error) {
    console.error("Error listing Vercel Blob files:", error);
    throw error;
  }
};
