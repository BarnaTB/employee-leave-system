
import { useCallback, useContext } from 'react';
import { MsalContext } from '@/providers/MsalProvider';
import { config } from '@/config';
import { authenticateWithBackend } from '@/services/authService';
import { handleAuthenticationSuccess } from '@/utils/tokenUtils';

export const useAuthOperations = () => {
  const { msalInstance, isInitialized } = useContext(MsalContext);

  const login = useCallback(async () => {
    if (!msalInstance || !isInitialized) {
      throw new Error("MSAL is not initialized");
    }

    try {
      // Always use the current origin as the redirect URI
      const redirectUri = window.location.origin;
      
      console.log("Logging in with redirectUri:", redirectUri);
      console.log("Current environment:", config.environment);
      
      const response = await msalInstance.loginPopup({
        scopes: ["openid", "profile", "email"],
        redirectUri: redirectUri,
      });
      
      const jwtToken = await authenticateWithBackend(response);
      handleAuthenticationSuccess(jwtToken, response);
      return response;
    } catch (error) {
      console.error("Login failed:", error);
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
  }, [msalInstance, isInitialized]);

  return {
    login,
    logout
  };
};
