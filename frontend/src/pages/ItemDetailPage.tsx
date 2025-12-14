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
  inventory_qty: number
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
  const [buyingSkuId, setBuyingSkuId] = useState<number | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [purchaseStatus, setPurchaseStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [purchasing, setPurchasing] = useState(false)

  const isLoggedIn = !!localStorage.getItem('token')

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

  const handleBuyClick = (skuId: number) => {
    setBuyingSkuId(skuId)
    setQuantity(1)
    setPurchaseStatus(null)
  }

  const handleCancelBuy = () => {
    setBuyingSkuId(null)
    setQuantity(1)
  }

  const handlePurchase = async (sku: SKU) => {
    const token = localStorage.getItem('token')
    if (!token) {
      setPurchaseStatus({ type: 'error', message: 'Please login to make a purchase' })
      return
    }

    setPurchasing(true)
    try {
      const response = await fetch(`${API_URL}/items/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ sku_id: sku.id, quantity })
      })

      const data = await response.json()

      if (response.ok) {
        const totalPrice = parseFloat(data.total_price).toLocaleString('en-IN')
        setPurchaseStatus({
          type: 'success',
          message: `Purchase successful! ${quantity}x ${sku.display_unit} for Rs.${totalPrice}`
        })
        setBuyingSkuId(null)
        const itemResponse = await fetch(`${API_URL}/items/${id}`)
        if (itemResponse.ok) {
          setItem(await itemResponse.json())
        }
      } else {
        setPurchaseStatus({ type: 'error', message: data.error || 'Purchase failed' })
      }
    } catch {
      setPurchaseStatus({ type: 'error', message: 'An error occurred during purchase' })
    } finally {
      setPurchasing(false)
    }
  }

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

  const isOutOfStock = item.inventory_qty === 0

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <nav className="mb-6">
        <Link to="/" className="text-primary hover:underline">Home</Link>
        <span className="mx-2 text-text-muted">/</span>
        <span className="text-text-secondary">{item.name}</span>
      </nav>

      {purchaseStatus && (
        <div className={`mb-6 p-4 rounded-lg ${purchaseStatus.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {purchaseStatus.message}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="w-full md:w-1/3">
          <div className="aspect-square bg-secondary/10 rounded-lg flex items-center justify-center">
            <span className="text-6xl">🍬</span>
          </div>
        </div>

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
          {isOutOfStock && (
            <p className="mt-4 text-red-600 font-semibold">Out of Stock</p>
          )}
        </div>
      </div>

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
                  Rs.{parseFloat(sku.price).toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-text-muted mt-1">SKU: {sku.code}</p>

                {buyingSkuId === sku.id ? (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <label htmlFor={`qty-${sku.id}`} className="text-sm text-text-secondary">Qty:</label>
                      <input
                        id={`qty-${sku.id}`}
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-16 px-2 py-1 border border-border rounded text-center"
                      />
                    </div>
                    <p className="text-sm text-text-secondary">
                      Total: Rs.{(parseFloat(sku.price) * quantity).toLocaleString('en-IN')}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePurchase(sku)}
                        disabled={purchasing}
                        className="flex-1 px-3 py-2 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50"
                      >
                        {purchasing ? 'Processing...' : 'Confirm'}
                      </button>
                      <button
                        onClick={handleCancelBuy}
                        className="px-3 py-2 border border-border rounded hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleBuyClick(sku.id)}
                    disabled={isOutOfStock || !isLoggedIn}
                    className="mt-4 w-full px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isOutOfStock ? 'Out of Stock' : isLoggedIn ? 'Buy' : 'Login to Buy'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8">
        <Link to="/" className="text-primary hover:underline">
          Back to all sweets
        </Link>
      </div>
    </div>
  )
}
