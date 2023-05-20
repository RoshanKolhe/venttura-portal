import axios from 'axios';

const baseURL = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:3001/';
// const baseURL = 'http://localhost:3001/';

let headers = {};

if (localStorage.getItem('token')) {
  headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
}

const axiosInstance = axios.create({ baseURL, headers });

// add token
axiosInstance.interceptors.request.use(
  (config) => {
    if (localStorage.getItem('token')) {
      config.headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
