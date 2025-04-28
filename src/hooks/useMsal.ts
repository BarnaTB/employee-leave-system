
import { useContext, useState, useEffect, useCallback } from 'react';
import { AuthenticationResult } from '@azure/msal-browser';
import axios from 'axios';
import { config } from '@/config';
import { MsalContext } from '@/providers/MsalProvider';
import { toast } from "@/hooks/use-toast";

export interface AuthState {
  isAuthenticated: boolean;
  jwtToken: string | null;
  msalToken: string | null;
  employeeId: number | null;
  isManager: boolean;
  isAdmin: boolean;
  userDetails: {
    name: string;
    email: string;
  } | null;
}

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
  }, [msalInstance, isInitialized]);

  const acquireToken = useCallback(async () => {
    if (!msalInstance || !isInitialized) {
      throw new Error("MSAL is not initialized");
    }

    try {
      const response = await msalInstance.acquireTokenSilent({
        scopes: ["openid", "profile", "email"],
        account: msalInstance.getActiveAccount()!,
      });
      
      await authenticateWithBackend(response);
      return response;
    } catch (error) {
      console.log("Silent token acquisition failed, trying popup", error);
      try {
        // Get current URL to use as redirect URI for local environment
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
        
        await authenticateWithBackend(response);
        return response;
      } catch (popupError) {
        console.error("Failed to acquire token via popup", popupError);
        throw popupError;
      }
    }
  }, [msalInstance, isInitialized]);

  const authenticateWithBackend = useCallback(async (msalResponse: AuthenticationResult) => {
    try {
      console.log("Authenticating with backend using token:", msalResponse.accessToken.substring(0, 10) + "...");
      console.log("Backend API URL:", `${config.api.baseUrl}/auth/token`);
      
      // Changed from POST to GET to match the backend controller
      const response = await axios.get(
        `${config.api.baseUrl}/auth/token`,
        {
          headers: {
            'Authorization': `Bearer ${msalResponse.accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );

      console.log("Backend authentication successful", response.data);
      const jwtToken = response.data.token;
      
      try {
        const base64Url = jwtToken.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const decodedToken = JSON.parse(jsonPayload);
        
        setAuthState({
          isAuthenticated: true,
          jwtToken,
          msalToken: msalResponse.accessToken,
          employeeId: decodedToken.employeeId || null,
          isManager: decodedToken.roles?.includes('MANAGER') || false,
          isAdmin: decodedToken.roles?.includes('ADMIN') || false,
          userDetails: {
            name: msalResponse.account?.name || '',
            email: msalResponse.account?.username || '',
          },
        });

        localStorage.setItem('jwtToken', jwtToken);
        localStorage.setItem('userInfo', JSON.stringify({
          employeeId: decodedToken.employeeId,
          isManager: decodedToken.roles?.includes('MANAGER') || false,
          isAdmin: decodedToken.roles?.includes('ADMIN') || false,
          name: msalResponse.account?.name,
          email: msalResponse.account?.username,
        }));
      } catch (tokenError) {
        console.error("Error parsing JWT token:", tokenError);
        throw new Error("Invalid token format received from server");
      }
    } catch (error: any) {
      console.error("Error authenticating with backend:", error);
      
      // Check if it's a CORS error
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
  }, []);

  const login = useCallback(async () => {
    if (!msalInstance || !isInitialized) {
      throw new Error("MSAL is not initialized");
    }

    try {
      // Get current URL to use as redirect URI for local environment
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
      
      await authenticateWithBackend(response);
      return response;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }, [msalInstance, isInitialized, authenticateWithBackend]);

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
