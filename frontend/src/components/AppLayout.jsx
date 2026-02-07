import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  History,
  User,
  Home,
  Menu,
  X,
  ArrowLeft
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { path: '/app', icon: Home, label: 'New Loan' },
  { path: '/app/history', icon: History, label: 'History' },
]

const managerNav = { path: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' }

const titleByPath = {
  '/app': 'New Loan',
  '/app/history': 'History',
  '/app/dashboard': 'Dashboard'
}

function getTitle(pathname) {
  if (pathname.startsWith('/app/results/')) return 'Risk Assessment'
  return titleByPath[pathname] || 'Cedar'
}

export default function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, mfi, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const title = getTitle(location.pathname)
  const subtitle = mfi?.name
  const showBack = location.pathname !== '/app'
  const backTo = '/app'

  const isActive = (path) => location.pathname === path || (path !== '/app' && location.pathname.startsWith(path))

  const NavLink = ({ item }) => {
    const Icon = item.icon
    const active = isActive(item.path)
    return (
      <Link
        to={item.path}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
          active
            ? 'bg-[#0A4D3C]/25 text-[#62BB46]'
            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
        }`}
        onClick={() => setSidebarOpen(false)}
      >
        <Icon className="w-5 h-5 shrink-0" />
        {item.label}
      </Link>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex md:w-56 md:flex-col md:fixed md:inset-y-0 bg-[#0a0f0a] border-r border-white/5">
        <div className="flex flex-col flex-1 pt-6 pb-4">
          <div className="flex items-center gap-3 px-4 mb-8">
            <img src="/cedarlogo.png" alt="Cedar" className="w-10 h-10 object-contain" />
            <span className="font-semibold text-white tracking-tight">Cedar</span>
          </div>
          <nav className="flex-1 px-3 space-y-1">
            <NavLink item={navItems[0]} />
            <NavLink item={navItems[1]} />
            {user?.role === 'manager' && <NavLink item={managerNav} />}
          </nav>
          <div className="px-3 pt-4 border-t border-white/5">
            <div className="px-3 py-2 text-xs text-slate-500 truncate">{user?.name}</div>
            <button
              onClick={() => logout()}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 w-full"
            >
              <User className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="fixed inset-y-0 left-0 z-50 w-72 bg-[#0a0f0a] border-r border-white/5 md:hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <img src="/cedarlogo.png" alt="Cedar" className="w-9 h-9 object-contain" />
            <span className="font-semibold text-white">Cedar</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink key={item.path} item={item} />
          ))}
          {user?.role === 'manager' && <NavLink item={managerNav} />}
        </nav>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 md:pl-56 flex flex-col min-h-screen">
        {/* Top bar — menu / back + title */}
        <header className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-[#0a0f0a]/95 backdrop-blur-sm border-b border-white/5">
          {showBack ? (
            <button
              onClick={() => navigate(backTo)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-300 hover:text-white"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-300"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-white truncate">{title}</h1>
            {subtitle && <p className="text-xs text-slate-400 truncate">{subtitle}</p>}
          </div>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>

        {/* Bottom nav — mobile only */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0a0f0a]/98 backdrop-blur-sm border-t border-white/5 safe-area-pb">
          <div className="flex justify-around items-center h-16 px-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center justify-center gap-1 min-w-[64px] py-2 rounded-xl transition-colors ${
                    active ? 'text-[#62BB46]' : 'text-slate-400'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              )
            })}
            {user?.role === 'manager' && (
              <Link
                to="/app/dashboard"
                className={`flex flex-col items-center justify-center gap-1 min-w-[64px] py-2 rounded-xl transition-colors ${
                  isActive('/app/dashboard') ? 'text-[#62BB46]' : 'text-slate-400'
                }`}
              >
                <LayoutDashboard className="w-6 h-6" />
                <span className="text-xs font-medium">Dashboard</span>
              </Link>
            )}
          </div>
        </nav>

        {/* Spacer for bottom nav on mobile */}
        <div className="h-20 md:hidden" />
      </div>
    </div>
  )
}
