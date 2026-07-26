import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'https://zenmart-backend.onrender.com/store/',
});