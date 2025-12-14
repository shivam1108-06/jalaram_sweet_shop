import { useState } from 'react'

interface Item {
  id: number
  name: string
  category: string
  sale_type: string
  inventory_unit: string
}

interface CreateSKUFormProps {
  items: Item[]
  onSuccess: () => void
}

interface FormErrors {
  code?: string
  unit_value?: string
  price?: string
  general?: string
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export default function CreateSKUForm({ items, onSuccess }: CreateSKUFormProps) {
  const [itemId, setItemId] = useState(items[0]?.id?.toString() || '')
  const [code, setCode] = useState('')
  const [unitValue, setUnitValue] = useState('')
  const [price, setPrice] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)

  const selectedItem = items.find(item => item.id.toString() === itemId)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!code.trim()) {
      newErrors.code = 'SKU code is required'
    }

    if (!unitValue.trim()) {
      newErrors.unit_value = 'Unit value is required'
    }

    if (!price.trim()) {
      newErrors.price = 'Price is required'
    } else if (parseFloat(price) <= 0) {
      newErrors.price = 'Price must be positive'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    setErrors({})

    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${API_URL}/items/skus`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          item: parseInt(itemId),
          code: code.trim(),
          unit_value: parseInt(unitValue),
          price: parseFloat(price)
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMessage = data.code?.[0] || data.price?.[0] || data.detail || 'Failed to create SKU'
        setErrors({ general: errorMessage })
        return
      }

      setCode('')
      setUnitValue('')
      setPrice('')
      onSuccess()
    } catch {
      setErrors({ general: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
      <div>
        <label htmlFor="item" className="block text-sm font-medium text-text-primary">
          Item
        </label>
        <select
          id="item"
          value={itemId}
          onChange={(e) => setItemId(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {items.map(item => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="code" className="block text-sm font-medium text-text-primary">
          SKU Code
        </label>
        <input
          type="text"
          id="code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="e.g., KK-250"
          className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors.code && <p className="mt-1 text-sm text-error">{errors.code}</p>}
      </div>

      <div>
        <label htmlFor="unit_value" className="block text-sm font-medium text-text-primary">
          Unit Value
          {selectedItem && (
            <span className="ml-2 text-text-secondary font-normal">
              ({selectedItem.sale_type === 'weight' ? 'grams' : 'pieces'})
            </span>
          )}
        </label>
        <input
          type="number"
          id="unit_value"
          value={unitValue}
          onChange={(e) => setUnitValue(e.target.value)}
          placeholder={selectedItem?.sale_type === 'weight' ? 'e.g., 250 (grams)' : 'e.g., 6 (pieces)'}
          className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors.unit_value && <p className="mt-1 text-sm text-error">{errors.unit_value}</p>}
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium text-text-primary">
          Price (₹)
        </label>
        <input
          type="number"
          id="price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="e.g., 450.00"
          step="0.01"
          className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors.price && <p className="mt-1 text-sm text-error">{errors.price}</p>}
      </div>

      {errors.general && (
        <p className="text-sm text-error">{errors.general}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-secondary disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create SKU'}
      </button>
    </form>
  )
}
