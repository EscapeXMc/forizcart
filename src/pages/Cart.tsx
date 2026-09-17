import { useCart } from '../context/CartContext'
import { Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Cart() {
  const { items, removeFromCart, total } = useCart()

  return (
    <div className="pt-24 pb-12 min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 mb-4">Your cart is empty.</p>
            <Link to="/products" className="text-gray-900 font-medium underline">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map(item => (
              <div key={item.id} className="bg-white rounded-xl p-4 flex gap-4 items-center shadow-sm">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg bg-gray-100"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                  <p className="text-sm text-gray-500">₹{item.price} x {item.quantity}</p>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center text-lg font-semibold text-gray-900">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <Link
                to="/checkout"
                className="mt-4 w-full bg-gray-900 text-white text-center py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors block"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
