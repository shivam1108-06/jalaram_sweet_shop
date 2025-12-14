import RegisterForm from './components/RegisterForm'

function App() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-primary text-white p-4">
        <h1 className="text-2xl font-bold">Jalaram Sweet Shop</h1>
      </header>
      <main className="flex flex-col items-center justify-center p-8">
        <h2 className="text-xl font-semibold text-text-primary mb-6">Create Account</h2>
        <RegisterForm onSuccess={() => alert('Registration successful!')} />
      </main>
    </div>
  )
}

export default App
