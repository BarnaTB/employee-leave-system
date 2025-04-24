
import { createRoot } from 'react-dom/client'
import { MsalProvider } from './providers/MsalProvider';
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <MsalProvider>
    <App />
  </MsalProvider>
);
