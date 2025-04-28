
import { AuthenticationResult } from '@azure/msal-browser';

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

export interface BackendAuthResponse {
  token: string;
}

