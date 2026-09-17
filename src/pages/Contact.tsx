import { useState } from 'react'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Contact form:', form)
    setSent(true)
  }

  return (
    <div className="pt-24 pb-12 min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Contact Us</h1>
        <div className="bg-white rounded-xl p-8 shadow-sm">
          {sent ? (
            <p className="text-gray-600">Thank you! We will get back to you soon.</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input className="w-full border border-gray-200 rounded-xl px-4 py-3" placeholder="Your Name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <input className="w-full border border-gray-200 rounded-xl px-4 py-3" placeholder="Email" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              <textarea className="w-full border border-gray-200 rounded-xl px-4 py-3" placeholder="Message" rows={4} required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
              <button className="bg-gray-900 text-white px-6 py-3 rounded-xl font-medium">Send Message</button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
