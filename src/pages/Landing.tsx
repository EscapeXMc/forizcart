import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useProducts } from '../lib/hooks'
import ProductCard from '../components/ProductCard'

export default function Landing() {
  const { products, loading } = useProducts()
  const featured = products.slice(0, 4)

  return (
    <div className="min-h-screen">
      <section className="relative h-[70vh] md:h-[85vh] flex items-center justify-center bg-gray-50">
        <div className="text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-7xl font-bold tracking-tight text-gray-900 mb-4">
            Shop Smart, <span className="text-gray-600">Pay Less</span>
          </h1>
          <p className="text-base md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Discover curated products with fast delivery, secure checkout, and prices you will love.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors"
          >
            Shop Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Featured Products</h2>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-100 rounded-xl aspect-[4/5]" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {featured.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
