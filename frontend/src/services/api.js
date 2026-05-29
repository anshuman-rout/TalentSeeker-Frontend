import axios from "axios";

const BASE_URL = "http://192.168.7.12:8001";

const API = axios.create({
  baseURL: BASE_URL,
});

// ── Request interceptor ───────────────────────────────────────────────────────
// Attach the access token to every outgoing request.

API.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor ──────────────────────────────────────────────────────
// On a 401:
//   1. Try POST /api/v1/auth/refresh with the stored refresh token.
//   2. If it succeeds → save the new access token and retry the original request.
//   3. If it fails (refresh token also expired/invalid) → clear storage and
//      redirect to /login so the user is forced to log in again.
//
// _retry flag prevents infinite loops: if the retried request 401s again we
// don't attempt another refresh.

API.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    const is401 = error.response?.status === 401;
    const alreadyRetried = originalRequest._retry;

    if (is401 && !alreadyRetried) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refresh_token");

      if (!refreshToken) {
        // No refresh token at all — force logout
        clearTokensAndRedirect();
        return Promise.reject(error);
      }

      try {
        // POST /api/v1/auth/refresh
        // Using plain axios (not API) to avoid the interceptor triggering
        // on this call itself and causing a loop.
        const { data } = await axios.post(
          `${BASE_URL}/api/v1/auth/refresh`,
          { refresh_token: refreshToken },
          { headers: { "Content-Type": "application/json" } }
        );

        // Save the new access token
        localStorage.setItem("access_token", data.access_token);

        // If the server also returns a new refresh token, rotate it
        if (data.refresh_token) {
          localStorage.setItem("refresh_token", data.refresh_token);
        }

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return API(originalRequest);

      } catch (refreshError) {
        // Refresh token is expired or invalid — force logout
        clearTokensAndRedirect();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Clears localStorage and redirects to login without importing useNavigate
// (interceptors live outside React, so we use window.location directly).
const clearTokensAndRedirect = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  window.location.href = "/login";
};

export default API;