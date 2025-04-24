
import { ReactNode, useEffect, useState } from "react";
import { PublicClientApplication, AuthenticationResult } from "@azure/msal-browser";
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
      const instance = new PublicClientApplication({
        auth: {
          clientId: config.msal.clientId,
          authority: config.msal.authority,
          redirectUri: config.msal.redirectUri,
        }
      });

      await instance.initialize();
      setMsalInstance(instance);
      setIsInitialized(true);
    };

    initializeMsal().catch(console.error);
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
