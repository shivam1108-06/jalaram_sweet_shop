import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

interface User {
  email: string
  role: string
  name: string
}

function decodeToken(token: string): User | null {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload))
    return {
      email: decoded.email || '',
      role: decoded.role || 'customer',
      name: decoded.name || decoded.email || ''
    }
  } catch {
    return null
  }
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      const decoded = decodeToken(token)
      setUser(decoded)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refresh_token')
    setUser(null)
    navigate('/')
  }

  const isAdmin = user?.role === 'admin'

  return (
    <header className="bg-primary text-white p-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold">
          Jalaram Sweet Shop
        </Link>

        <nav className="flex items-center gap-4">
          {user ? (
            <>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="px-3 py-1 bg-white/20 rounded hover:bg-white/30"
                >
                  Admin
                </Link>
              )}
              <span className="text-white/80 text-sm">
                {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-1 border border-white/50 rounded hover:bg-white/20"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-3 py-1 hover:bg-white/20 rounded"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-3 py-1 bg-white text-primary rounded hover:bg-white/90"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
