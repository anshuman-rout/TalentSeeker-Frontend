import axios from "axios";
import Cookies from "universal-cookie";
import { jwtDecode } from "jwt-decode";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const cookies = new Cookies();

// Cookie options — add Secure: true when deployed over HTTPS
const COOKIE_OPTIONS = {
  path:     "/",
  sameSite: "strict",
  // secure: true,   // uncomment when on HTTPS
};
const getMaxAge = (token) => {
  const decoded = jwtDecode(token);
  const now = Math.floor(Date.now() / 1000);
  return decoded.exp - now;
};


export const saveTokens = ({ access_token, refresh_token }) => {
  cookies.set("access_token",  access_token,  { ...COOKIE_OPTIONS, maxAge: getMaxAge(access_token) });
  cookies.set("refresh_token", refresh_token, { ...COOKIE_OPTIONS,  maxAge: getMaxAge(refresh_token) });

  // document.cookie = `access_token=${access_token}; ${COOKIE_OPTIONS.path} ; ${COOKIE_OPTIONS.sameSite} ; maxAge: ${getMaxAge(access_token)}`;
  // document.cookie = `access_token=${refresh_token}; ${COOKIE_OPTIONS.path} ; ${COOKIE_OPTIONS.sameSite} ; maxAge: ${getMaxAge(refresh_token)}`;
  // console.log("saved")
};

export const clearTokens = () => {
  cookies.remove("access_token",  { path: "/" });
  cookies.remove("refresh_token", { path: "/" });
};

export const getAccessToken  = () => cookies.get("access_token");
export const getRefreshToken = () => cookies.get("refresh_token");

// ─── Axios instance ───────────────────────────────────────────────────────────

const API = axios.create({ baseURL: BASE_URL }); 



// ── Request interceptor ───────────────────────────────────────────────────────

API.interceptors.request.use(
  (req) => {
    const token = getAccessToken();
    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor ──────────────────────────────────────────────────────

API.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;
    const is401           = error.response?.status === 401;
    const alreadyRetried  = originalRequest._retry;

    if (is401 && !alreadyRetried) {
      originalRequest._retry = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        clearTokensAndRedirect();
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(
          `${BASE_URL}/api/v1/auth/refresh`,
          { refresh_token: refreshToken },
          { headers: { "Content-Type": "application/json" } }
        );

        saveTokens({
          access_token:  data.access_token,
          refresh_token: data.refresh_token,
        });

        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return API(originalRequest);

      } catch (refreshError) {
        clearTokensAndRedirect();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

const clearTokensAndRedirect = () => {
  clearTokens();
  window.location.href = "/login";
};

export default API;