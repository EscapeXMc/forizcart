import { useState } from 'react'
import { Mail, Phone, MapPin, Send } from 'lucide-react'
import { useSiteSettings } from '../context/SiteSettingsContext'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)
  const { settings } = useSiteSettings()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Contact form:', form)
    setSent(true)
  }

  const email = settings?.store_email || 'forizcart@gmail.com'
  const phone = settings?.store_phone || '+91 76579 42799'
  const address = settings?.store_address || 'Mumbai, India'

  return (
    <div className="pt-24 pb-12 min-h-screen bg-ayu-bg">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-px flex-1 bg-ayu-border" />
          <h1 className="text-2xl md:text-3xl font-bold text-ayu-text-bright uppercase tracking-wider">
            &gt; Contact Us
          </h1>
          <div className="h-px flex-1 bg-ayu-border" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="ayu-card p-6">
              {sent ? (
                <div className="text-center py-8">
                  <Send className="w-8 h-8 text-ayu-primary mx-auto mb-3" />
                  <p className="text-ayu-text-bright text-sm">Thank you! We will get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input className="ayu-input w-full px-4 py-2.5 text-sm" placeholder="Your Name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                  <input className="ayu-input w-full px-4 py-2.5 text-sm" placeholder="Email" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                  <textarea className="ayu-input w-full px-4 py-2.5 text-sm" placeholder="Message" rows={5} required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
                  <button type="submit" className="ayu-btn-primary w-full py-2.5 flex items-center justify-center gap-2"><Send className="w-4 h-4" /> Send Message</button>
                </form>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <div className="ayu-card p-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-ayu-primary" />
                <div>
                  <p className="text-xs text-ayu-text uppercase tracking-wider">Email</p>
                  <p className="text-sm text-ayu-text-bright">{email}</p>
                </div>
              </div>
            </div>
            <div className="ayu-card p-4">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-ayu-primary" />
                <div>
                  <p className="text-xs text-ayu-text uppercase tracking-wider">Phone</p>
                  <p className="text-sm text-ayu-text-bright">{phone}</p>
                </div>
              </div>
            </div>
            <div className="ayu-card p-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-ayu-primary" />
                <div>
                  <p className="text-xs text-ayu-text uppercase tracking-wider">Address</p>
                  <p className="text-sm text-ayu-text-bright">{address}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
