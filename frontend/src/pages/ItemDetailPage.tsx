import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

interface SKU {
  id: number
  code: string
  unit_value: number
  price: string
  display_unit: string
}

interface Item {
  id: number
  name: string
  category: string
  sale_type: string
  inventory_unit: string
  skus: SKU[]
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const categoryLabels: Record<string, string> = {
  dry: 'Dry Sweet',
  milk: 'Milk Sweet',
  other: 'Special'
}

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [item, setItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await fetch(`${API_URL}/items/${id}`)
        if (!response.ok) {
          if (response.status === 404) {
            setError('Item not found')
          } else {
            setError('Failed to load item')
          }
          return
        }
        const data = await response.json()
        setItem(data)
      } catch {
        setError('An error occurred while loading the item')
      } finally {
        setLoading(false)
      }
    }
    fetchItem()
  }, [id])

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-text-secondary">Loading...</p>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="p-8">
        <p className="text-error">{error || 'Item not found'}</p>
        <Link to="/" className="mt-4 inline-block text-primary hover:underline">
          Back to Home
        </Link>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <Link to="/" className="text-primary hover:underline">Home</Link>
        <span className="mx-2 text-text-muted">/</span>
        <span className="text-text-secondary">{item.name}</span>
      </nav>

      {/* Item Header */}
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        {/* Placeholder Image */}
        <div className="w-full md:w-1/3">
          <div className="aspect-square bg-secondary/10 rounded-lg flex items-center justify-center">
            <span className="text-6xl">🍬</span>
          </div>
        </div>

        {/* Item Info */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-text-primary mb-2">{item.name}</h1>
          <span className="inline-block px-3 py-1 text-sm rounded-full bg-accent/20 text-accent mb-4">
            {categoryLabels[item.category] || item.category}
          </span>
          <p className="text-text-secondary mb-2">
            Sold by: <span className="font-medium">{item.sale_type === 'weight' ? 'Weight' : 'Count'}</span>
          </p>
          <p className="text-text-secondary">
            Unit: <span className="font-medium">{item.inventory_unit}</span>
          </p>
        </div>
      </div>

      {/* SKUs / Pricing Options */}
      <div>
        <h2 className="text-xl font-semibold text-text-primary mb-4">Available Options</h2>
        {item.skus.length === 0 ? (
          <p className="text-text-muted">No pricing options available</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {item.skus.map((sku) => (
              <div
                key={sku.id}
                className="border border-border rounded-lg p-4 hover:border-primary transition-colors"
              >
                <p className="text-lg font-medium text-text-primary">{sku.display_unit}</p>
                <p className="text-2xl font-bold text-primary mt-2">
                  ₹{parseFloat(sku.price).toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-text-muted mt-1">SKU: {sku.code}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Back Link */}
      <div className="mt-8">
        <Link to="/" className="text-primary hover:underline">
          ← Back to all sweets
        </Link>
      </div>
    </div>
  )
}
