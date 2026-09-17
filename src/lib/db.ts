import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export type Product = {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  category_id: string
  active: boolean
  created_at: string
}

export type Category = {
  id: string
  name: string
  slug: string
  icon: string
  image_url: string
  description: string
}
