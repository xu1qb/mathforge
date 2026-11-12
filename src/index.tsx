import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { AppContainer, ErrorRender } from "@/lib/lark-mock";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider } from "@/auth/AuthProvider";
import { CloudSyncProvider } from "@/auth/CloudSyncProvider";
import { RequireAuth } from "@/auth/RequireAuth";
import { registerSW } from "virtual:pwa-register";
import App from "./app";
import "./index.css";

if (import.meta.env.PROD) {
  registerSW({ immediate: true });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <CloudSyncProvider>
          <HashRouter>
            <RequireAuth>
              <AppContainer>
                <ErrorBoundary
                  fallbackRender={({ error }) => (
                    <ErrorRender error={error as Error} />
                  )}
                >
                  <App />
                </ErrorBoundary>
              </AppContainer>
            </RequireAuth>
          </HashRouter>
        </CloudSyncProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);
