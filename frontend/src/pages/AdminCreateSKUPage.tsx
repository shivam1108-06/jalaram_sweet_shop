import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import CreateSKUForm from '../components/CreateSKUForm'

interface Item {
  id: number
  name: string
  category: string
  sale_type: string
  inventory_unit: string
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export default function AdminCreateSKUPage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch(`${API_URL}/items/list`)
        if (!response.ok) {
          throw new Error('Failed to fetch items')
        }
        const data = await response.json()
        setItems(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }
    fetchItems()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-text-secondary">Loading items...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-error">{error}</p>
        <Link to="/" className="mt-4 text-primary hover:underline">
          Back to Home
        </Link>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-text-secondary">No items found. Create an item first.</p>
        <Link to="/admin/create-item" className="mt-4 text-primary hover:underline">
          Create Item
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <h2 className="text-xl font-semibold text-text-primary mb-6">Add New SKU (Pricing Option)</h2>
      <CreateSKUForm
        items={items}
        onSuccess={() => {
          alert('SKU created successfully!')
        }}
      />
      <p className="mt-4 text-text-muted">
        <Link to="/" className="text-primary hover:underline">
          Back to Home
        </Link>
      </p>
    </div>
  )
}
