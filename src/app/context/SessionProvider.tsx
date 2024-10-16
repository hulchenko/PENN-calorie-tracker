// Context shares data state with entire app

"use client";

import { Session } from "@/types/Session";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState } from "react";

export const SessionProvider = ({ children, initialSession }) => {
  const [session, setSession] = useState<Session | null>(initialSession);

  const authenticated = useRef<boolean>(false); // keep track of the user's authenticated state. Its value persists between renders, unlike useState()
  const router = useRouter();

  const handleAuthenticated = () => {
    if (authenticated.current) {
      // kick out authenticated user to /login on expired session
      router.push("/login");
      setSession(null);
      authenticated.current = false;
    }
  };

  useEffect(() => {
    // initiate session provider
    const getSession = async () => {
      try {
        const response = await fetch("/api/auth/session");
        const curr = await response.json();
        if (response.ok) {
          setSession(curr);
          authenticated.current = true;
        } else {
          setSession(null);
          handleAuthenticated();
        }
      } catch (error) {
        console.error("Error getting session", error);
        setSession(null);
      }
    };

    getSession();

    // set periodic interval to sync session state only if authenticated
    const sessionCheck = setInterval(() => {
      if (authenticated.current) {
        getSession();
      }
    }, 30 * 1000); // every 30 sec
    return () => clearInterval(sessionCheck); // clean up interval
  }, []);

  return (
    <SessionContext.Provider value={{ session, setSession, authenticated }}>
      {children}
    </SessionContext.Provider>
  );
};

const SessionContext = createContext<{
  session: Session | null;
  setSession: (session: Session | null) => void;
  authenticated: React.MutableRefObject<boolean>;
}>({
  session: null,
  setSession: () => {},
  authenticated: { current: false },
}); // define passing value

export const useSession = () => useContext(SessionContext); // expose passing value
