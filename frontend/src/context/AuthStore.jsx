import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router";
import { useCookies } from "react-cookie";
import { saveTokens, clearTokens } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const navigate   = useNavigate();
  const [cookies]  = useCookies(["access_token"]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ── Login ─────────────────────────────────────────────────────────────────

  const handleLogin = (data) => {
    saveTokens({
      access_token:  data.access_token,
      refresh_token: data.refresh_token,
    });
    setIsLoggedIn(true);
    navigate("/", { replace: true });
  };

  // ── Logout ────────────────────────────────────────────────────────────────

  const handleLogout = () => {
    clearTokens();
    setIsLoggedIn(false);
    navigate("/login", { replace: true });
  };

  // ── Mount check ───────────────────────────────────────────────────────────
  // useCookies keeps cookies.access_token in sync with the actual cookie.
  // If the cookie has expired the browser deletes it and cookies.access_token
  // becomes undefined — so this correctly redirects to login on expiry.

  useEffect(() => {
    if (cookies.access_token) {
      setIsLoggedIn(true);
      navigate("/", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, handleLogin, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthStore = () => useContext(AuthContext);