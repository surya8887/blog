import axios from "axios";

export const api = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
});

// Optional: Add response interceptor to handle global errors like 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // We could dispatch a logout action if 401 is received
    return Promise.reject(error);
  }
);
