import { useState } from 'react'

interface CreateItemFormProps {
  onSuccess: () => void
}

interface FormErrors {
  name?: string
  category?: string
  sale_type?: string
  general?: string
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export default function CreateItemForm({ onSuccess }: CreateItemFormProps) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('dry')
  const [saleType, setSaleType] = useState('weight')
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!name.trim()) {
      newErrors.name = 'Name is required'
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
      const response = await fetch(`${API_URL}/items/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, category, sale_type: saleType }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMessage = data.name?.[0] || data.detail || 'Failed to create item'
        setErrors({ general: errorMessage })
        return
      }

      setName('')
      setCategory('dry')
      setSaleType('weight')
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
        <label htmlFor="name" className="block text-sm font-medium text-text-primary">
          Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors.name && <p className="mt-1 text-sm text-error">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-text-primary">
          Category
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="dry">Dry</option>
          <option value="milk">Milk</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="sale_type" className="block text-sm font-medium text-text-primary">
          Sale Type
        </label>
        <select
          id="sale_type"
          value={saleType}
          onChange={(e) => setSaleType(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="weight">Weight (sold by grams)</option>
          <option value="count">Count (sold by pieces)</option>
        </select>
      </div>

      {errors.general && (
        <p className="text-sm text-error">{errors.general}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-secondary disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create Item'}
      </button>
    </form>
  )
}
