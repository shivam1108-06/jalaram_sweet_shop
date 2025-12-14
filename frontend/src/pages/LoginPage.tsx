import { Link, useNavigate } from 'react-router-dom'
import LoginForm from '../components/LoginForm'

export default function LoginPage() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <h2 className="text-xl font-semibold text-text-primary mb-6">Login</h2>
      <LoginForm onSuccess={(tokens) => {
        localStorage.setItem('token', tokens.access)
        localStorage.setItem('refresh_token', tokens.refresh)
        window.location.href = '/'
      }} />
      <p className="mt-4 text-text-muted">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary hover:underline">
          Register
        </Link>
      </p>
    </div>
  )
}
