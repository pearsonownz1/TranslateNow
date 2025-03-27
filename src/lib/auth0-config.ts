export const auth0Config = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN || "",
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID || "",
  cacheLocation: "localstorage",
  useRefreshTokens: true,
  authorizationParams: {
    audience: import.meta.env.VITE_AUTH0_AUDIENCE,
    redirect_uri: import.meta.env.PROD 
      ? "https://www.pingtranslate.com/callback"
      : "http://localhost:5173/callback",
    scope: "openid profile email",
  },
}; 