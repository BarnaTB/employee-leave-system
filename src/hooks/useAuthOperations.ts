
import { useCallback, useContext } from 'react';
import { MsalContext } from '@/providers/MsalProvider';
import { config } from '@/config';
import { authenticateWithBackend } from '@/services/authService';
import { handleAuthenticationSuccess } from '@/utils/tokenUtils';
import { toast } from '@/hooks/use-toast';

export const useAuthOperations = () => {
  const { msalInstance, isInitialized } = useContext(MsalContext);

  const login = useCallback(async () => {
    if (!msalInstance || !isInitialized) {
      throw new Error("MSAL is not initialized");
    }

    try {
      // Clear any existing interactions and cache to ensure a fresh login
      try {
        msalInstance.clearCache();
      } catch (e) {
        // Ignore errors when clearing cache
      }
      
      // Always use the current origin as the redirect URI
      const redirectUri = window.location.origin;
      
      console.log("Logging in with redirectUri:", redirectUri);
      console.log("Current environment:", config.environment);
      console.log("Current API baseUrl:", config.api.baseUrl);
      console.log("Valid redirect URIs:", config.msal.validRedirectUris);
      
      // Make sure current origin is in the valid redirectUri list
      if (!config.msal.validRedirectUris.includes(redirectUri)) {
        console.warn("Current origin not in valid redirect URIs list. Adding it dynamically.");
        // Dynamically add the current origin to validRedirectUris
        config.msal.validRedirectUris.push(redirectUri);
      }
      
      // Try to get active account first
      const account = msalInstance.getAllAccounts()[0];
      if (account) {
        msalInstance.setActiveAccount(account);
      }
      
      const response = await msalInstance.loginPopup({
        scopes: ["openid", "profile", "email"],
        redirectUri: redirectUri,
        prompt: "select_account" // Force account selection to avoid no_account_error
      });
      
      console.log("MSAL login successful, authenticating with backend...");
      const jwtToken = await authenticateWithBackend(response);
      console.log("Backend authentication successful");
      handleAuthenticationSuccess(jwtToken, response);
      return response;
    } catch (error: any) {
      console.error("Login failed:", error);
      
      // Handle no_account_error specifically
      if (error.errorCode === "no_account_error") {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "No account was selected. Please try again and select an account.",
        });
      } else if (error.errorCode === "interaction_in_progress") {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "An authentication process is already in progress. Please complete it or try again later.",
        });
      } else if (error.message?.includes('Network Error') || error.message?.includes('CORS')) {
        toast({
          variant: "destructive",
          title: "Network Error",
          description: `Cannot connect to authentication service at ${config.api.baseUrl} due to CORS or network issues.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: error.message || "Failed to authenticate with Microsoft. Please try again.",
        });
      }
      
      throw error;
    }
  }, [msalInstance, isInitialized]);

  const logout = useCallback(() => {
    if (!msalInstance || !isInitialized) {
      console.warn("MSAL is not initialized");
      return;
    }

    msalInstance.logoutPopup().catch(e => {
      console.error("Logout failed:", e);
    });
    
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userInfo');
    
    // Notify user of successful logout
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  }, [msalInstance, isInitialized]);

  return {
    login,
    logout
  };
};
