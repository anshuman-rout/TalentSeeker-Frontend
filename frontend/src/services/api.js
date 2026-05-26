import axios from "axios";

const API = axios.create({
  baseURL: "http://192.168.7.12:8001",
});

// Attach JWT Token Automatically
API.interceptors.request.use(

  (req) => {

    const token =
      localStorage.getItem(
        "access_token"
      );

    // Add Authorization Header
    if (token) {

      req.headers.Authorization =
        `Bearer ${token}`;
    }

    return req;
  },

  (error) => {
    return Promise.reject(error);
  }
);

export default API;