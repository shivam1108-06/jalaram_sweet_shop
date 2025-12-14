import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

interface Item {
  id: number
  name: string
  category: string
  sale_type: string
  inventory_unit: string
  is_active: boolean
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const categoryLabels: Record<string, string> = {
  dry: 'Dry Sweet',
  milk: 'Milk Sweet',
  other: 'Special'
}

export default function ItemsList() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch(`${API_URL}/items/list`)

        if (!response.ok) {
          setError('Failed to load items')
          return
        }

        const data = await response.json()
        setItems(data)
      } catch {
        setError('Failed to load items')
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="border border-border rounded-lg p-3 animate-pulse">
            <div className="bg-gray-200 h-32 rounded-md mb-3"></div>
            <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
            <div className="bg-gray-200 h-3 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="text-center p-4 text-error">{error}</div>
  }

  if (items.length === 0) {
    return <div className="text-center p-4 text-text-muted">No items available</div>
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <Link
          key={item.id}
          to={`/items/${item.id}`}
          className="border border-border rounded-lg p-3 hover:shadow-lg transition-shadow bg-white group"
        >
          {/* Placeholder Image */}
          <div className="bg-gray-100 h-32 rounded-md mb-3 flex items-center justify-center overflow-hidden">
            <svg
              className="w-16 h-16 text-gray-300 group-hover:scale-110 transition-transform"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>

          {/* Category Badge */}
          <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-accent text-secondary mb-2">
            {categoryLabels[item.category] || item.category}
          </span>

          {/* Item Name */}
          <h3 className="font-semibold text-text-primary group-hover:text-primary transition-colors line-clamp-2">
            {item.name}
          </h3>

          {/* Sale Type Info */}
          <p className="text-xs text-text-muted mt-1">
            Sold by {item.sale_type === 'weight' ? 'weight' : 'piece'}
          </p>

          {/* Price Placeholder */}
          <p className="text-sm font-medium text-primary mt-2">
            View options
          </p>
        </Link>
      ))}
    </div>
  )
}
