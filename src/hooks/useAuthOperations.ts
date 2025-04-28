
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
      const isLocalDev = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1';
      
      const redirectUri = isLocalDev ? 
        `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}` : 
        config.msal.redirectUri;
      
      console.log("Logging in with redirectUri:", redirectUri);
      
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
