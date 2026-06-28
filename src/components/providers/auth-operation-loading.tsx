"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  AuthOperationOverlay,
  type AuthOperation,
} from "@/components/auth/auth-operation-overlay";
import { usePathname } from "@/i18n/routing";

type AuthOperationLoadingContextValue = {
  startAuthOperation: (operation: AuthOperation) => void;
  stopAuthOperation: () => void;
};

const AuthOperationLoadingContext =
  createContext<AuthOperationLoadingContextValue | null>(null);

export function AuthOperationLoadingProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [operation, setOperation] = useState<AuthOperation | null>(null);
  const operationPathRef = useRef<string | null>(null);

  const startAuthOperation = useCallback(
    (next: AuthOperation) => {
      operationPathRef.current = pathname;
      setOperation(next);
    },
    [pathname],
  );

  const stopAuthOperation = useCallback(() => {
    operationPathRef.current = null;
    setOperation(null);
  }, []);

  useEffect(() => {
    if (
      operation != null &&
      operationPathRef.current != null &&
      pathname !== operationPathRef.current
    ) {
      operationPathRef.current = null;
      setOperation(null);
    }
  }, [operation, pathname]);

  const value = useMemo(
    () => ({ startAuthOperation, stopAuthOperation }),
    [startAuthOperation, stopAuthOperation],
  );

  return (
    <AuthOperationLoadingContext.Provider value={value}>
      {children}
      <AuthOperationOverlay operation={operation} />
    </AuthOperationLoadingContext.Provider>
  );
}

export function useAuthOperationLoading(): AuthOperationLoadingContextValue {
  const context = useContext(AuthOperationLoadingContext);
  if (context == null) {
    throw new Error(
      "useAuthOperationLoading must be used within AuthOperationLoadingProvider",
    );
  }
  return context;
}
