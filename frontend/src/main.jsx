import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import API from './services/api'

function ProtectedRoute({ children }) {
  const [status, setStatus] = useState('loading') // loading | ok | no

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return setStatus('no')
    // verify token by fetching profile
    API.get('/auth/profile')
      .then(() => setStatus('ok'))
      .catch(() => {
        localStorage.removeItem('token')
        setStatus('no')
      })
  }, [])

  if (status === 'loading') return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (status === 'no') return <Navigate to="/login" replace />
  return children
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
