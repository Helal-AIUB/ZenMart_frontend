import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export const publicClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, 
  headers: {
    "Content-Type": "application/json",
  },
});

publicClient.interceptors.request.use((config) => {
  if (config.headers) {
    delete config.headers['Authorization'];
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, 
  headers: {
    "Content-Type": "application/json",
  },
});



//2
// import axios from "axios";

// export const apiClient = axios.create({
//   // baseURL: 'http://127.0.0.1:8000/store/'
//   baseURL: "https://zenmart-backend.onrender.com/store/",
//   withCredentials: true, 
//   headers: {
//     "Content-Type": "application/json",
//   },
// });


//1
// export const apiClient = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://zenmart-backend.onrender.com/store/',
// });
