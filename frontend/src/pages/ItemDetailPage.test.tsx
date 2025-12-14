import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ItemDetailPage from './ItemDetailPage'

const mockItem = {
  id: 1,
  name: 'Kaju Katli',
  category: 'dry',
  sale_type: 'weight',
  inventory_unit: 'grams',
  skus: [
    { id: 1, code: 'KK-250', unit_value: 250, price: '450.00', display_unit: '250g' },
    { id: 2, code: 'KK-500', unit_value: 500, price: '900.00', display_unit: '500g' },
    { id: 3, code: 'KK-1000', unit_value: 1000, price: '1800.00', display_unit: '1.0kg' },
  ]
}

const renderWithRouter = (itemId: string) => {
  return render(
    <MemoryRouter initialEntries={[`/items/${itemId}`]}>
      <Routes>
        <Route path="/items/:id" element={<ItemDetailPage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ItemDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it('shows loading state initially', () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(() => new Promise(() => {}))

    renderWithRouter('1')

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('displays item name and details', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockItem)
    })

    renderWithRouter('1')

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Kaju Katli' })).toBeInTheDocument()
    })
    expect(screen.getByText(/dry sweet/i)).toBeInTheDocument()
    expect(screen.getByText(/weight/i)).toBeInTheDocument()
  })

  it('displays all SKUs with price and unit', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockItem)
    })

    renderWithRouter('1')

    await waitFor(() => {
      expect(screen.getByText('250g')).toBeInTheDocument()
    })
    expect(screen.getByText('500g')).toBeInTheDocument()
    expect(screen.getByText('1.0kg')).toBeInTheDocument()
    expect(screen.getByText(/₹.*450/)).toBeInTheDocument()
    expect(screen.getByText(/₹.*900/)).toBeInTheDocument()
    expect(screen.getByText(/₹.*1,800/)).toBeInTheDocument()
  })

  it('shows error message when item not found', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 404
    })

    renderWithRouter('99999')

    await waitFor(() => {
      expect(screen.getByText(/not found/i)).toBeInTheDocument()
    })
  })

  it('shows error message when fetch fails', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'))

    renderWithRouter('1')

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument()
    })
  })
})
