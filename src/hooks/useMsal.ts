
import { useState, useEffect } from 'react';
import { useTokenAcquisition } from './useTokenAcquisition';
import { useAuthOperations } from './useAuthOperations';
import { getUserInfoFromStorage } from '@/utils/tokenUtils';
import { AuthState } from '@/types/auth';

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
  
  const { acquireToken } = useTokenAcquisition();
  const { login, logout: msalLogout } = useAuthOperations();

  // Load user state from localStorage on initialization
  useEffect(() => {
    const jwtToken = localStorage.getItem('jwtToken');
    const userInfo = getUserInfoFromStorage();
    
    if (jwtToken && userInfo) {
      setAuthState({
        isAuthenticated: true,
        jwtToken,
        msalToken: null, // We don't store the MSAL token in localStorage
        employeeId: userInfo.employeeId,
        isManager: userInfo.isManager,
        isAdmin: userInfo.isAdmin,
        userDetails: {
          name: userInfo.name || '',
          email: userInfo.email || '',
        },
      });
    }
  }, []);

  // Attempt to acquire a token on initialization
  useEffect(() => {
    if (!authState.isAuthenticated) {
      acquireToken().then(({ jwtToken, msalResponse }) => {
        setAuthState({
          isAuthenticated: true,
          jwtToken,
          msalToken: msalResponse.accessToken,
          employeeId: getUserInfoFromStorage()?.employeeId || null,
          isManager: getUserInfoFromStorage()?.isManager || false,
          isAdmin: getUserInfoFromStorage()?.isAdmin || false,
          userDetails: {
            name: msalResponse.account?.name || '',
            email: msalResponse.account?.username || '',
          },
        });
      }).catch(error => {
        // Silent failure is acceptable here as it just means the user isn't logged in
        console.log("No active session found:", error);
      });
    }
  }, [acquireToken, authState.isAuthenticated]);

  const handleLogin = async () => {
    try {
      const msalResponse = await login();
      const userInfo = getUserInfoFromStorage();
      
      if (userInfo) {
        setAuthState({
          isAuthenticated: true,
          jwtToken: localStorage.getItem('jwtToken'),
          msalToken: msalResponse.accessToken,
          employeeId: userInfo.employeeId,
          isManager: userInfo.isManager,
          isAdmin: userInfo.isAdmin,
          userDetails: {
            name: msalResponse.account?.name || '',
            email: msalResponse.account?.username || '',
          },
        });
      }
      
      return msalResponse;
    } catch (error) {
      throw error;
    }
  };

  const handleLogout = () => {
    msalLogout();
    setAuthState({
      isAuthenticated: false,
      jwtToken: null,
      msalToken: null,
      employeeId: null,
      isManager: false,
      isAdmin: false,
      userDetails: null,
    });
  };

  return {
    login: handleLogin,
    logout: handleLogout,
    isAuthenticated: authState.isAuthenticated,
    jwtToken: authState.jwtToken,
    employeeId: authState.employeeId,
    isManager: authState.isManager,
    isAdmin: authState.isAdmin,
    userDetails: authState.userDetails,
  };
};
