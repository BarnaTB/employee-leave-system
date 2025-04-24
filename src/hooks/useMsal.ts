
import { useState, useEffect, useCallback } from 'react';
import { PublicClientApplication, AuthenticationResult } from '@azure/msal-browser';
import axios from 'axios';

// MSAL configuration
const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_MSAL_CLIENT_ID || 'your-client-id-here',
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: window.location.origin,
  }
};

// Initialize MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

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
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    jwtToken: null,
    msalToken: null,
    employeeId: null,
    isManager: false,
    isAdmin: false,
    userDetails: null,
  });

  // Check if user is authenticated on mount
  useEffect(() => {
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length > 0) {
      // User is signed in, get token and authenticate with backend
      msalInstance.setActiveAccount(accounts[0]);
      acquireToken();
    }
  }, []);

  // Acquire token silently or via popup
  const acquireToken = useCallback(async () => {
    try {
      const response = await msalInstance.acquireTokenSilent({
        scopes: ["openid", "profile", "email"],
        account: msalInstance.getActiveAccount()!,
      });
      
      await authenticateWithBackend(response);
    } catch (error) {
      console.log("Silent token acquisition failed, trying popup", error);
      // Silent acquisition failed, fallback to popup
      try {
        const response = await msalInstance.acquireTokenPopup({
          scopes: ["openid", "profile", "email"],
        });
        
        await authenticateWithBackend(response);
      } catch (popupError) {
        console.error("Failed to acquire token via popup", popupError);
      }
    }
  }, []);

  // Authenticate with our backend using Microsoft token
  const authenticateWithBackend = useCallback(async (msalResponse: AuthenticationResult) => {
    try {
      const response = await axios.post(
        "/api/auth/token",
        {},
        {
          headers: {
            Authorization: `Bearer ${msalResponse.accessToken}`,
          },
        }
      );

      // Parse JWT claims to determine user roles
      // (In a real app, these claims would come from your backend)
      // This is a simplified example
      const jwtToken = response.data.token;
      
      // Decode JWT to get user info (simplified approach)
      // In production, use a proper JWT decoder library
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

      // Store token in local storage for persistence
      localStorage.setItem('jwtToken', jwtToken);
      localStorage.setItem('userInfo', JSON.stringify({
        employeeId: decodedToken.employeeId,
        isManager: decodedToken.roles?.includes('MANAGER') || false,
        isAdmin: decodedToken.roles?.includes('ADMIN') || false,
        name: msalResponse.account?.name,
        email: msalResponse.account?.username,
      }));
    } catch (error) {
      console.error("Error authenticating with backend:", error);
      throw error;
    }
  }, []);

  // Login function
  const login = useCallback(async () => {
    try {
      const response = await msalInstance.loginPopup({
        scopes: ["openid", "profile", "email"],
      });
      
      await authenticateWithBackend(response);
      return response;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }, [authenticateWithBackend]);

  // Logout function
  const logout = useCallback(() => {
    msalInstance.logoutPopup().catch(e => {
      console.error("Logout failed:", e);
    });
    
    // Clear local storage
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userInfo');
    
    // Reset auth state
    setAuthState({
      isAuthenticated: false,
      jwtToken: null,
      msalToken: null,
      employeeId: null,
      isManager: false,
      isAdmin: false,
      userDetails: null,
    });
  }, []);

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
