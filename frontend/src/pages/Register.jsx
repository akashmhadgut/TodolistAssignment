import React, { useState, useEffect } from 'react'
import API from '../services/api'
import { useNavigate, Link } from 'react-router-dom'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  // If user already logged in → go to dashboard
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    API.get('/auth/profile').then(() => navigate('/')).catch(() => {})
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    // --- FRONTEND VALIDATION ---

    // empty fields
    if (!name || !email || !password || !passwordConfirm) {
      setError("Please fill all fields")
      return
    }

    // password length check
    if (password.trim().length < 6) {
      setFieldErrors(prev => ({
        ...prev,
        password: "Password must be at least 6 characters"
      }))
      setError("Please fix the errors below")
      return
    }

    // confirm password match
    if (password !== passwordConfirm) {
      setFieldErrors(prev => ({
        ...prev,
        passwordConfirm: "Passwords do not match"
      }))
      setError("Please fix the errors below")
      return
    }

    try {
      setLoading(true)

      const res = await API.post('/auth/register', {
        name, email, password, passwordConfirm
      })

      localStorage.setItem('token', res.data.token)
      navigate('/')
    } catch (err) {
      if (err?.response?.data?.errors) {
        const errs = {}
        err.response.data.errors.forEach(e => { errs[e.field] = e.message })
        setFieldErrors(errs)
        setError("Please fix the errors below")
      } else {
        setError(err?.response?.data?.message || "Failed to register")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-gray-200 px-4">
      <div className="w-full max-w-md">

        {/* CARD */}
        <div className="bg-white rounded-2xl shadow-xl p-8 transform transition-all">

          <h2 className="text-3xl font-bold text-center mb-1 text-blue-700">Create Account</h2>
          <p className="text-center text-gray-600 mb-6">Join us and start your journey!</p>

          <form onSubmit={submit} className="space-y-4">

            {/* General Error */}
            {error && (
              <div className="text-red-600 bg-red-50 p-2 rounded text-center font-medium mb-3">
                {error}
              </div>
            )}

            {/* NAME */}
            <div>
              <label className="block mb-1 font-semibold text-gray-700">Name</label>
              <input
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-300 transition 
                ${fieldErrors.name ? "border-red-500" : "border-gray-300"}`}
                placeholder="Your full name"
                value={name}
                onChange={e => setName(e.target.value)}
                autoComplete="name"
              />
              {fieldErrors.name && <div className="text-red-600 text-sm">{fieldErrors.name}</div>}
            </div>

            {/* EMAIL */}
            <div>
              <label className="block mb-1 font-semibold text-gray-700">Email</label>
              <input
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-300 transition 
                ${fieldErrors.email ? "border-red-500" : "border-gray-300"}`}
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
              {fieldErrors.email && <div className="text-red-600 text-sm">{fieldErrors.email}</div>}
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block mb-1 font-semibold text-gray-700">Password</label>
              <input
                type="password"
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-300 transition 
                ${fieldErrors.password ? "border-red-500" : "border-gray-300"}`}
                placeholder="Create a password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              {fieldErrors.password && <div className="text-red-600 text-sm">{fieldErrors.password}</div>}
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <label className="block mb-1 font-semibold text-gray-700">Confirm Password</label>
              <input
                type="password"
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-300 transition 
                ${fieldErrors.passwordConfirm ? "border-red-500" : "border-gray-300"}`}
                placeholder="Confirm your password"
                value={passwordConfirm}
                onChange={e => setPasswordConfirm(e.target.value)}
                autoComplete="new-password"
              />
              {fieldErrors.passwordConfirm && (
                <div className="text-red-600 text-sm">{fieldErrors.passwordConfirm}</div>
              )}
            </div>

            {/* BUTTON */}
            <button
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 transition text-white font-semibold py-3 rounded-lg shadow disabled:opacity-70"
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          {/* FOOTER LINK */}
          <p className="text-center text-gray-600 mt-4">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 hover:underline font-semibold"
            >
              Login
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}
