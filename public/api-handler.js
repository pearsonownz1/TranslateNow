// This file serves as a simple API handler for development
import { handleRequest } from "../src/api/index";

// Listen for fetch events
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Only handle API requests
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(handleRequest(url.pathname, event.request));
  }
});
