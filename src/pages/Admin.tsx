import { useState, useEffect } from 'react'
import { supabase } from '../lib/db'

export default function Admin() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', image_url: '', category_id: '', active: true })
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', icon: '', image_url: '', description: '' })

  useEffect(() => {
    const fetch = async () => {
      const [{ data: p }, { data: c }] = await Promise.all([
        supabase.from('products').select('*'),
        supabase.from('categories').select('*')
      ])
      setProducts(p || [])
      setCategories(c || [])
      setLoading(false)
    }
    fetch()
  }, [])

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      ...productForm,
      price: parseFloat(productForm.price),
      category_id: productForm.category_id || null
    }
    if (editingProduct) {
      await supabase.from('products').update(payload).eq('id', editingProduct.id)
    } else {
      await supabase.from('products').insert([payload])
    }
    setEditingProduct(null)
    setProductForm({ name: '', description: '', price: '', image_url: '', category_id: '', active: true })
    const { data } = await supabase.from('products').select('*')
    setProducts(data || [])
  }

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingCategory) {
      await supabase.from('categories').update(categoryForm).eq('id', editingCategory.id)
    } else {
      await supabase.from('categories').insert([categoryForm])
    }
    setEditingCategory(null)
    setCategoryForm({ name: '', slug: '', icon: '', image_url: '', description: '' })
    const { data } = await supabase.from('categories').select('*')
    setCategories(data || [])
  }

  const deleteProduct = async (id: string) => {
    await supabase.from('products').delete().eq('id', id)
    setProducts(products.filter(p => p.id !== id))
  }

  const deleteCategory = async (id: string) => {
    await supabase.from('categories').delete().eq('id', id)
    setCategories(categories.filter(c => c.id !== id))
  }

  return (
    <div className="pt-24 pb-12 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Products</h2>
              <form onSubmit={handleProductSubmit} className="space-y-3 mb-6">
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2" placeholder="Name" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} required />
                <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2" placeholder="Description" value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} />
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2" placeholder="Price" type="number" step="0.01" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} required />
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2" placeholder="Image URL" value={productForm.image_url} onChange={e => setProductForm({ ...productForm, image_url: e.target.value })} />
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2" value={productForm.category_id} onChange={e => setProductForm({ ...productForm, category_id: e.target.value })}>
                  <option value="">No Category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={productForm.active} onChange={e => setProductForm({ ...productForm, active: e.target.checked })} />
                  Active
                </label>
                <button type="submit" className="bg-gray-900 text-white px-4 py-2 rounded-lg">{editingProduct ? 'Update' : 'Add'} Product</button>
                {editingProduct && <button type="button" onClick={() => setEditingProduct(null)} className="ml-2 text-sm text-gray-600">Cancel</button>}
              </form>
              <div className="space-y-2 max-h-96 overflow-auto">
                {products.map(p => (
                  <div key={p.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{p.name}</p>
                      <p className="text-xs text-gray-500">₹{p.price}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingProduct(p); setProductForm({ name: p.name, description: p.description || '', price: String(p.price), image_url: p.image_url || '', category_id: p.category_id || '', active: p.active }) }} className="text-xs bg-gray-200 px-2 py-1 rounded">Edit</button>
                      <button onClick={() => deleteProduct(p.id)} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Categories</h2>
              <form onSubmit={handleCategorySubmit} className="space-y-3 mb-6">
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2" placeholder="Name" value={categoryForm.name} onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })} required />
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2" placeholder="Slug" value={categoryForm.slug} onChange={e => setCategoryForm({ ...categoryForm, slug: e.target.value })} required />
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2" placeholder="Icon" value={categoryForm.icon} onChange={e => setCategoryForm({ ...categoryForm, icon: e.target.value })} />
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2" placeholder="Image URL" value={categoryForm.image_url} onChange={e => setCategoryForm({ ...categoryForm, image_url: e.target.value })} />
                <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2" placeholder="Description" value={categoryForm.description} onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })} />
                <button type="submit" className="bg-gray-900 text-white px-4 py-2 rounded-lg">{editingCategory ? 'Update' : 'Add'} Category</button>
                {editingCategory && <button type="button" onClick={() => setEditingCategory(null)} className="ml-2 text-sm text-gray-600">Cancel</button>}
              </form>
              <div className="space-y-2 max-h-96 overflow-auto">
                {categories.map(c => (
                  <div key={c.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{c.name}</p>
                      <p className="text-xs text-gray-500">{c.slug}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingCategory(c); setCategoryForm({ name: c.name, slug: c.slug, icon: c.icon || '', image_url: c.image_url || '', description: c.description || '' }) }} className="text-xs bg-gray-200 px-2 py-1 rounded">Edit</button>
                      <button onClick={() => deleteCategory(c.id)} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
