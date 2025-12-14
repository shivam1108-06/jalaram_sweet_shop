import { useState, useEffect } from 'react'

interface Item {
  id: number
  name: string
  category: string
  sale_type: string
  inventory_unit: string
  inventory_qty: number
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export default function AdminInventoryPage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editQuantity, setEditQuantity] = useState('')

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/items/list`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      if (!response.ok) {
        if (response.status === 401) {
          setError('Unauthorized - Admin access required')
          return
        }
        setError('Failed to load items')
        return
      }
      const data = await response.json()
      setItems(data)
    } catch {
      setError('An error occurred while loading items')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item: Item) => {
    setEditingId(item.id)
    setEditQuantity(item.inventory_qty.toString())
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditQuantity('')
  }

  const handleSave = async (itemId: number) => {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`${API_URL}/items/${itemId}/inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: parseInt(editQuantity) })
      })

      if (response.ok) {
        const updatedItem = await response.json()
        setItems(items.map(item =>
          item.id === itemId ? { ...item, inventory_qty: updatedItem.inventory_qty } : item
        ))
        setEditingId(null)
        setEditQuantity('')
      }
    } catch {
      setError('Failed to update inventory')
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-text-secondary">Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <p className="text-error">{error}</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-text-primary mb-6">Inventory Management</h1>

      <div className="bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead className="bg-secondary/10">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-text-secondary">Item</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-text-secondary">Category</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-text-secondary">Inventory</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-text-secondary">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map(item => (
              <tr key={item.id}>
                <td className="px-6 py-4 text-text-primary font-medium">{item.name}</td>
                <td className="px-6 py-4 text-text-secondary capitalize">{item.category}</td>
                <td className="px-6 py-4">
                  {editingId === item.id ? (
                    <div className="flex items-center gap-2">
                      <label htmlFor={`quantity-${item.id}`} className="sr-only">Quantity</label>
                      <input
                        id={`quantity-${item.id}`}
                        type="number"
                        value={editQuantity}
                        onChange={(e) => setEditQuantity(e.target.value)}
                        className="w-24 px-2 py-1 border border-border rounded"
                        min="0"
                      />
                      <span className="text-text-muted text-sm">{item.inventory_unit}</span>
                    </div>
                  ) : (
                    <span className="text-text-primary">
                      {item.inventory_qty.toLocaleString('en-IN')} {item.inventory_unit}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingId === item.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSave(item.id)}
                        className="px-3 py-1 bg-primary text-white rounded text-sm hover:bg-primary/90"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="px-3 py-1 border border-border rounded text-sm hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEdit(item)}
                      className="px-3 py-1 border border-primary text-primary rounded text-sm hover:bg-primary/10"
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
