
import React, { ReactNode, useEffect, useState } from "react";
import { PublicClientApplication, AuthenticationResult, LogLevel, BrowserCacheLocation } from "@azure/msal-browser";
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
      // Always use the current origin as the redirect URI for consistency
      const redirectUri = window.location.origin;
      
      console.log("MSAL initializing with redirectUri:", redirectUri);
      console.log("Current origin:", window.location.origin);
      console.log("Current environment:", config.environment);
      console.log("Valid redirect URIs:", config.msal.validRedirectUris);
      
      try {
        // Ensure the current origin is in the validRedirectUris list
        if (!config.msal.validRedirectUris.includes(redirectUri)) {
          console.log("Adding current origin to valid redirect URIs:", redirectUri);
          config.msal.validRedirectUris.push(redirectUri);
        }
        
        const instance = new PublicClientApplication({
          auth: {
            clientId: config.msal.clientId,
            authority: config.msal.authority,
            redirectUri: redirectUri,
            navigateToLoginRequestUrl: true
          },
          cache: {
            cacheLocation: BrowserCacheLocation.LocalStorage, // Changed from SessionStorage to LocalStorage for better persistence
            storeAuthStateInCookie: true
          },
          system: {
            allowRedirectInIframe: true,
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
      } catch (error) {
        console.error("Failed to initialize MSAL:", error);
      }
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
