import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CreateCashierForm from './CreateCashierForm'

describe('CreateCashierForm', () => {
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it('renders form with name, email, and password fields', () => {
    render(<CreateCashierForm onSuccess={mockOnSuccess} />)

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create cashier/i })).toBeInTheDocument()
  })

  it('shows validation error when name is empty', async () => {
    const user = userEvent.setup()
    render(<CreateCashierForm onSuccess={mockOnSuccess} />)

    await user.type(screen.getByLabelText(/email/i), 'cashier@example.com')
    await user.type(screen.getByLabelText(/password/i), 'SecurePass123!')
    await user.click(screen.getByRole('button', { name: /create cashier/i }))

    expect(await screen.findByText(/name is required/i)).toBeInTheDocument()
  })

  it('shows validation error when email is empty', async () => {
    const user = userEvent.setup()
    render(<CreateCashierForm onSuccess={mockOnSuccess} />)

    await user.type(screen.getByLabelText(/name/i), 'Test Cashier')
    await user.type(screen.getByLabelText(/password/i), 'SecurePass123!')
    await user.click(screen.getByRole('button', { name: /create cashier/i }))

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument()
  })

  it('shows validation error when password is empty', async () => {
    const user = userEvent.setup()
    render(<CreateCashierForm onSuccess={mockOnSuccess} />)

    await user.type(screen.getByLabelText(/name/i), 'Test Cashier')
    await user.type(screen.getByLabelText(/email/i), 'cashier@example.com')
    await user.click(screen.getByRole('button', { name: /create cashier/i }))

    expect(await screen.findByText(/password is required/i)).toBeInTheDocument()
  })

  it('calls API and onSuccess when form is valid', async () => {
    const user = userEvent.setup()
    const mockResponse = {
      email: 'cashier@example.com',
      name: 'Test Cashier',
      role: 'cashier'
    }

    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    })

    render(<CreateCashierForm onSuccess={mockOnSuccess} />)

    await user.type(screen.getByLabelText(/name/i), 'Test Cashier')
    await user.type(screen.getByLabelText(/email/i), 'cashier@example.com')
    await user.type(screen.getByLabelText(/password/i), 'SecurePass123!')
    await user.click(screen.getByRole('button', { name: /create cashier/i }))

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('shows error message when API returns error', async () => {
    const user = userEvent.setup()

    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ detail: 'Email already exists' })
    })

    render(<CreateCashierForm onSuccess={mockOnSuccess} />)

    await user.type(screen.getByLabelText(/name/i), 'Test Cashier')
    await user.type(screen.getByLabelText(/email/i), 'cashier@example.com')
    await user.type(screen.getByLabelText(/password/i), 'SecurePass123!')
    await user.click(screen.getByRole('button', { name: /create cashier/i }))

    expect(await screen.findByText(/email already exists/i)).toBeInTheDocument()
    expect(mockOnSuccess).not.toHaveBeenCalled()
  })
})
