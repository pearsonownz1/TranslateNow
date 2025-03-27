export const auth0Config = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN || "",
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID || "",
  authorizationParams: {
    redirect_uri: import.meta.env.PROD 
      ? "https://pingtranslate.com/callback"
      : "http://localhost:5173/callback",
    scope: "openid profile email",
  },
}; 