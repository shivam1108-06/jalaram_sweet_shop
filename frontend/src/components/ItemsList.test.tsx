import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ItemsList from './ItemsList'

const renderWithRouter = (component: React.ReactNode) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('ItemsList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it('displays loading state initially', () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockImplementation(() => new Promise(() => {}))

    renderWithRouter(<ItemsList />)

    // Check for skeleton loaders (animated placeholders)
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('displays items when loaded successfully', async () => {
    const mockItems = [
      { id: 1, name: 'Kaju Katli', category: 'dry', sale_type: 'weight', inventory_unit: 'grams', is_active: true },
      { id: 2, name: 'Gulab Jamun', category: 'milk', sale_type: 'count', inventory_unit: 'pieces', is_active: true },
    ]

    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockItems)
    })

    renderWithRouter(<ItemsList />)

    await waitFor(() => {
      expect(screen.getByText('Kaju Katli')).toBeInTheDocument()
      expect(screen.getByText('Gulab Jamun')).toBeInTheDocument()
    })
  })

  it('displays item category badge', async () => {
    const mockItems = [
      { id: 1, name: 'Kaju Katli', category: 'dry', sale_type: 'weight', inventory_unit: 'grams', is_active: true },
    ]

    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockItems)
    })

    renderWithRouter(<ItemsList />)

    await waitFor(() => {
      expect(screen.getByText('Dry Sweet')).toBeInTheDocument()
      expect(screen.getByText(/sold by weight/i)).toBeInTheDocument()
    })
  })

  it('displays empty message when no items', async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([])
    })

    renderWithRouter(<ItemsList />)

    await waitFor(() => {
      expect(screen.getByText(/no items available/i)).toBeInTheDocument()
    })
  })

  it('displays error message when fetch fails', async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ detail: 'Unauthorized' })
    })

    renderWithRouter(<ItemsList />)

    await waitFor(() => {
      expect(screen.getByText(/failed to load items/i)).toBeInTheDocument()
    })
  })

  it('links to item detail page', async () => {
    const mockItems = [
      { id: 1, name: 'Kaju Katli', category: 'dry', sale_type: 'weight', inventory_unit: 'grams', is_active: true },
    ]

    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockItems)
    })

    renderWithRouter(<ItemsList />)

    await waitFor(() => {
      const link = screen.getByRole('link', { name: /kaju katli/i })
      expect(link).toHaveAttribute('href', '/items/1')
    })
  })
})
