
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
    console.log("Using API URL for environment:", config.environment);
    
    // Send the token in the Authorization header, properly formatted as "Bearer {token}"
    const response = await axios.get<BackendAuthResponse>(
      `${config.api.baseUrl}/auth/token`,
      {
        headers: {
          'Authorization': `Bearer ${msalResponse.accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        withCredentials: true,
      }
    );

    console.log("Backend authentication response content type:", response.headers['content-type']);
    
    // Check if the response is HTML instead of JSON
    const contentType = response.headers['content-type'] || '';
    if (contentType.includes('text/html')) {
      console.error("Backend returned HTML instead of JSON. The backend might be redirecting to a login page.");
      const htmlResponse = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
      console.error("HTML response:", htmlResponse.substring(0, 200) + "...");
      
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "Backend returned HTML instead of JSON. The Spring Security configuration might need to be updated.",
      });
      throw new Error("Backend returned HTML instead of JSON");
    }
    
    // Validate the token from the backend
    if (!response.data || !response.data.token) {
      console.error("Backend did not return a valid token:", response.data);
      throw new Error("No valid token received from backend");
    }
    
    console.log("Backend authentication successful, token received:", 
      response.data.token.substring(0, 10) + "...");
    return response.data.token;
  } catch (error: any) {
    console.error("Error authenticating with backend:", error);
    console.error("Request details:", {
      url: `${config.api.baseUrl}/auth/token`,
      origin: window.location.origin,
      environment: config.environment,
    });
    
    if (error.message?.includes('Network Error') || !error.response) {
      toast({
        variant: "destructive",
        title: "Network Error",
        description: `Cannot connect to authentication service at ${config.api.baseUrl}. Please ensure the backend is running and CORS is properly configured.`,
      });
    } else {
      // Check if the response contains HTML
      const responseData = error.response?.data;
      if (typeof responseData === 'string' && responseData.includes('<!DOCTYPE html>')) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "The backend is returning HTML instead of JSON. The Spring Security configuration needs to be updated.",
        });
      } else {
        toast({
          variant: "destructive",
          title: `Authentication Error (${error.response?.status || 'Unknown'})`,
          description: error.response?.data?.message || error.message || "Failed to authenticate with backend",
        });
      }
    }
    
    throw error;
  }
};
