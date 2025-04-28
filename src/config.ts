
// Helper function to detect environment
const getEnvironmentType = () => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'local';
  } else if (hostname.includes('lovable.app') || hostname.includes('lovableproject.com')) {
    return 'preview';
  } else {
    return 'production';
  }
};

// Get the current origin for redirect URI
const getCurrentOrigin = () => {
  return window.location.origin;
};

// Check if we're running inside Docker
const isRunningInDocker = () => {
  // If the API environment variable is set to use the backend service name
  // this is a good indication we're in Docker
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  return apiUrl && apiUrl.includes('backend:8080');
};

export const config = {
  msal: {
    clientId: "76b1492c-ee98-47e4-b0ea-f4ac905161c2",
    authority: "https://login.microsoftonline.com/common",
    redirectUri: getCurrentOrigin(),
    redirectUriForDocker: "http://localhost", // Explicitly named for Docker
    // Add additional valid redirect URIs that can be used
    validRedirectUris: [
      "http://localhost", 
      "http://localhost:80",
      "http://localhost:3000",
      "http://127.0.0.1",
      "http://127.0.0.1:80",
      "http://127.0.0.1:3000",
      "https://preview--employee-leave-system.lovable.app", // Add the preview URL
      getCurrentOrigin(), // Dynamically add current origin
    ]
  },
  api: {
    // Set a default API URL that works for both development and production
    baseUrl: (() => {
      const envApiUrl = import.meta.env.VITE_API_BASE_URL;
      if (envApiUrl) return envApiUrl;
      
      const env = getEnvironmentType();
      switch (env) {
        case 'local':
          // For local development, always use localhost:8080
          return "http://localhost:8080/api";
        case 'preview':
          // For preview, use a publicly available API endpoint
          return "https://api.yourdomain.com/api"; // Replace with your actual production API
        default:
          return "https://api.yourdomain.com/api"; // Production fallback
      }
    })(),
  },
  environment: getEnvironmentType()
};

// Log important configuration details for debugging
console.log("App config:", {
  environment: config.environment,
  apiBaseUrl: config.api.baseUrl,
  redirectUri: config.msal.redirectUri,
  origin: window.location.origin,
  hostname: window.location.hostname,
  inDocker: isRunningInDocker()
});
