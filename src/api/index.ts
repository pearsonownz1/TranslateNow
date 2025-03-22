import { sendEmail } from "./send-email";

// This file serves as a router for API endpoints
export async function handleRequest(path: string, request: Request) {
  // Route the request to the appropriate handler based on the path
  if (path === "/api/send-email") {
    return sendEmail(request);
  }

  // Return 404 for unknown endpoints
  return new Response(JSON.stringify({ error: "Not found" }), {
    status: 404,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
