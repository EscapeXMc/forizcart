import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { useAyuSound } from '../hooks/useAyuSound'
import { useAuth } from '../lib/auth'
import { useSiteSettings } from '../context/SiteSettingsContext'
import { useTheme } from '../context/ThemeContext'
import { CartIcon, MenuIcon, CloseIcon, LotusIcon, HerbIcon, OmIcon, BowlIcon, UserIcon, SunIcon, MoonIcon, LogoMark } from './AyuIcons'

const navItems = [
  { path: '/', label: 'Home', icon: LotusIcon },
  { path: '/products', label: 'Products', icon: HerbIcon },
  { path: '/orders', label: 'Orders', icon: OmIcon },
  { path: '/dashboard', label: 'Dashboard', icon: BowlIcon },
]

export default function TuiLayout() {
  const [open, setOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { items } = useCart()
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const { onClick, onHover } = useAyuSound()
  const { user, signOut } = useAuth()
  const { settings } = useSiteSettings()
  const { theme, toggle: toggleTheme } = useTheme()
  const storeName = settings?.store_name || 'ForizCart'

  useEffect(() => {
    window.dispatchEvent(new Event('navigation-start'))
    const t = setTimeout(() => window.dispatchEvent(new Event('navigation-complete')), 500)
    return () => clearTimeout(t)
  }, [location.pathname])

  const handleLogout = async () => {
    setLoggingOut(true)
    await signOut()
    onClick()
    navigate('/', { replace: true })
  }

  return (
    <div className={`min-h-screen bg-ayu-bg text-ayu-text font-ayu ${loggingOut ? 'ayu-exit' : ''}`}>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-ayu-bg/90 backdrop-blur-md border-b border-ayu-border">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center h-12 sm:h-14">
            <Link to="/" className="flex items-center gap-2 text-base sm:text-lg font-bold tracking-tight text-ayu-primary">
              <LogoMark className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="hidden sm:inline">{storeName}</span>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  onMouseEnter={onHover}
                  onClick={onClick}
                  className={`px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-all duration-150 ${
                    location.pathname === item.path ? 'text-ayu-primary border-b-2 border-ayu-primary' : 'text-ayu-text hover:text-ayu-text-bright'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Link to="/cart" onMouseEnter={onHover} onClick={onClick} className="relative p-1.5 text-ayu-text hover:text-ayu-primary transition-colors">
                <CartIcon className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-ayu-primary text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>
              <button onClick={toggleTheme} onMouseEnter={onHover} className="p-1.5 text-ayu-text hover:text-ayu-primary transition-colors" title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
                {theme === 'dark' ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
              </button>
              {user ? (
                <button onClick={handleLogout} onMouseEnter={onHover} className="p-1.5 text-ayu-text hover:text-ayu-primary transition-colors" title="Logout">
                  <UserIcon className="w-4 h-4" />
                </button>
              ) : (
                <Link to="/login" onMouseEnter={onHover} onClick={onClick} className="p-1.5 text-ayu-text hover:text-ayu-primary transition-colors" title="Login">
                  <UserIcon className="w-4 h-4" />
                </Link>
              )}
            </div>
            <button className="md:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-ayu-text" onClick={() => setOpen(!open)}>
              {open ? <CloseIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>
          <div
            className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
              open ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="pb-3 space-y-0.5 border-t border-ayu-border">
              {navItems.map(item => (
                <Link key={item.path} to={item.path} onMouseEnter={onHover} onClick={() => { onClick(); setOpen(false); }} className={`flex items-center gap-3 px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider min-h-[44px] ${location.pathname === item.path ? 'text-ayu-primary bg-ayu-primary/5' : 'text-ayu-text'}`}>
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
              <div className="h-px bg-ayu-border my-1.5" />
              <Link to="/cart" onMouseEnter={onHover} onClick={() => { onClick(); setOpen(false); }} className="flex items-center gap-3 px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider min-h-[44px] text-ayu-text">
                <CartIcon className="w-4 h-4" />
                Cart ({cartCount})
              </Link>
              <button onClick={() => { toggleTheme(); setOpen(false); }} onMouseEnter={onHover} className="flex items-center gap-3 px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider min-h-[44px] w-full text-left text-ayu-text hover:text-ayu-primary">
                {theme === 'dark' ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
              <div className="h-px bg-ayu-border my-1.5" />
              {user ? (
                <button onClick={async () => { await handleLogout(); setOpen(false); }} onMouseEnter={onHover} className="flex items-center gap-3 px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider min-h-[44px] w-full text-left text-ayu-error">
                  <UserIcon className="w-4 h-4" />
                  Logout
                </button>
              ) : (
                <Link to="/login" onMouseEnter={onHover} onClick={() => { onClick(); setOpen(false); }} className="flex items-center gap-3 px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider min-h-[44px] text-ayu-primary">
                  <UserIcon className="w-4 h-4" />
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-12 sm:pt-14">
        <div key={location.pathname} className="ayu-page-enter">
          <Outlet />
        </div>
      </main>

      <footer className="border-t border-ayu-border bg-ayu-surface/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h3 className="text-ayu-primary font-bold text-xs flex items-center gap-2"><LogoMark className="w-4 h-4" /> {storeName}</h3>
            <p className="text-[11px] text-ayu-text text-center">Shop smart, pay less. Discover the best products at unbeatable prices with fast delivery and secure checkout.</p>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px] text-ayu-text">
              <Link to="/terms" className="hover:text-ayu-primary transition-colors">Terms &amp; Conditions</Link>
              <Link to="/shipping-policy" className="hover:text-ayu-primary transition-colors">Shipping Policy</Link>
              <Link to="/refund-policy" className="hover:text-ayu-primary transition-colors">Refund Policy</Link>
              <Link to="/contact-us" className="hover:text-ayu-primary transition-colors">Contact Us</Link>
            </div>
            <p className="text-[11px] text-ayu-text">{storeName}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
