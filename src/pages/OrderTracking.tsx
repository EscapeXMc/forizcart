import { useState } from 'react'
import { supabase } from '../lib/db'

export default function OrderTracking() {
  const [orderId, setOrderId] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('orders').select('*').eq('id', orderId).single()
    setResult(error ? { error: error.message } : data)
    setLoading(false)
  }

  return (
    <div className="pt-24 pb-12 min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Track Your Order</h1>
        <div className="flex gap-2">
          <input
            value={orderId}
            onChange={e => setOrderId(e.target.value)}
            placeholder="Enter Order ID"
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-gray-900 text-white px-6 py-3 rounded-xl font-medium disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Track'}
          </button>
        </div>
        {result && (
          <div className="mt-6 bg-white rounded-xl p-6 shadow-sm">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
