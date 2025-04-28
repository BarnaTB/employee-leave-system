
import axios from 'axios';
import { AuthenticationResult } from '@azure/msal-browser';
import { config } from '@/config';
import { toast } from "@/hooks/use-toast";
import { BackendAuthResponse } from '@/types/auth';

export const authenticateWithBackend = async (msalResponse: AuthenticationResult) => {
  try {
    console.log("Authenticating with backend using token:", msalResponse.accessToken.substring(0, 10) + "...");
    console.log("Backend API URL:", `${config.api.baseUrl}/auth/token`);
    console.log("Current Origin:", window.location.origin);
    console.log("Current Environment:", config.environment);
    
    // Send the token in the Authorization header, properly formatted as "Bearer {token}"
    const response = await axios.get<BackendAuthResponse>(
      `${config.api.baseUrl}/auth/token`,
      {
        headers: {
          'Authorization': `Bearer ${msalResponse.accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin,
          'X-Requested-With': 'XMLHttpRequest'
        },
        withCredentials: true,
      }
    );

    console.log("Backend authentication successful", response.data);
    return response.data.token;
  } catch (error: any) {
    console.error("Error authenticating with backend:", error);
    console.error("Request details:", {
      url: `${config.api.baseUrl}/auth/token`,
      origin: window.location.origin,
      environment: config.environment
    });
    
    if (error.message?.includes('Network Error') || !error.response) {
      toast({
        variant: "destructive",
        title: "Network Error",
        description: "Cannot connect to authentication service. Please ensure the backend is running and CORS is properly configured.",
      });
    } else {
      toast({
        variant: "destructive",
        title: `Authentication Error (${error.response?.status || 'Unknown'})`,
        description: error.response?.data?.message || error.message || "Failed to authenticate with backend",
      });
    }
    
    throw error;
  }
};
