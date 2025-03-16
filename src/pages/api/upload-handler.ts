import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body as HandleUploadBody;

    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // Parse the client payload
        const payload = clientPayload ? JSON.parse(clientPayload) : {};
        const { userId = "anonymous" } = payload;

        // Authenticate user here if needed
        // This is where you would verify the user is allowed to upload

        // For security, limit what file types can be uploaded
        return {
          allowedContentTypes: [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "image/jpeg",
            "image/png",
            "image/gif",
            "text/plain",
          ],
          // Maximum size in bytes (10MB)
          maximumSize: 10 * 1024 * 1024,
          tokenPayload: JSON.stringify({
            userId,
            timestamp: Date.now(),
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // This won't work in local development without a tunnel
        console.log("Upload completed:", blob.url);

        try {
          // Parse the token payload
          const { userId } = JSON.parse(tokenPayload);

          // Here you would typically update your database with the file information
          // For example, store the blob URL in your documents table
          // await db.documents.create({ userId, url: blob.url, ...other metadata });

          // You could use Supabase here to store the document metadata
          // const { data, error } = await supabase.from('documents').insert({
          //   user_id: userId,
          //   file_path: blob.url,
          //   file_name: blob.pathname.split('/').pop(),
          //   file_size: blob.size,
          //   created_at: new Date().toISOString(),
          // });

          // if (error) throw error;
        } catch (error) {
          console.error("Error saving document metadata:", error);
        }
      },
    });

    return res.status(200).json(jsonResponse);
  } catch (error) {
    console.error("Error handling upload:", error);
    return res.status(400).json({ error: (error as Error).message });
  }
}
