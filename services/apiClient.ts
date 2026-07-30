import axios from "axios";

export const apiClient = axios.create({
  // baseURL: 'http://127.0.0.1:8000/store/'
  baseURL: "https://zenmart-backend.onrender.com/store/",
});

// import axios from 'axios';

// export const apiClient = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://zenmart-backend.onrender.com/store/',
// });
