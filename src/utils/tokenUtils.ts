
import { AuthState } from '@/types/auth';
import { AuthenticationResult } from '@azure/msal-browser';

export const parseJwtToken = (jwtToken: string): Partial<AuthState> => {
  try {
    const base64Url = jwtToken.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    const decodedToken = JSON.parse(jsonPayload);
    
    return {
      employeeId: decodedToken.employeeId || null,
      isManager: decodedToken.roles?.includes('MANAGER') || false,
      isAdmin: decodedToken.roles?.includes('ADMIN') || false,
    };
  } catch (error) {
    console.error("Error parsing JWT token:", error);
    throw new Error("Invalid token format received from server");
  }
};

export const storeAuthData = (jwtToken: string, msalResponse: AuthenticationResult) => {
  const decodedToken = parseJwtToken(jwtToken);
  
  localStorage.setItem('jwtToken', jwtToken);
  localStorage.setItem('userInfo', JSON.stringify({
    employeeId: decodedToken.employeeId,
    isManager: decodedToken.isManager,
    isAdmin: decodedToken.isAdmin,
    name: msalResponse.account?.name,
    email: msalResponse.account?.username,
  }));
};

export const handleAuthenticationSuccess = (jwtToken: string, msalResponse: AuthenticationResult) => {
  storeAuthData(jwtToken, msalResponse);
};

export const getUserInfoFromStorage = (): {
  employeeId: number | null;
  isManager: boolean;
  isAdmin: boolean;
  name: string | null;
  email: string | null;
} | null => {
  const userInfoStr = localStorage.getItem('userInfo');
  if (!userInfoStr) return null;
  try {
    return JSON.parse(userInfoStr);
  } catch (e) {
    console.error('Error parsing user info from localStorage:', e);
    return null;
  }
};
