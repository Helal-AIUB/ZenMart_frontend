// import axios from "axios";

// // const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
// const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// export const publicClient = axios.create({
//   baseURL: BASE_URL,
//   withCredentials: true, 
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// publicClient.interceptors.request.use((config) => {
//   if (config.headers) {
//     delete config.headers['Authorization'];
//   }
//   return config;
// }, (error) => {
//   return Promise.reject(error);
// });

// export const apiClient = axios.create({
//   baseURL: BASE_URL,
//   withCredentials: true, 
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const publicClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access");
      if (token) {
        config.headers.Authorization = `JWT ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const hasAuthHeader = error.config.headers && error.config.headers.Authorization;
      
      if (hasAuthHeader && typeof window !== "undefined") {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        window.location.href = "/signin"; 
      }
    }
    return Promise.reject(error);
  }
);