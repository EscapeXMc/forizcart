import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import TuiLayout from './components/TuiLayout'
import AyuLoader from './components/AyuLoader'
import Landing from './pages/Landing'
import Products from './pages/Products'
import Categories from './pages/Categories'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminCategories from './pages/admin/AdminCategories'
import AdminOrders from './pages/admin/AdminOrders'
import AdminShipping from './pages/admin/AdminShipping'
import AdminPayments from './pages/admin/AdminPayments'
import AdminCustomers from './pages/admin/AdminCustomers'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import AdminCoupons from './pages/admin/AdminCoupons'
import AdminSettings from './pages/admin/AdminSettings'
import OrderTracking from './pages/OrderTracking'
import Contact from './pages/Contact'
import About from './pages/About'
import Dashboard from './pages/Dashboard'
import Search from './pages/Search'
import ProductDetail from './pages/ProductDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/NotFound'
import Status from './pages/Status'
import TermsConditions from './pages/TermsConditions'
import ShippingPolicy from './pages/ShippingPolicy'
import RefundPolicy from './pages/RefundPolicy'
import ContactUs from './pages/ContactUs'
import DebugPanel from './components/DebugPanel'
import RouteTracker from './components/RouteTracker'
import ErrorBoundary from './components/ErrorBoundary'
import { CartProvider } from './context/CartContext'
import { SiteSettingsProvider } from './context/SiteSettingsContext'
import { ToastProvider } from './context/ToastContext'
import { LoggerProvider } from './context/LoggerContext'
import { ThemeProvider } from './context/ThemeContext'

function StorefrontLayout() {
  return (
    <CartProvider>
      <RouteTracker />
      <DebugPanel />
      <TuiLayout />
    </CartProvider>
  )
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <StorefrontLayout />,
    children: [
      { index: true, element: <Landing /> },
      { path: 'products', element: <Products /> },
      { path: 'products/:id', element: <ProductDetail /> },
      { path: 'categories', element: <Categories /> },
      { path: 'cart', element: <Cart /> },
      { path: 'checkout', element: <Checkout /> },
      { path: 'orders', element: <OrderTracking /> },
      { path: 'contact', element: <Contact /> },
      { path: 'about', element: <About /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'search', element: <Search /> },
      { path: 'status', element: <Status /> },
      { path: 'terms', element: <TermsConditions /> },
      { path: 'shipping-policy', element: <ShippingPolicy /> },
      { path: 'refund-policy', element: <RefundPolicy /> },
      { path: 'contact-us', element: <ContactUs /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: '*', element: <NotFound /> },
    ]
  },
    {
      path: '/admin',
      element: <AdminLayout />,
      children: [
        { index: true, element: <AdminDashboard /> },
      { path: 'products', element: <AdminProducts /> },
      { path: 'categories', element: <AdminCategories /> },
      { path: 'orders', element: <AdminOrders /> },
      { path: 'shipping', element: <AdminShipping /> },
      { path: 'payments', element: <AdminPayments /> },
      { path: 'customers', element: <AdminCustomers /> },
      { path: 'analytics', element: <AdminAnalytics /> },
      { path: 'coupons', element: <AdminCoupons /> },
      { path: 'settings', element: <AdminSettings /> },
      { path: '*', element: <NotFound /> },
    ]
  },
  {
    path: '*',
    element: <NotFound />,
  }
])

export default function App() {
  return (
    <>
      <AyuLoader />
      <SiteSettingsProvider>
        <ToastProvider>
          <LoggerProvider>
            <ThemeProvider>
              <ErrorBoundary>
                <RouterProvider router={router} />
              </ErrorBoundary>
            </ThemeProvider>
          </LoggerProvider>
        </ToastProvider>
      </SiteSettingsProvider>
    </>
  )
}
