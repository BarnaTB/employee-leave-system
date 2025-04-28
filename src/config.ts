
export const config = {
  msal: {
    clientId: "76b1492c-ee98-47e4-b0ea-f4ac905161c2",
    authority: "https://login.microsoftonline.com/common",
    redirectUri: window.location.origin,
    redirectUriForDocker: "http://localhost",
    // Add additional valid redirect URIs that can be used
    validRedirectUris: [
      "http://localhost", 
      "http://localhost:80", 
      "http://127.0.0.1",
      "http://127.0.0.1:80"
    ]
  },
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || "/api", // Default to relative path for local development
  }
};
