import { Link } from 'react-router-dom'
import CreateItemForm from '../components/CreateItemForm'

export default function AdminCreateItemPage() {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <h2 className="text-xl font-semibold text-text-primary mb-6">Add New Sweet Item</h2>
      <CreateItemForm onSuccess={() => {
        alert('Item created successfully!')
      }} />
      <p className="mt-4 text-text-muted">
        <Link to="/" className="text-primary hover:underline">
          Back to Home
        </Link>
      </p>
    </div>
  )
}
