import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

interface User {
  role: string
  name: string
}

function decodeToken(token: string): User | null {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload))
    return {
      role: decoded.role || 'customer',
      name: decoded.name || decoded.email || ''
    }
  } catch {
    return null
  }
}

export default function AdminDashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    const decoded = decodeToken(token)
    if (!decoded || decoded.role !== 'admin') {
      navigate('/')
      return
    }
    setUser(decoded)
    setLoading(false)
  }, [navigate])

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-text-secondary">Loading...</p>
      </div>
    )
  }

  if (!user) return null

  const adminLinks = [
    { to: '/admin/create-item', title: 'Create Item', description: 'Add new sweet items to the shop' },
    { to: '/admin/create-sku', title: 'Create SKU', description: 'Add pricing options for items' },
    { to: '/admin/inventory', title: 'Manage Inventory', description: 'Update stock levels for items' },
    { to: '/admin/create-cashier', title: 'Create Cashier', description: 'Add new cashier accounts' },
  ]

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-text-primary mb-2">Admin Dashboard</h1>
      <p className="text-text-secondary mb-8">Welcome, {user.name}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {adminLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="block p-6 border border-border rounded-lg hover:border-primary hover:shadow-md transition-all"
          >
            <h2 className="text-lg font-semibold text-text-primary mb-2">{link.title}</h2>
            <p className="text-text-secondary text-sm">{link.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
