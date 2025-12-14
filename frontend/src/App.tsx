import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AdminCreateCashierPage from './pages/AdminCreateCashierPage'
import AdminCreateItemPage from './pages/AdminCreateItemPage'
import AdminCreateSKUPage from './pages/AdminCreateSKUPage'
import AdminInventoryPage from './pages/AdminInventoryPage'
import ItemDetailPage from './pages/ItemDetailPage'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white">
        <header className="bg-primary text-white p-4">
          <a href="/" className="text-2xl font-bold">Jalaram Sweet Shop</a>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/admin/create-cashier" element={<AdminCreateCashierPage />} />
            <Route path="/admin/create-item" element={<AdminCreateItemPage />} />
            <Route path="/admin/create-sku" element={<AdminCreateSKUPage />} />
            <Route path="/admin/inventory" element={<AdminInventoryPage />} />
            <Route path="/items/:id" element={<ItemDetailPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
