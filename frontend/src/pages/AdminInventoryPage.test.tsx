import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AdminInventoryPage from './AdminInventoryPage'

const mockItems = [
  {
    id: 1,
    name: 'Kaju Katli',
    category: 'dry',
    sale_type: 'weight',
    inventory_unit: 'grams',
    inventory_qty: 5000,
  },
  {
    id: 2,
    name: 'Gulab Jamun',
    category: 'milk',
    sale_type: 'count',
    inventory_unit: 'pieces',
    inventory_qty: 100,
  },
]

const renderWithRouter = () => {
  return render(
    <MemoryRouter>
      <AdminInventoryPage />
    </MemoryRouter>
  )
}

describe('AdminInventoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
    localStorage.setItem('token', 'test-admin-token')
  })

  it('shows loading state initially', () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(() => new Promise(() => {}))

    renderWithRouter()

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('displays all items with inventory levels', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockItems)
    })

    renderWithRouter()

    await waitFor(() => {
      expect(screen.getByText('Kaju Katli')).toBeInTheDocument()
    })
    expect(screen.getByText('Gulab Jamun')).toBeInTheDocument()
    expect(screen.getByText(/5,000.*grams/i)).toBeInTheDocument()
    expect(screen.getByText(/100.*pieces/i)).toBeInTheDocument()
  })

  it('shows inventory management heading', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockItems)
    })

    renderWithRouter()

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /inventory management/i })).toBeInTheDocument()
    })
  })

  it('displays edit button for each item', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockItems)
    })

    renderWithRouter()

    await waitFor(() => {
      const editButtons = screen.getAllByRole('button', { name: /edit/i })
      expect(editButtons).toHaveLength(2)
    })
  })

  it('shows edit form when edit button clicked', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockItems)
    })

    renderWithRouter()

    await waitFor(() => {
      expect(screen.getByText('Kaju Katli')).toBeInTheDocument()
    })

    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    fireEvent.click(editButtons[0])

    expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('updates inventory when form submitted', async () => {
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockItems)
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ...mockItems[0], inventory_qty: 6000 })
      })

    renderWithRouter()

    await waitFor(() => {
      expect(screen.getByText('Kaju Katli')).toBeInTheDocument()
    })

    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    fireEvent.click(editButtons[0])

    const input = screen.getByLabelText(/quantity/i)
    fireEvent.change(input, { target: { value: '6000' } })

    const saveButton = screen.getByRole('button', { name: /save/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(screen.getByText(/6,000.*grams/i)).toBeInTheDocument()
    })
  })

  it('sends auth token with inventory update', async () => {
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockItems)
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ...mockItems[0], inventory_qty: 6000 })
      })

    renderWithRouter()

    await waitFor(() => {
      expect(screen.getByText('Kaju Katli')).toBeInTheDocument()
    })

    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    fireEvent.click(editButtons[0])

    const input = screen.getByLabelText(/quantity/i)
    fireEvent.change(input, { target: { value: '6000' } })

    const saveButton = screen.getByRole('button', { name: /save/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/items/1/inventory'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-admin-token'
          })
        })
      )
    })
  })

  it('shows error when not authenticated', async () => {
    localStorage.removeItem('token')
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 401
    })

    renderWithRouter()

    await waitFor(() => {
      expect(screen.getByText(/unauthorized/i)).toBeInTheDocument()
    })
  })

  it('closes edit form when cancel clicked', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockItems)
    })

    renderWithRouter()

    await waitFor(() => {
      expect(screen.getByText('Kaju Katli')).toBeInTheDocument()
    })

    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    fireEvent.click(editButtons[0])

    expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument()

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(cancelButton)

    expect(screen.queryByLabelText(/quantity/i)).not.toBeInTheDocument()
  })
})
