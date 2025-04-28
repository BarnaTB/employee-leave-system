
import { useCallback, useContext } from 'react';
import { AuthenticationResult } from '@azure/msal-browser';
import { MsalContext } from '@/providers/MsalProvider';
import { config } from '@/config';
import { authenticateWithBackend } from '@/services/authService';
import { handleAuthenticationSuccess } from '@/utils/tokenUtils';
import { toast } from '@/hooks/use-toast';

export const useTokenAcquisition = () => {
  const { msalInstance, isInitialized } = useContext(MsalContext);

  const acquireToken = useCallback(async () => {
    if (!msalInstance || !isInitialized) {
      throw new Error("MSAL is not initialized");
    }

    try {
      // Try silent token acquisition first
      console.log("Attempting silent token acquisition...");
      console.log("Current environment:", config.environment);
      console.log("Current origin:", window.location.origin);
      console.log("API base URL:", config.api.baseUrl);
      
      const response = await msalInstance.acquireTokenSilent({
        scopes: ["openid", "profile", "email"],
        account: msalInstance.getActiveAccount()!,
      });
      
      console.log("Silent token acquisition successful");
      const jwtToken = await authenticateWithBackend(response);
      handleAuthenticationSuccess(jwtToken, response);
      return { msalResponse: response, jwtToken };
    } catch (error) {
      console.log("Silent token acquisition failed, trying popup", error);
      try {
        // Always use the current origin as the redirect URI for consistency
        const redirectUri = window.location.origin;
        
        console.log("Acquiring token with popup using redirectUri:", redirectUri);
        console.log("Current environment:", config.environment);
        console.log("Valid redirect URIs:", config.msal.validRedirectUris);
        
        // Make sure current origin is in the valid redirectUri list
        if (!config.msal.validRedirectUris.includes(redirectUri)) {
          console.warn("Current origin not in valid redirect URIs list. This may cause issues.");
        }
        
        // Clear any existing interactions first to prevent "interaction_in_progress" errors
        if (msalInstance.getActiveAccount() === null) {
          console.log("No active account, redirecting to login page");
          // No need to continue with popup if there's no active account
          throw new Error("No active account");
        }
        
        const response = await msalInstance.acquireTokenPopup({
          scopes: ["openid", "profile", "email"],
          redirectUri: redirectUri
        });
        
        const jwtToken = await authenticateWithBackend(response);
        handleAuthenticationSuccess(jwtToken, response);
        return { msalResponse: response, jwtToken };
      } catch (popupError) {
        console.error("Failed to acquire token via popup", popupError);
        
        // Show an appropriate error message
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Failed to authenticate. Please try logging in again.",
        });
        
        throw popupError;
      }
    }
  }, [msalInstance, isInitialized]);

  return { acquireToken };
};
