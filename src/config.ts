
export const config = {
  msal: {
    clientId: import.meta.env.VITE_MSAL_CLIENT_ID || "your-client-id-here",
    authority: "https://login.microsoftonline.com/common",
    redirectUri: window.location.origin,
  },
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || "/api", // Default to relative path for local development
  }
};
