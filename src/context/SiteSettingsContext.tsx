import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '../lib/db'

type SiteSettings = {
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

type SiteSettingsContextValue = {
  settings: SiteSettings | null
  loading: boolean
  refresh: () => Promise<void>
}

const SiteSettingsContext = createContext<SiteSettingsContextValue | null>(null)

const DEFAULTS: SiteSettings = {
  store_name: 'ForizCart',
  store_email: 'forizcart@gmail.com',
  store_phone: '+917657942799',
  store_address: 'Mumbai, India',
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

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('site_settings').select('*').eq('id', 1).single()
    if (data) {
      setSettings({
        store_name: data.store_name ?? DEFAULTS.store_name,
        store_email: data.store_email ?? DEFAULTS.store_email,
        store_phone: data.store_phone ?? DEFAULTS.store_phone,
        store_address: data.store_address ?? DEFAULTS.store_address,
        currency: data.currency ?? DEFAULTS.currency,
        tax_rate: data.tax_rate ?? DEFAULTS.tax_rate,
        enable_tax: data.enable_tax ?? DEFAULTS.enable_tax,
        enable_reviews: data.enable_reviews ?? DEFAULTS.enable_reviews,
        enable_wishlist: data.enable_wishlist ?? DEFAULTS.enable_wishlist,
        email_notifications: data.email_notifications ?? DEFAULTS.email_notifications,
        sms_notifications: data.sms_notifications ?? DEFAULTS.sms_notifications,
        low_stock_threshold: data.low_stock_threshold ?? DEFAULTS.low_stock_threshold,
        auto_approve_orders: data.auto_approve_orders ?? DEFAULTS.auto_approve_orders,
        theme: data.theme ?? DEFAULTS.theme,
        language: data.language ?? DEFAULTS.language,
        enable_cod: data.enable_cod ?? DEFAULTS.enable_cod,
        min_order_amount: data.min_order_amount ?? DEFAULTS.min_order_amount,
      })
    } else {
      setSettings(DEFAULTS)
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, refresh: load }}>
      {children}
    </SiteSettingsContext.Provider>
  )
}

export function useSiteSettings() {
  const ctx = useContext(SiteSettingsContext)
  if (!ctx) throw new Error('useSiteSettings must be used within SiteSettingsProvider')
  return ctx
}
