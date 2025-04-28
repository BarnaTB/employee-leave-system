
import { useContext, useState, useEffect, useCallback } from 'react';
import { AuthenticationResult } from '@azure/msal-browser';
import { config } from '@/config';
import { MsalContext } from '@/providers/MsalProvider';
import { AuthState } from '@/types/auth';
import { authenticateWithBackend } from '@/services/authService';
import { parseJwtToken, storeAuthData } from '@/utils/tokenUtils';

export const useMsal = () => {
  const { msalInstance, isInitialized } = useContext(MsalContext);
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    jwtToken: null,
    msalToken: null,
    employeeId: null,
    isManager: false,
    isAdmin: false,
    userDetails: null,
  });

  const handleAuthenticationSuccess = useCallback(async (msalResponse: AuthenticationResult) => {
    const jwtToken = await authenticateWithBackend(msalResponse);
    const decodedToken = parseJwtToken(jwtToken);
    
    storeAuthData(jwtToken, msalResponse);
    
    setAuthState({
      isAuthenticated: true,
      jwtToken,
      msalToken: msalResponse.accessToken,
      employeeId: decodedToken.employeeId || null,
      isManager: decodedToken.isManager || false,
      isAdmin: decodedToken.isAdmin || false,
      userDetails: {
        name: msalResponse.account?.name || '',
        email: msalResponse.account?.username || '',
      },
    });
  }, []);

  const acquireToken = useCallback(async () => {
    if (!msalInstance || !isInitialized) {
      throw new Error("MSAL is not initialized");
    }

    try {
      const response = await msalInstance.acquireTokenSilent({
        scopes: ["openid", "profile", "email"],
        account: msalInstance.getActiveAccount()!,
      });
      
      await handleAuthenticationSuccess(response);
      return response;
    } catch (error) {
      console.log("Silent token acquisition failed, trying popup", error);
      try {
        const isLocalDev = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1';
        
        const redirectUri = isLocalDev ? 
          `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}` : 
          config.msal.redirectUri;
        
        console.log("Acquiring token with popup using redirectUri:", redirectUri);
        
        const response = await msalInstance.acquireTokenPopup({
          scopes: ["openid", "profile", "email"],
          redirectUri: redirectUri
        });
        
        await handleAuthenticationSuccess(response);
        return response;
      } catch (popupError) {
        console.error("Failed to acquire token via popup", popupError);
        throw popupError;
      }
    }
  }, [msalInstance, isInitialized, handleAuthenticationSuccess]);

  useEffect(() => {
    if (msalInstance && isInitialized) {
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        msalInstance.setActiveAccount(accounts[0]);
        acquireToken().catch(error => {
          console.error("Failed to acquire token on initialization:", error);
        });
      }
    }
  }, [msalInstance, isInitialized, acquireToken]);

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
      
      await handleAuthenticationSuccess(response);
      return response;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }, [msalInstance, isInitialized, handleAuthenticationSuccess]);

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
    
    setAuthState({
      isAuthenticated: false,
      jwtToken: null,
      msalToken: null,
      employeeId: null,
      isManager: false,
      isAdmin: false,
      userDetails: null,
    });
  }, [msalInstance, isInitialized]);

  return {
    login,
    logout,
    isAuthenticated: authState.isAuthenticated,
    jwtToken: authState.jwtToken,
    employeeId: authState.employeeId,
    isManager: authState.isManager,
    isAdmin: authState.isAdmin,
    userDetails: authState.userDetails,
  };
};

