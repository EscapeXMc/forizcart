import { useEffect, useState } from 'react'
import { Save, RotateCcw, Globe, Mail, Shield, Database, Key, Palette } from 'lucide-react'
import { supabase } from '../../lib/db'
import { useSiteSettings } from '../../context/SiteSettingsContext'

type Settings = {
  id: number
  store_name: string
  store_email: string
  store_phone: string
  store_address: string
  currency: string
  tax_rate: number
  enable_tax: boolean
  enable_reviews: boolean
  enable_wishlist: boolean
  email_notifications: boolean
  sms_notifications: boolean
  low_stock_threshold: number
  auto_approve_orders: boolean
  theme: string
  language: string
  enable_cod: boolean
  min_order_amount: number
}

const DEFAULTS: Omit<Settings, 'id'> = {
  store_name: 'ForizCart',
  store_email: 'forizcart@gmail.com',
  store_phone: '+917657942799',
  store_address: 'Rampura Pind, Rampura Phul, Bathinda, Punjab, India - 151103',
  currency: 'INR',
  tax_rate: 18,
  enable_tax: true,
  enable_reviews: true,
  enable_wishlist: true,
  email_notifications: true,
  sms_notifications: false,
  low_stock_threshold: 10,
  auto_approve_orders: false,
  theme: 'dark',
  language: 'en',
  enable_cod: true,
  min_order_amount: 100,
}

