import { Link } from 'react-router-dom'

export default function HomePage() {
  const isLoggedIn = !!localStorage.getItem('access_token')

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-semibold text-text-primary">Browse Sweets</h2>
        {!isLoggedIn && (
          <div className="space-x-4">
            <Link to="/login" className="text-primary hover:underline">Login</Link>
            <Link to="/register" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-secondary">
              Register
            </Link>
          </div>
        )}
      </div>

      <p className="text-text-muted">
        Sweet items will be displayed here once implemented.
      </p>
    </div>
  )
}
