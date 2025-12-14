import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CreateItemForm from './CreateItemForm'

describe('CreateItemForm', () => {
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it('renders form with name, category, and sale type fields', () => {
    render(<CreateItemForm onSuccess={mockOnSuccess} />)

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/sale type/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create item/i })).toBeInTheDocument()
  })

  it('shows category options: Dry, Milk, Other', () => {
    render(<CreateItemForm onSuccess={mockOnSuccess} />)

    const categorySelect = screen.getByLabelText(/category/i)
    expect(categorySelect).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /dry/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /milk/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /other/i })).toBeInTheDocument()
  })

  it('shows sale type options: Weight, Count', () => {
    render(<CreateItemForm onSuccess={mockOnSuccess} />)

    const saleTypeSelect = screen.getByLabelText(/sale type/i)
    expect(saleTypeSelect).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /weight/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /count/i })).toBeInTheDocument()
  })

  it('shows validation error when name is empty', async () => {
    const user = userEvent.setup()
    render(<CreateItemForm onSuccess={mockOnSuccess} />)

    await user.click(screen.getByRole('button', { name: /create item/i }))

    expect(await screen.findByText(/name is required/i)).toBeInTheDocument()
  })

  it('calls API and onSuccess when form is valid', async () => {
    const user = userEvent.setup()
    const mockResponse = {
      id: 1,
      name: 'Kaju Katli',
      category: 'dry',
      sale_type: 'weight',
      inventory_unit: 'grams',
      is_active: true
    }

    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    })

    render(<CreateItemForm onSuccess={mockOnSuccess} />)

    await user.type(screen.getByLabelText(/name/i), 'Kaju Katli')
    await user.selectOptions(screen.getByLabelText(/category/i), 'dry')
    await user.selectOptions(screen.getByLabelText(/sale type/i), 'weight')
    await user.click(screen.getByRole('button', { name: /create item/i }))

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('shows error message when API returns error', async () => {
    const user = userEvent.setup()

    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ name: ['Item with this name already exists'] })
    })

    render(<CreateItemForm onSuccess={mockOnSuccess} />)

    await user.type(screen.getByLabelText(/name/i), 'Kaju Katli')
    await user.selectOptions(screen.getByLabelText(/category/i), 'dry')
    await user.selectOptions(screen.getByLabelText(/sale type/i), 'weight')
    await user.click(screen.getByRole('button', { name: /create item/i }))

    expect(await screen.findByText(/item with this name already exists/i)).toBeInTheDocument()
    expect(mockOnSuccess).not.toHaveBeenCalled()
  })
})
