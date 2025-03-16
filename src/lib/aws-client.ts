import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// AWS S3 configuration
const region = import.meta.env.VITE_AWS_REGION || "us-east-1";
const accessKeyId = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
const secretAccessKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;
const bucketName = import.meta.env.VITE_AWS_S3_BUCKET_NAME;

// Check for required environment variables
if (!accessKeyId) {
  console.error("Missing VITE_AWS_ACCESS_KEY_ID environment variable");
}

if (!secretAccessKey) {
  console.error("Missing VITE_AWS_SECRET_ACCESS_KEY environment variable");
}

if (!bucketName) {
  console.error("Missing VITE_AWS_S3_BUCKET_NAME environment variable");
}

// Initialize S3 client
export const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId: accessKeyId || "",
    secretAccessKey: secretAccessKey || "",
  },
});

// Helper functions for S3 operations
export const uploadToS3 = async (file: File, userId: string) => {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;
    const contentType = file.type || "application/octet-stream";

    const params = {
      Bucket: bucketName,
      Key: filePath,
      Body: await file.arrayBuffer(),
      ContentType: contentType,
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    return { filePath, fileName, fileSize: file.size };
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error;
  }
};

export const getS3FileUrl = async (filePath: string, expiresIn = 3600) => {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: filePath,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error("Error generating S3 URL:", error);
    throw error;
  }
};

export const downloadFromS3 = async (filePath: string) => {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: filePath,
    });

    const response = await s3Client.send(command);
    return response.Body;
  } catch (error) {
    console.error("Error downloading from S3:", error);
    throw error;
  }
};
