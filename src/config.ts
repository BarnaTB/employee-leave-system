
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
      "http://localhost:3000",
      "http://127.0.0.1",
      "http://127.0.0.1:80",
      "http://127.0.0.1:3000"
    ]
  },
  api: {
    // Set a default API URL that works for both development and production
    baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
  }
};
