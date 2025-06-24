import axios from "axios";
import store from "../store/store";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API,
  credentials: "include",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "Access-Control-Allow-Credentials": true,
  },
});

api.interceptors.request.use((config) => {
  const access_token = localStorage.getItem("access_token");
  if (access_token) {
    config.headers.Authorization = `Bearer ${access_token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response.status !== 401) {
      throw error;
    }
    const originalRequest = error.config;
    const refresh_token = localStorage.getItem("refresh_token");
    const role = store.getState().common.user?.role;
    if (refresh_token) {
      const { data } = await axios.post(import.meta.env.VITE_API + "/crm/refresh", {
        refresh_token,
        role,
      });
      localStorage.setItem("access_token", data.access_token);

      originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
      return axios(originalRequest);
    }
    throw error;
  }
);
