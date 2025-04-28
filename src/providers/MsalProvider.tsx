
import React, { ReactNode, useEffect, useState } from "react";
import { PublicClientApplication, AuthenticationResult, LogLevel } from "@azure/msal-browser";
import { config } from "@/config";

// Create a React context to hold the initialized MSAL instance
export const MsalContext = React.createContext<{
  msalInstance: PublicClientApplication | null;
  isInitialized: boolean;
}>({
  msalInstance: null,
  isInitialized: false,
});

interface MsalProviderProps {
  children: ReactNode;
}

export const MsalProvider = ({ children }: MsalProviderProps) => {
  const [msalInstance, setMsalInstance] = useState<PublicClientApplication | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeMsal = async () => {
      // Determine if running in Docker container or local environment
      const isDocker = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
      
      const redirectUri = isDocker ? config.msal.redirectUriForDocker : config.msal.redirectUri;
      
      console.log("MSAL initializing with redirectUri:", redirectUri);
      console.log("Current origin:", window.location.origin);
      
      const instance = new PublicClientApplication({
        auth: {
          clientId: config.msal.clientId,
          authority: config.msal.authority,
          redirectUri: redirectUri,
        },
        cache: {
          cacheLocation: "sessionStorage",
          storeAuthStateInCookie: true
        },
        system: {
          loggerOptions: {
            loggerCallback: (level, message, containsPii) => {
              if (containsPii) {
                return;
              }
              switch (level) {
                case LogLevel.Error:
                  console.error('MSAL:', message);
                  break;
                case LogLevel.Warning:
                  console.warn('MSAL:', message);
                  break;
                case LogLevel.Info:
                  console.info('MSAL:', message);
                  break;
                case LogLevel.Verbose:
                  console.debug('MSAL:', message);
                  break;
                default:
                  console.log('MSAL:', message);
              }
            },
            logLevel: LogLevel.Verbose
          }
        }
      });

      await instance.initialize();
      setMsalInstance(instance);
      setIsInitialized(true);
      
      console.log("MSAL initialized successfully");
    };

    initializeMsal().catch(error => {
      console.error("Failed to initialize MSAL:", error);
    });
  }, []);

  if (!isInitialized) {
    return <div>Initializing authentication...</div>;
  }

  return (
    <MsalContext.Provider value={{ msalInstance, isInitialized }}>
      {children}
    </MsalContext.Provider>
  );
};
