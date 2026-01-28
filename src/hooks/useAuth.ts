import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { getToken, setToken as saveToken, clearToken } from "../lib/config.ts";
import { startAuthFlow } from "../lib/auth.ts";
import type { DeviceCodeResponse } from "../types/github.ts";

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  deviceCode: DeviceCodeResponse | null;
  error: string | null;
  login: () => void;
  logout: () => void;
}

interface AuthContextType extends AuthState {}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuthProvider(): AuthState {
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deviceCode, setDeviceCode] = useState<DeviceCodeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = getToken();
    if (savedToken) {
      setTokenState(savedToken);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setDeviceCode(null);

    startAuthFlow({
      onDeviceCode: (code) => {
        setDeviceCode(code);
      },
      onPolling: () => {
        // Could update UI to show polling status
      },
      onSlowDown: () => {
        // Could show "slowing down" message
      },
      onSuccess: (newToken) => {
        saveToken(newToken);
        setTokenState(newToken);
        setDeviceCode(null);
        setIsLoading(false);
      },
      onError: (err) => {
        setError(err);
        setDeviceCode(null);
        setIsLoading(false);
      },
    });
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setTokenState(null);
    setDeviceCode(null);
    setError(null);
  }, []);

  return {
    isAuthenticated: !!token,
    isLoading,
    token,
    deviceCode,
    error,
    login,
    logout,
  };
}

export { AuthContext };

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
