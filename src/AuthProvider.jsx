import {
  useEffect,
  useState,
} from "react";
import LoginModal from "./LoginModal";
import { getJwtPayload, isJwtUnexpired } from "./authSession";
import { AuthContext } from "./AuthContext";

const CUSTOMER_KEY = "customer";
const TOKEN_KEY = "customerToken";

function readStoredSession() {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const customer = JSON.parse(
      localStorage.getItem(CUSTOMER_KEY) || "null"
    );

    if (customer && isJwtUnexpired(token)) {
      return { customer, token };
    }
  } catch {
    // Treat malformed browser storage as a signed-out session.
  }

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(CUSTOMER_KEY);
  return null;
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readStoredSession);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginMode, setLoginMode] = useState("login");

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(CUSTOMER_KEY);
    setSession(null);
  };

  useEffect(() => {
    const syncSession = () => setSession(readStoredSession());
    window.addEventListener("storage", syncSession);
    return () => window.removeEventListener("storage", syncSession);
  }, []);

  useEffect(() => {
    if (!session?.token) return undefined;

    const expiration = getJwtPayload(session.token)?.exp * 1000;
    const delay = Math.max(
      0,
      Math.min(expiration - Date.now(), 2147483647)
    );
    const timer = window.setTimeout(logout, delay);

    return () => window.clearTimeout(timer);
  }, [session?.token]);

  const handleLoginSuccess = (customer, token) => {
    if (!customer || !isJwtUnexpired(token)) {
      logout();
      return;
    }

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customer));
    setSession({ customer, token });
    setLoginOpen(false);
  };

  const requestLogin = (mode = "login") => {
    setLoginMode(mode);
    setLoginOpen(true);
  };

  const updateCustomer = (customer) => {
    if (!customer || !session) return;

    localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customer));
    setSession((current) =>
      current ? { ...current, customer } : current
    );
  };

  const authValue = {
    customer: session?.customer ?? null,
    isAuthenticated: Boolean(
      session && isJwtUnexpired(session.token)
    ),
    loginOpen,
    requestLogin,
    logout,
    updateCustomer,
  };

  return (
    <AuthContext.Provider value={authValue}>
      {children}
      <LoginModal
        show={loginOpen}
        initialMode={loginMode}
        onModeChange={setLoginMode}
        onHide={() => setLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </AuthContext.Provider>
  );
}