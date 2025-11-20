import React, { useState, useEffect } from 'react'
import API from '../services/api'
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    API.get('/auth/profile')
      .then(() => navigate('/'))
      .catch(() => {})
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    if (!email || !password) {
      setError('Please enter both email and password')
      return
    }

    try {
      setLoading(true)
      const res = await API.post('/auth/login', { email, password })
      localStorage.setItem('token', res.data.token)
      navigate('/')
    } catch (err) {
      if (err?.response?.data?.errors) {
        const errs = {}
        err.response.data.errors.forEach(e => { errs[e.field] = e.message })
        setFieldErrors(errs)
        setError('Please fix the errors below')
      } else {
         if (err?.response?.data?.message === 'Invalid credentials') {
          setError('Incorrect email or password')
        } else {
          setError(err?.response?.data?.message || 'Login failed')
        }
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-gray-200 px-4">
      <div className="w-full max-w-md">

        <div className="bg-white p-8 rounded-2xl shadow-xl">

          <h2 className="text-3xl font-bold text-center mb-1 text-blue-700">Welcome Back</h2>
          <p className="text-center text-gray-600 mb-6">Login to continue</p>

          <form onSubmit={submit} className="space-y-4">

            {error && (
              <div className="text-red-600 bg-red-50 p-2 rounded text-center font-medium">
                {error}
              </div>
            )}

            {/* EMAIL */}
            <div>
              <label className="block mb-1 font-semibold text-gray-700">Email</label>
              <input
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-300 transition 
                ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
              {fieldErrors.email && (<div className="text-red-600 text-sm">{fieldErrors.email}</div>)}
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block mb-1 font-semibold text-gray-700">Password</label>
              <input
                type="password"
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-300 transition 
                ${fieldErrors.password ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              {fieldErrors.password && (<div className="text-red-600 text-sm">{fieldErrors.password}</div>)}
            </div>

            {/* BUTTON */}
            <button
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 transition text-white font-semibold py-3 rounded-lg shadow disabled:opacity-70"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

          </form>

          {/* FOOTER LINK */}
          <p className="text-center text-gray-600 mt-4">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-600 hover:underline font-semibold">
              Register
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}
