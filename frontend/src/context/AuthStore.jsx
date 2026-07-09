import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router";
import { useCookies } from "react-cookie";
import axios from "axios";
import { saveTokens, clearTokens, getRefreshToken, getAccessToken, } from "../services/api";

const AuthContext = createContext();

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const AuthProvider = ({ children }) => {

  const navigate              = useNavigate();
  const [cookies]             = useCookies(["access_token"]);
  const [isLoggedIn, setIsLoggedIn]   = useState(false);
  const [isChecking, setIsChecking]   = useState(true); // true while startup check runs

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
  // Three cases on startup:
  //
  //   1. access_token cookie present  → already valid, go home
  //   2. access_token missing but refresh_token present
  //      → attempt POST /api/v1/auth/refresh
  //        a. success → save new tokens, go home
  //        b. failure → clear tokens, go to login
  //   3. both missing → go to login immediately

  useEffect(() => {


    const startup = async () => {
      if (cookies.access_token) {
        // Case 1 — valid session
        setIsLoggedIn(true);
        navigate("/", { replace: true });
        setIsChecking(false);
        return;
      }


      const refreshToken = getRefreshToken();
      console.log(refreshToken)
      if (!refreshToken) {
        // Case 3 — nothing to work with
        navigate("/login", { replace: true });
        setIsChecking(false);
        return;
      }

      // Case 2 — try to get a new access token silently
      try {
        const { data } = await axios.post(
          `${BASE_URL}/api/v1/auth/refresh`,
          { refresh_token: refreshToken },
          { headers: { "Content-Type": "application/json" } }
        );

        // console.warn(data)

        saveTokens({
          access_token:  data.access_token,
          refresh_token: data.refresh_token,
        });

        setIsLoggedIn(true);
        navigate("/", { replace: true });
      } catch {
        // Refresh token expired or invalid — force login
        clearTokens();
        console.log("error")
        navigate("/login", { replace: true });
      } finally {
        setIsChecking(false);
      }
    };

    startup();
  }, []);

  // Don't render children until the startup check is complete —
  // prevents a flash of the login page before the refresh succeeds.
  if (isChecking) return null;

  return (
    <AuthContext.Provider value={{ isLoggedIn, handleLogin, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthStore = () => useContext(AuthContext);