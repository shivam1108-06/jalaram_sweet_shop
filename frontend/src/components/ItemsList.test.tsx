import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import ItemsList from './ItemsList'

describe('ItemsList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
    localStorage.setItem('access_token', 'test-token')
  })

  it('displays loading state initially', () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockImplementation(() => new Promise(() => {}))

    render(<ItemsList />)

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
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

    render(<ItemsList />)

    await waitFor(() => {
      expect(screen.getByText('Kaju Katli')).toBeInTheDocument()
      expect(screen.getByText('Gulab Jamun')).toBeInTheDocument()
    })
  })

  it('displays item category and sale type', async () => {
    const mockItems = [
      { id: 1, name: 'Kaju Katli', category: 'dry', sale_type: 'weight', inventory_unit: 'grams', is_active: true },
    ]

    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockItems)
    })

    render(<ItemsList />)

    await waitFor(() => {
      expect(screen.getByText(/dry/i)).toBeInTheDocument()
      expect(screen.getByText(/weight/i)).toBeInTheDocument()
    })
  })

  it('displays empty message when no items', async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([])
    })

    render(<ItemsList />)

    await waitFor(() => {
      expect(screen.getByText(/no items available/i)).toBeInTheDocument()
    })
  })

  it('displays error message when fetch fails', async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ detail: 'Unauthorized' })
    })

    render(<ItemsList />)

    await waitFor(() => {
      expect(screen.getByText(/failed to load items/i)).toBeInTheDocument()
    })
  })
})
