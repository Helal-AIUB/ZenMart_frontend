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

// ১. Public Client (কুকি সাপোর্ট সহ)
export const publicClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // 🟢 কুকি পাঠানোর জন্য এটি আবার True করা হলো
  headers: {
    "Content-Type": "application/json",
  },
});

// ২. API Client (কুকি সাপোর্ট সহ)
export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // 🟢 কুকি পাঠানোর জন্য এটিও True
  headers: {
    "Content-Type": "application/json",
  },
});

// 🟢 ব্যাকআপ হিসেবে Header-এও টোকেন পাঠানো (যাতে কোনোভাবেই 401 না আসে)
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

// Auto Logout if Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
      }
    }
    return Promise.reject(error);
  }
);