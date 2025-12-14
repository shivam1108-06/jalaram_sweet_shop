import { Link, useNavigate } from 'react-router-dom'
import RegisterForm from '../components/RegisterForm'

export default function RegisterPage() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <h2 className="text-xl font-semibold text-text-primary mb-6">Create Account</h2>
      <RegisterForm onSuccess={() => {
        alert('Registration successful! Please login.')
        navigate('/login')
      }} />
      <p className="mt-4 text-text-muted">
        Already have an account?{' '}
        <Link to="/login" className="text-primary hover:underline">
          Login
        </Link>
      </p>
    </div>
  )
}
