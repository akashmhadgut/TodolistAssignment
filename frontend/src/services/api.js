import axios from 'axios'

// Use Vite's environment variables via import.meta.env in the browser
const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' })

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers['Authorization'] = `Bearer ${token}`
  return config
})

export default API
