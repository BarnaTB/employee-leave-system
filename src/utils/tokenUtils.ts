import { AuthState } from '@/types/auth';
import { AuthenticationResult } from '@azure/msal-browser';
import { toast } from "@/hooks/use-toast";

export const parseJwtToken = (jwtToken: string): Partial<AuthState> => {
  try {
    // Check if the token is a valid structure
    if (!jwtToken || typeof jwtToken !== 'string' || !jwtToken.includes('.')) {
      console.error("Invalid token format received:", jwtToken);
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "Invalid token format received from server."
      });
      throw new Error("Invalid token format received from server");
    }
    
    const parts = jwtToken.split('.');
    if (parts.length !== 3) {
      console.error("JWT token does not have three parts:", parts.length);
      throw new Error("Invalid JWT token structure");
    }
    
    const base64Url = parts[1]; // Get the payload part
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // Handle potential padding issues
    const padding = '='.repeat((4 - base64.length % 4) % 4);
    const jsonPayload = atob(base64 + padding);
    
    // Parse the JSON payload
    const decodedToken = JSON.parse(jsonPayload);
    console.log("Decoded token payload:", decodedToken);
    
    return {
      employeeId: decodedToken.employeeId || null,
      isManager: decodedToken.roles?.includes('MANAGER') || false,
      isAdmin: decodedToken.roles?.includes('ADMIN') || false,
    };
  } catch (error) {
    console.error("Error parsing JWT token:", error);
    // Return default values instead of throwing
    return {
      employeeId: null,
      isManager: false,
      isAdmin: false,
    };
  }
};

export const storeAuthData = (jwtToken: string, msalResponse: AuthenticationResult) => {
  const decodedToken = parseJwtToken(jwtToken);
  
  localStorage.setItem('jwtToken', jwtToken);
  localStorage.setItem('userInfo', JSON.stringify({
    employeeId: decodedToken.employeeId,
    isManager: decodedToken.isManager,
    isAdmin: decodedToken.isAdmin,
    name: msalResponse.account?.name,
    email: msalResponse.account?.username,
  }));
};

export const handleAuthenticationSuccess = (jwtToken: string, msalResponse: AuthenticationResult) => {
  storeAuthData(jwtToken, msalResponse);
};

export const getUserInfoFromStorage = (): {
  employeeId: number | null;
  isManager: boolean;
  isAdmin: boolean;
  name: string | null;
  email: string | null;
} | null => {
  const userInfoStr = localStorage.getItem('userInfo');
  if (!userInfoStr) return null;
  try {
    return JSON.parse(userInfoStr);
  } catch (e) {
    console.error('Error parsing user info from localStorage:', e);
    return null;
  }
};
