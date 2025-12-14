import { Link } from 'react-router-dom'
import CreateCashierForm from '../components/CreateCashierForm'

export default function AdminCreateCashierPage() {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <h2 className="text-xl font-semibold text-text-primary mb-6">Create Cashier Account</h2>
      <CreateCashierForm onSuccess={() => {
        alert('Cashier created successfully!')
      }} />
      <p className="mt-4 text-text-muted">
        <Link to="/" className="text-primary hover:underline">
          Back to Home
        </Link>
      </p>
    </div>
  )
}
