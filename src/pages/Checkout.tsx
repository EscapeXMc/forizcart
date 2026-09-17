import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { supabase } from '../lib/db'

export default function Checkout() {
  const { items, total, clearCart } = useCart()
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.from('orders').insert([
      {
        customer_name: form.name,
        customer_email: form.email,
        customer_phone: form.phone,
        address: form.address,
        items,
        total,
      }
    ])
    if (error) {
      console.error('Order failed:', error)
    } else {
      clearCart()
      setSubmitted(true)
    }
  }

  if (submitted) {
    return (
      <div className="pt-24 pb-12 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Placed!</h1>
          <p className="text-gray-600">Thank you for your purchase.</p>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="pt-24 pb-12 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Cart is empty</h1>
          <a href="/products" className="text-gray-900 underline">Shop products</a>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-24 pb-12 min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full border border-gray-200 rounded-xl px-4 py-3"
            placeholder="Full Name"
            required
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="w-full border border-gray-200 rounded-xl px-4 py-3"
            placeholder="Email"
            type="email"
            required
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="w-full border border-gray-200 rounded-xl px-4 py-3"
            placeholder="Phone"
            required
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
          />
          <textarea
            className="w-full border border-gray-200 rounded-xl px-4 py-3"
            placeholder="Address"
            required
            value={form.address}
            onChange={e => setForm({ ...form, address: e.target.value })}
          />
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between text-lg font-semibold text-gray-900">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <button
              type="submit"
              className="mt-4 w-full bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              Place Order
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
