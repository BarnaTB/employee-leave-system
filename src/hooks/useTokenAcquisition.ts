
import { useCallback, useContext } from 'react';
import { AuthenticationResult } from '@azure/msal-browser';
import { MsalContext } from '@/providers/MsalProvider';
import { config } from '@/config';
import { authenticateWithBackend } from '@/services/authService';
import { handleAuthenticationSuccess } from '@/utils/tokenUtils';

export const useTokenAcquisition = () => {
  const { msalInstance, isInitialized } = useContext(MsalContext);

  const acquireToken = useCallback(async () => {
    if (!msalInstance || !isInitialized) {
      throw new Error("MSAL is not initialized");
    }

    try {
      const response = await msalInstance.acquireTokenSilent({
        scopes: ["openid", "profile", "email"],
        account: msalInstance.getActiveAccount()!,
      });
      
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
        
        const response = await msalInstance.acquireTokenPopup({
          scopes: ["openid", "profile", "email"],
          redirectUri: redirectUri
        });
        
        const jwtToken = await authenticateWithBackend(response);
        handleAuthenticationSuccess(jwtToken, response);
        return { msalResponse: response, jwtToken };
      } catch (popupError) {
        console.error("Failed to acquire token via popup", popupError);
        throw popupError;
      }
    }
  }, [msalInstance, isInitialized]);

  return { acquireToken };
};
