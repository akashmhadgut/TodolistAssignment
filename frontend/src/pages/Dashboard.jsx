import React, { useEffect, useState } from 'react'
import API from '../services/api'
import { Search } from 'lucide-react' // <--- install: npm i lucide-react

export default function Dashboard() {
  const [profile, setProfile] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [q, setQ] = useState('')

  const [addError, setAddError] = useState(null)
  const [addFieldErrors, setAddFieldErrors] = useState({})

  const [editingTask, setEditingTask] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editError, setEditError] = useState(null)
  const [editFieldErrors, setEditFieldErrors] = useState({})

  const fetchProfile = async () => {
    try {
      const res = await API.get('/auth/profile')
      setProfile(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchTasks = async (search) => {
    try {
      setLoading(true)
      const res = await API.get('/tasks', { params: { q: search } })
      setTasks(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
    fetchTasks()
  }, [])

  const addTask = async (e) => {
    e.preventDefault()
    setAddError(null)
    setAddFieldErrors({})
    try {
      await API.post('/tasks', { title, description })
      setTitle('')
      setDescription('')
      fetchTasks(q)
    } catch (err) {
      if (err?.response?.data?.errors) {
        const errs = {}
        err.response.data.errors.forEach(e => errs[e.field] = e.message)
        setAddFieldErrors(errs)
        setAddError('Please fix errors below')
      } else {
        setAddError('Failed to add task')
      }
    }
  }

  const toggleComplete = async (task) => {
    try {
      await API.put(`/tasks/${task._id}`, { completed: !task.completed })
      fetchTasks(q)
    } catch (err) { console.error(err) }
  }

  const remove = async (id) => {
    try {
      await API.delete(`/tasks/${id}`)
      fetchTasks(q)
    } catch (err) { console.error(err) }
  }

  const openEdit = (task) => {
    setEditingTask(task)
    setEditTitle(task.title)
    setEditDescription(task.description || '')
  }

  const saveEdit = async (e) => {
    e.preventDefault()
    setEditError(null)
    setEditFieldErrors({})

    try {
      await API.put(`/tasks/${editingTask._id}`, {
        title: editTitle,
        description: editDescription
      })
      setEditingTask(null)
      fetchTasks(q)
    } catch (err) {
      if (err?.response?.data?.errors) {
        const errs = {}
        err.response.data.errors.forEach(e => errs[e.field] = e.message)
        setEditFieldErrors(errs)
        setEditError('Fix errors below')
      } else {
        setEditError('Failed to update task')
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-blue-700">Dashboard</h1>
          <div className="flex items-center gap-3">
            <span className="font-medium text-gray-700">{profile?.name}</span>
            <button 
              onClick={logout} 
              className="bg-red-500 hover:bg-red-600 transition text-white px-3 py-1 rounded-lg shadow"
            >
              Logout
            </button>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="relative mb-5">
          <Search className="absolute left-3 top-2.5 text-gray-500" size={20} />
          <input 
            placeholder="Search tasks..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-300 transition"
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchTasks(q)}
          />
        </div>

        {/* ADD TASK */}
        <div className="bg-white p-5 rounded-xl shadow mb-6">
          <h2 className="text-xl font-semibold mb-3">Add New Task</h2>

          <form onSubmit={addTask} className="flex flex-col gap-3">

            <div>
              <input 
                className={`w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-200 
                ${addFieldErrors.title ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Task title"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
              {addFieldErrors.title && (
                <div className="text-red-600 text-sm">{addFieldErrors.title}</div>
              )}
            </div>

            <div>
              <input 
                className={`w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-200 
                ${addFieldErrors.description ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Description (optional)"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
              {addFieldErrors.description && (
                <div className="text-red-600 text-sm">{addFieldErrors.description}</div>
              )}
            </div>

            <button 
              className="bg-blue-600 hover:bg-blue-700 transition text-white font-semibold px-5 py-2 rounded-lg shadow"
            >
              Add Task
            </button>

            {addError && <div className="text-red-600 text-sm">{addError}</div>}
          </form>
        </div>

        {/* TASK LIST */}
        <div className="bg-white p-5 rounded-xl shadow">

          {loading ? (
            <div className="text-center text-gray-500 py-4 text-lg">
              Loading tasks...
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-gray-600 text-center py-4">No tasks found</div>
          ) : (
            tasks.map(t => (
              <div 
                key={t._id} 
                className="flex items-center justify-between py-3 border-b last:border-0"
              >
                <div>
                  <div className={`text-lg font-medium ${t.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                    {t.title}
                  </div>
                  {t.description && (
                    <div className="text-sm text-gray-500">{t.description}</div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => toggleComplete(t)}
                    className="px-3 py-1 rounded-lg text-white shadow bg-green-500 hover:bg-green-600 transition"
                  >
                    {t.completed ? 'Undo' : 'Done'}
                  </button>

                  <button 
                    onClick={() => openEdit(t)}
                    className="px-3 py-1 rounded-lg text-white shadow bg-yellow-500 hover:bg-yellow-600 transition"
                  >
                    Edit
                  </button>

                  <button 
                    onClick={() => remove(t._id)}
                    className="px-3 py-1 rounded-lg text-white shadow bg-red-500 hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}

        </div>
      </div>

      {/* EDIT MODAL */}
      {editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow max-w-md w-full animate-fadeIn">
            <h2 className="text-xl font-semibold mb-4">Edit Task</h2>

            <form onSubmit={saveEdit} className="flex flex-col gap-3">

              <div>
                <input 
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-300 
                  ${editFieldErrors.title ? 'border-red-500' : 'border-gray-300'}`}
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  placeholder="Task title"
                />
                {editFieldErrors.title && (
                  <div className="text-red-600 text-sm">{editFieldErrors.title}</div>
                )}
              </div>

              <div>
                <input 
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-300 
                  ${editFieldErrors.description ? 'border-red-500' : 'border-gray-300'}`}
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  placeholder="Description"
                />
                {editFieldErrors.description && (
                  <div className="text-red-600 text-sm">{editFieldErrors.description}</div>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <button 
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>

                <button 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                >
                  Save
                </button>
              </div>

              {editError && <div className="text-red-600 text-sm">{editError}</div>}
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
