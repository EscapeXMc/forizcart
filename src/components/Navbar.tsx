import { Link } from 'react-router-dom'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold tracking-tight text-gray-900">
            ForizCart
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
            <Link to="/" className="hover:text-gray-900 transition-colors">Home</Link>
            <Link to="/products" className="hover:text-gray-900 transition-colors">Products</Link>
            <Link to="/categories" className="hover:text-gray-900 transition-colors">Categories</Link>
            <Link to="/orders" className="hover:text-gray-900 transition-colors">Orders</Link>
            <Link to="/contact" className="hover:text-gray-900 transition-colors">Contact</Link>
            <Link to="/about" className="hover:text-gray-900 transition-colors">About</Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/admin" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Admin
            </Link>
            <Link to="/cart" className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ShoppingCart className="w-5 h-5" />
            </Link>
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-4 space-y-2">
            <Link to="/" className="block py-2 text-sm font-medium text-gray-700">Home</Link>
            <Link to="/products" className="block py-2 text-sm font-medium text-gray-700">Products</Link>
            <Link to="/categories" className="block py-2 text-sm font-medium text-gray-700">Categories</Link>
            <Link to="/orders" className="block py-2 text-sm font-medium text-gray-700">Orders</Link>
            <Link to="/contact" className="block py-2 text-sm font-medium text-gray-700">Contact</Link>
            <Link to="/about" className="block py-2 text-sm font-medium text-gray-700">About</Link>
            <Link to="/admin" className="block py-2 text-sm font-medium text-gray-700">Admin</Link>
            <Link to="/cart" className="block py-2 text-sm font-medium text-gray-700">Cart</Link>
          </div>
        )}
      </div>
    </nav>
  )
}
