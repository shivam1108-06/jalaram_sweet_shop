import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CreateSKUForm from './CreateSKUForm'

const mockItems = [
  { id: 1, name: 'Kaju Katli', category: 'dry', sale_type: 'weight', inventory_unit: 'grams' },
  { id: 2, name: 'Gulab Jamun', category: 'milk', sale_type: 'count', inventory_unit: 'pieces' },
]

describe('CreateSKUForm', () => {
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it('renders form with item, code, unit value, and price fields', () => {
    render(<CreateSKUForm items={mockItems} onSuccess={mockOnSuccess} />)

    expect(screen.getByLabelText(/item/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/sku code/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/unit value/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/price/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create sku/i })).toBeInTheDocument()
  })

  it('shows items in the dropdown', () => {
    render(<CreateSKUForm items={mockItems} onSuccess={mockOnSuccess} />)

    const itemSelect = screen.getByLabelText(/item/i)
    expect(itemSelect).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /kaju katli/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /gulab jamun/i })).toBeInTheDocument()
  })

  it('shows validation error when code is empty', async () => {
    const user = userEvent.setup()
    render(<CreateSKUForm items={mockItems} onSuccess={mockOnSuccess} />)

    await user.click(screen.getByRole('button', { name: /create sku/i }))

    expect(await screen.findByText(/sku code is required/i)).toBeInTheDocument()
  })

  it('shows validation error when unit value is empty', async () => {
    const user = userEvent.setup()
    render(<CreateSKUForm items={mockItems} onSuccess={mockOnSuccess} />)

    await user.type(screen.getByLabelText(/sku code/i), 'KK-250')
    await user.click(screen.getByRole('button', { name: /create sku/i }))

    expect(await screen.findByText(/unit value is required/i)).toBeInTheDocument()
  })

  it('shows validation error when price is empty', async () => {
    const user = userEvent.setup()
    render(<CreateSKUForm items={mockItems} onSuccess={mockOnSuccess} />)

    await user.type(screen.getByLabelText(/sku code/i), 'KK-250')
    await user.type(screen.getByLabelText(/unit value/i), '250')
    await user.click(screen.getByRole('button', { name: /create sku/i }))

    expect(await screen.findByText(/price is required/i)).toBeInTheDocument()
  })

  it('shows validation error when price is not positive', async () => {
    const user = userEvent.setup()
    render(<CreateSKUForm items={mockItems} onSuccess={mockOnSuccess} />)

    await user.type(screen.getByLabelText(/sku code/i), 'KK-250')
    await user.type(screen.getByLabelText(/unit value/i), '250')
    await user.type(screen.getByLabelText(/price/i), '0')
    await user.click(screen.getByRole('button', { name: /create sku/i }))

    expect(await screen.findByText(/price must be positive/i)).toBeInTheDocument()
  })

  it('calls API and onSuccess when form is valid', async () => {
    const mockResponse = {
      id: 1,
      item: 1,
      code: 'KK-250',
      unit_value: 250,
      price: '450.00',
      display_unit: '250g',
      is_active: true
    }

    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    })
    global.fetch = fetchMock

    render(<CreateSKUForm items={mockItems} onSuccess={mockOnSuccess} />)

    // Fill form using fireEvent
    fireEvent.change(screen.getByLabelText(/sku code/i), { target: { value: 'KK-250' } })
    fireEvent.change(screen.getByLabelText(/unit value/i), { target: { value: '250' } })
    fireEvent.change(screen.getByLabelText(/price/i), { target: { value: '450' } })

    // Submit form
    fireEvent.submit(screen.getByRole('button', { name: /create sku/i }).closest('form')!)

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('shows error message when API returns error', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ code: ['SKU with this code already exists'] })
    })
    global.fetch = fetchMock

    render(<CreateSKUForm items={mockItems} onSuccess={mockOnSuccess} />)

    // Fill form using fireEvent
    fireEvent.change(screen.getByLabelText(/sku code/i), { target: { value: 'KK-250' } })
    fireEvent.change(screen.getByLabelText(/unit value/i), { target: { value: '250' } })
    fireEvent.change(screen.getByLabelText(/price/i), { target: { value: '450' } })

    // Submit form
    fireEvent.submit(screen.getByRole('button', { name: /create sku/i }).closest('form')!)

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled()
    })

    expect(await screen.findByText(/sku with this code already exists/i)).toBeInTheDocument()
    expect(mockOnSuccess).not.toHaveBeenCalled()
  })

  it('shows unit hint based on selected item sale type', () => {
    render(<CreateSKUForm items={mockItems} onSuccess={mockOnSuccess} />)

    // Default is first item (weight-based)
    expect(screen.getByText(/grams/i)).toBeInTheDocument()
  })
})