export default function AdminSettings() {
  const { settings: globalSettings, refresh } = useSiteSettings()
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (globalSettings) {
      setSettings(globalSettings as Settings)
      setLoading(false)
    }
  }, [globalSettings])

  const update = (key: keyof Omit<Settings, 'id'>, value: any) => {
    setSettings(prev => (prev ? { ...prev, [key]: value } : prev))
  }

  const save = async () => {
    if (!settings) return
    setSaving(true)
    setMessage(null)
    const payload: any = { ...settings }
    delete payload.id
    const { error } = await supabase.from('site_settings').upsert(payload, { onConflict: 'id' })
    if (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to save settings' })
    } else {
      setMessage({ type: 'success', text: 'Settings saved successfully' })
      await refresh()
    }
    setSaving(false)
  }

  const reset = async () => {
    setSettings({ id: 1, ...DEFAULTS })
    setMessage(null)
    const { error } = await supabase.from('site_settings').upsert(DEFAULTS, { onConflict: 'id' })
    if (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to reset settings' })
    } else {
      setMessage({ type: 'success', text: 'Settings reset to defaults' })
      await refresh()
    }
  }

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-px flex-1 bg-ayu-border" />
          <h1 className="text-2xl md:text-3xl font-bold text-ayu-text-bright uppercase tracking-wider">&gt; Settings</h1>
          <div className="h-px flex-1 bg-ayu-border" />
        </div>
        <div className="ayu-card p-6 text-xs text-ayu-text">Loading settings...</div>
      </div>
    )
  }

  if (!settings) return null

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-px flex-1 bg-ayu-border" />
        <h1 className="text-2xl md:text-3xl font-bold text-ayu-text-bright uppercase tracking-wider">&gt; Settings</h1>
        <div className="h-px flex-1 bg-ayu-border" />
      </div>

      {message && (
        <div className={`mb-6 p-3 text-xs border ${message.type === 'success' ? 'border-ayu-success text-ayu-success bg-ayu-success/5' : 'border-ayu-error text-ayu-error bg-ayu-error/5'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="ayu-card p-6">
            <h3 className="text-sm font-semibold text-ayu-text-bright uppercase tracking-wider mb-4 flex items-center gap-2"><Globe className="w-4 h-4" /> General</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-ayu-text mb-1.5 uppercase tracking-wider">Store Name</label>
                <input className="ayu-input w-full px-3 py-2 text-sm" value={settings.store_name} onChange={e => update('store_name', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-ayu-text mb-1.5 uppercase tracking-wider">Email</label>
                <input className="ayu-input w-full px-3 py-2 text-sm" value={settings.store_email} onChange={e => update('store_email', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-ayu-text mb-1.5 uppercase tracking-wider">Phone</label>
                <input className="ayu-input w-full px-3 py-2 text-sm" value={settings.store_phone} onChange={e => update('store_phone', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-ayu-text mb-1.5 uppercase tracking-wider">Address</label>
                <input className="ayu-input w-full px-3 py-2 text-sm" value={settings.store_address} onChange={e => update('store_address', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="ayu-card p-6">
            <h3 className="text-sm font-semibold text-ayu-text-bright uppercase tracking-wider mb-4 flex items-center gap-2"><Mail className="w-4 h-4" /> Notifications</h3>
            <div className="space-y-3">
              {[
                { key: 'email_notifications', label: 'Email Notifications' },
                { key: 'sms_notifications', label: 'SMS Notifications' },
                { key: 'enable_reviews', label: 'Enable Reviews' },
                { key: 'enable_wishlist', label: 'Enable Wishlist' },
                { key: 'auto_approve_orders', label: 'Auto Approve Orders' },
              ].map(item => (
                <label key={item.key} className="flex items-center justify-between py-2 border-b border-ayu-border last:border-0">
                  <span className="text-xs text-ayu-text-bright uppercase tracking-wider">{item.label}</span>
                  <input
                    type="checkbox"
                    checked={settings[item.key as keyof Settings] as boolean}
                    onChange={e => update(item.key as keyof Omit<Settings, 'id'>, e.target.checked)}
                    className="accent-ayu-primary"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="ayu-card p-6">
            <h3 className="text-sm font-semibold text-ayu-text-bright uppercase tracking-wider mb-4 flex items-center gap-2"><Database className="w-4 h-4" /> Localization</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-ayu-text mb-1.5 uppercase tracking-wider">Currency</label>
                <select className="ayu-input w-full px-3 py-2 text-sm" value={settings.currency} onChange={e => update('currency', e.target.value)}>
                  <option>INR</option>
                  <option>USD</option>
                  <option>EUR</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-ayu-text mb-1.5 uppercase tracking-wider">Language</label>
                <select className="ayu-input w-full px-3 py-2 text-sm" value={settings.language} onChange={e => update('language', e.target.value)}>
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-ayu-text mb-1.5 uppercase tracking-wider">Tax Rate (%)</label>
                <input
                  type="number"
                  className="ayu-input w-full px-3 py-2 text-sm"
                  value={settings.tax_rate}
                  onChange={e => update('tax_rate', parseFloat(e.target.value || '0'))}
                />
              </div>
            </div>
          </div>

          <div className="ayu-card p-6">
            <h3 className="text-sm font-semibold text-ayu-text-bright uppercase tracking-wider mb-4 flex items-center gap-2"><Shield className="w-4 h-4" /> Store Operations</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-ayu-text mb-1.5 uppercase tracking-wider">Low Stock Threshold</label>
                <input
                  type="number"
                  className="ayu-input w-full px-3 py-2 text-sm"
                  value={settings.low_stock_threshold}
                  onChange={e => update('low_stock_threshold', parseInt(e.target.value || '0', 10))}
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center justify-between w-full py-2 border border-ayu-border rounded px-3">
                  <span className="text-xs text-ayu-text-bright uppercase tracking-wider">Enable COD</span>
                  <input
                    type="checkbox"
                    checked={settings.enable_cod}
                    onChange={e => update('enable_cod', e.target.checked)}
                    className="accent-ayu-primary"
                  />
                </label>
              </div>
              <div>
                <label className="block text-xs text-ayu-text mb-1.5 uppercase tracking-wider">Min Order Amount (₹)</label>
                <input
                  type="number"
                  className="ayu-input w-full px-3 py-2 text-sm"
                  value={settings.min_order_amount}
                  onChange={e => update('min_order_amount', parseFloat(e.target.value || '0'))}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="ayu-card p-6">
            <h3 className="text-sm font-semibold text-ayu-text-bright uppercase tracking-wider mb-4 flex items-center gap-2"><Shield className="w-4 h-4" /> Security</h3>
            <div className="space-y-3">
              <button className="ayu-btn-secondary w-full justify-start"><Key className="w-4 h-4" /> API Keys</button>
              <button className="ayu-btn-secondary w-full justify-start"><Shield className="w-4 h-4" /> 2FA Settings</button>
              <button className="ayu-btn-secondary w-full justify-start"><Database className="w-4 h-4" /> Backup & Restore</button>
            </div>
          </div>

          <div className="ayu-card p-6">
            <h3 className="text-sm font-semibold text-ayu-text-bright uppercase tracking-wider mb-4 flex items-center gap-2"><Palette className="w-4 h-4" /> Appearance</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-ayu-text mb-1.5 uppercase tracking-wider">Theme</label>
                <select className="ayu-input w-full px-3 py-2 text-sm" value={settings.theme} onChange={e => update('theme', e.target.value)}>
                  <option value="dark">Dark TUI</option>
                  <option value="light">Light</option>
                </select>
              </div>
            </div>
          </div>

          <button onClick={save} disabled={saving} className="ayu-btn-primary w-full disabled:opacity-50">
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save All Settings'}
          </button>
          <button onClick={reset} className="ayu-btn-secondary w-full">
            <RotateCcw className="w-4 h-4" /> Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  )
}
