import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { supabase } from '../lib/db'
import { useAuth } from '../lib/auth'
import { RAZORPAY_KEY, openRazorpayCheckout, createRazorpayOrder, isBackendUnavailableError } from '../lib/razorpay'
import { CheckCircle2, CreditCard, PackageSearch, ShoppingBag, Check, MapPin, User, Phone, Navigation, Loader2 } from 'lucide-react'
import { useSiteSettings } from '../context/SiteSettingsContext'

const STORAGE_KEY = 'forizcart_orders'

type AddressForm = {
  firstName: string
  lastName: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  zipCode: string
  mobileNumber: string
}

export default function Checkout() {
  const navigate = useNavigate()
  const { items, total, clearCart } = useCart()
  const { user, loading: authLoading } = useAuth()
  const { settings } = useSiteSettings()
  const storeName = settings?.store_name || 'ForizCart'
  const [form, setForm] = useState<AddressForm>({
    firstName: '',
    lastName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    mobileNumber: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null)
  const [finalTotal, setFinalTotal] = useState(total)
  const [locating, setLocating] = useState(false)

  useEffect(() => {
    setFinalTotal(total)
  }, [total])

  useEffect(() => {
    if (authLoading) return
  }, [user, navigate, authLoading])

  const updateForm = (patch: Partial<AddressForm>) => setForm(prev => ({ ...prev, ...patch }))

  const fillAddressFromGPS = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      return
    }
    setLocating(true)
    setError('')
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
          const data = await res.json()
          const addr = data.address || {}
          updateAddressFromReverseGeocoding(addr)
        } catch {
          updateForm({
            addressLine1: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
            city: '',
            state: '',
            zipCode: '',
          })
        } finally {
          setLocating(false)
        }
      },
      (err) => {
        setLocating(false)
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Please allow location access in your browser settings.')
            break
          case err.POSITION_UNAVAILABLE:
            setError('Location information is unavailable.')
            break
          case err.TIMEOUT:
            setError('Location request timed out.')
            break
          default:
            setError('Unable to fetch location.')
        }
      }
    )
  }

  const updateAddressFromReverseGeocoding = (addr: any) => {
    updateForm({
      addressLine1: [addr.house_number, addr.road, addr.suburb, addr.village].filter(Boolean).join(', ') || '',
      addressLine2: [addr.office, addr.commercial, addr.building].filter(Boolean).join(', ') || '',
      city: addr.city || addr.town || addr.municipality || '',
      state: addr.state || '',
      zipCode: addr.postcode || '',
    })
  }

  const saveOrder = async (paymentId: string, razorpayOrderId: string) => {
    const retry = async (fn: () => Promise<any>, attempts = 2) => {
      try {
        return await fn()
      } catch (err) {
        if (attempts <= 1) throw err
        await new Promise(r => setTimeout(r, 800))
        return retry(fn, attempts - 1)
      }
    }
    if (!user?.id) {
      throw new Error('User not authenticated. Please login again.')
    }
    const payload: any = {
      order_number: 'ORD-' + Date.now(),
      user_id: user?.id || null,
      customer_name: `${form.firstName} ${form.lastName}`.trim() || 'Guest',
      customer_email: user?.email || 'guest@example.com',
      customer_phone: form.mobileNumber || null,
      shipping_address: {
        addressLine1: form.addressLine1 || 'N/A',
        addressLine2: form.addressLine2 || '',
        city: form.city || '',
        state: form.state || '',
        zipCode: form.zipCode || '',
        mobileNumber: form.mobileNumber || '',
        fullName: `${form.firstName} ${form.lastName}`.trim() || 'Guest',
      },
      items: JSON.parse(JSON.stringify(items)),
      subtotal: Number(total.toFixed(2)),
      total: Number(finalTotal.toFixed(2)),
      payment_method: 'razorpay',
      payment_id: paymentId,
      status: 'processing',
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: paymentId,
    }
    if (user?.id) {
      const { error } = await retry(() => supabase.from('orders').insert([payload]) as any)
      if (error) {
        const msg = error.message || 'Failed to save order'
        if (msg.includes('schema cache') || msg.includes('Could not find')) {
          throw new Error('Order system is updating. Please try again in a moment.')
        }
        throw new Error(msg)
      }
    }

    const localOrders = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    localOrders.unshift({
      ...payload,
      id: payload.order_number,
      confirmedAt: new Date().toISOString(),
    })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(localOrders.slice(0, 200)))
  }

  const handlePayment = async () => {
    if (processing) return
    setError('')
    setProcessing(true)
    try {
      const razorpayOrder = await createRazorpayOrder(finalTotal)
      const RazorpayScript = (window as any).Razorpay
      if (!RazorpayScript) {
        throw new Error('Payment gateway is loading. Please wait a moment and try again.')
      }
      openRazorpayCheckout({
        amount: finalTotal,
        keyId: RAZORPAY_KEY,
        orderId: razorpayOrder.id,
        name: storeName,
        description: 'Ayurvedic Store Purchase',
        onSuccess: async (response: any) => {
          try {
            await saveOrder(response.razorpay_payment_id, response.razorpay_order_id || razorpayOrder.id)
            const orderId = response.razorpay_order_id || razorpayOrder.id
            setConfirmedOrderId(orderId)
            clearCart()
            setSubmitted(true)
          } catch (err) {
            setError('Payment succeeded but order save failed. Please contact support with your payment reference.')
          } finally {
            setProcessing(false)
          }
        },
        onFailure: (resp: any) => {
          setError(resp?.error?.description || 'Payment failed')
          setProcessing(false)
        },
        onDismiss: () => {
          setProcessing(false)
        },
      })
    } catch (err: any) {
      const message = isBackendUnavailableError(err)
        ? 'Payment service is temporarily unavailable. Please check your internet connection and try again.'
        : (err?.message || 'Payment initialization failed')
      setError(message)
      setProcessing(false)
    }
  }

  const confirmFreeOrder = async () => {
    setError('')
    setProcessing(true)
    try {
      await saveOrder('free', 'free')
      setConfirmedOrderId('FREE-' + Date.now())
      clearCart()
      setSubmitted(true)
    } catch (err: any) {
      setError(err?.message || 'Order confirmation failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  if (submitted && confirmedOrderId) {
    return (
      <div className="fixed inset-0 z-[9999] bg-ayu-bg/95 backdrop-blur-sm flex items-center justify-center">
        <div className="text-center p-8 max-w-md ayu-enter">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-ayu-success/10 border border-ayu-success/30 flex items-center justify-center ayu-pulse-soft">
            <CheckCircle2 className="w-12 h-12 text-ayu-success" />
          </div>
          <h1 className="text-3xl font-bold text-ayu-text-bright mb-2 uppercase tracking-wider">Order Confirmed!</h1>
          <p className="text-ayu-text text-sm mb-4">Your order has been placed successfully.</p>
          <div className="ayu-card p-4 mb-6 inline-block">
            <p className="text-xs text-ayu-text uppercase tracking-wider mb-1">Order ID</p>
            <p className="text-sm font-mono text-ayu-text-bright break-all">{confirmedOrderId}</p>
          </div>
          <div className="space-y-3">
            {!user ? (
              <div className="space-y-2">
                <p className="text-xs text-ayu-text uppercase tracking-wider">Want to save this order to your account?</p>
                <div className="flex gap-2 justify-center">
                  <button onClick={() => navigate(`/login?redirect-to=/orders`)} className="ayu-btn-primary px-4 py-2 text-xs">Login</button>
                  <button onClick={() => navigate(`/register?redirect-to=/orders`)} className="ayu-btn-secondary px-4 py-2 text-xs">Register</button>
                </div>
              </div>
            ) : null}
            <div className="flex gap-3">
              <button onClick={() => navigate('/orders')} className="ayu-btn-primary px-6 flex items-center justify-center gap-2"><PackageSearch className="w-4 h-4" /> Track Order</button>
              <button onClick={() => navigate('/')} className="ayu-btn-secondary px-6 flex items-center justify-center gap-2"><ShoppingBag className="w-4 h-4" /> Continue Shopping</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="pt-24 pb-12 min-h-screen bg-ayu-bg flex items-center justify-center">
        <div className="text-center border border-ayu-primary/30 bg-ayu-panel p-8 max-w-md">
          <CheckCircle2 className="w-12 h-12 text-ayu-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-ayu-text-bright mb-2 uppercase tracking-wider">Payment Successful!</h1>
          <p className="text-ayu-text text-sm">Thank you for your purchase. Your order has been confirmed.</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="pt-24 pb-12 min-h-screen bg-ayu-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-ayu-text mb-4">Please login to checkout.</p>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="pt-24 pb-12 min-h-screen bg-ayu-bg flex items-center justify-center">
        <div className="text-center border border-ayu-border bg-ayu-panel p-8">
          <h1 className="text-2xl font-bold text-ayu-text-bright mb-4 uppercase tracking-wider">Cart is empty</h1>
          <a href="/products" className="text-ayu-primary hover:underline text-sm">Shop products →</a>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-24 pb-12 min-h-screen bg-ayu-bg">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-px flex-1 bg-ayu-border" />
          <h1 className="text-2xl md:text-3xl font-bold text-ayu-text-bright uppercase tracking-wider">
            &gt; Checkout
          </h1>
          <div className="h-px flex-1 bg-ayu-border" />
        </div>
        <div className="space-y-6">
          <div className="ayu-card p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-ayu-text-bright uppercase tracking-wider">Shipping Details</h2>
              <button
                type="button"
                onClick={fillAddressFromGPS}
                disabled={locating}
                className="ayu-btn-secondary text-xs px-3 py-2 flex items-center gap-2 disabled:opacity-50"
              >
                {locating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
                {locating ? 'Fetching...' : 'Use Current Location'}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ayu-text" />
                <input className="ayu-input w-full pl-10 pr-4 py-2.5 text-sm" placeholder="First Name" required value={form.firstName} onChange={e => updateForm({ firstName: e.target.value })} />
              </div>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ayu-text" />
                <input className="ayu-input w-full pl-10 pr-4 py-2.5 text-sm" placeholder="Last Name" required value={form.lastName} onChange={e => updateForm({ lastName: e.target.value })} />
              </div>
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ayu-text" />
              <input className="ayu-input w-full pl-10 pr-4 py-2.5 text-sm" placeholder="Address Line 1" required value={form.addressLine1} onChange={e => updateForm({ addressLine1: e.target.value })} />
            </div>
            <input className="ayu-input w-full px-4 py-2.5 text-sm" placeholder="Address Line 2 (optional)" value={form.addressLine2} onChange={e => updateForm({ addressLine2: e.target.value })} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input className="ayu-input w-full px-4 py-2.5 text-sm" placeholder="City" required value={form.city} onChange={e => updateForm({ city: e.target.value })} />
              <input className="ayu-input w-full px-4 py-2.5 text-sm" placeholder="State" required value={form.state} onChange={e => updateForm({ state: e.target.value })} />
              <input className="ayu-input w-full px-4 py-2.5 text-sm" placeholder="Zip / Pin Code" required value={form.zipCode} onChange={e => updateForm({ zipCode: e.target.value })} />
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ayu-text" />
              <input className="ayu-input w-full pl-10 pr-4 py-2.5 text-sm" placeholder="Mobile Number" required value={form.mobileNumber} onChange={e => updateForm({ mobileNumber: e.target.value })} />
            </div>
          </div>
          <div className="ayu-card p-6">
            <div className="flex justify-between items-center text-lg font-semibold text-ayu-text-bright mb-2">
              <span>Total Amount</span>
              <span className="text-ayu-primary text-glow">₹{finalTotal.toFixed(2)}</span>
            </div>
            {error && <p className="text-ayu-error text-sm mb-3">{error}</p>}
            {finalTotal <= 1 ? (
              <button type="button" disabled={processing} onClick={confirmFreeOrder} className="w-full bg-ayu-success text-ayu-bg py-3 font-medium hover:bg-ayu-success/80 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                <Check className="w-4 h-4" />
                {processing ? 'Confirming...' : 'Confirm Order'}
              </button>
            ) : (
              <button type="button" disabled={processing} onClick={handlePayment} className="w-full bg-ayu-primary text-ayu-bg py-3 font-medium hover:bg-ayu-primary-dim transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                <CreditCard className="w-4 h-4" />
                {processing ? 'Opening Razorpay...' : 'Pay with Razorpay'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
