
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
      
      // Check for accounts and set an active account if there is one
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length === 0) {
        throw new Error("No accounts found");
      }
      
      if (!msalInstance.getActiveAccount() && accounts.length > 0) {
        msalInstance.setActiveAccount(accounts[0]);
      }
      
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
          console.warn("Current origin not in valid redirect URIs list. Adding it dynamically.");
          config.msal.validRedirectUris.push(redirectUri);
        }
        
        // Clear any existing interactions first to prevent "interaction_in_progress" errors
        try {
          msalInstance.clearCache();
        } catch (e) {
          // Ignore errors when clearing cache
        }
        
        // Check if we have accounts before trying popup
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length === 0) {
          console.log("No accounts found, redirecting to login page");
          throw new Error("No accounts found");
        }
        
        // Set active account if not already set
        if (!msalInstance.getActiveAccount() && accounts.length > 0) {
          msalInstance.setActiveAccount(accounts[0]);
        }
        
        const response = await msalInstance.acquireTokenPopup({
          scopes: ["openid", "profile", "email"],
          redirectUri: redirectUri,
          prompt: "select_account" // Force account selection to avoid no_account_error
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
