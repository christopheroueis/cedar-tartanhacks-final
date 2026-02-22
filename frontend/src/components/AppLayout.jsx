import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  FilePlus2, BarChart3, Clock, LogOut
} from 'lucide-react'

export default function AppLayout() {
  const { user, mfi, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { to: '/app', icon: FilePlus2, label: 'NEW ASSESSMENT', end: true },
    { to: '/app/dashboard', icon: BarChart3, label: 'DASHBOARD' },
    { to: '/app/history', icon: Clock, label: 'HISTORY' },
  ]

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="app-sidebar">
        {/* Brand */}
        <div className="px-6 mb-10">
          <div className="flex items-center gap-2.5">
            <img src="/cedarlogo.png" alt="Cedar" style={{ height: 28 }} />
            <span className="text-sm font-semibold tracking-wide" style={{ fontFamily: 'var(--font-display)', color: '#1A1A18' }}>
              CEDAR
            </span>
          </div>
          {mfi && (
            <div className="mt-3 text-xs" style={{ color: '#9B9B8A', fontFamily: 'var(--font-mono)' }}>
              {mfi.name}
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-md mb-1 text-xs font-medium tracking-wide transition-colors ${isActive
                  ? 'bg-[#0D7377]/8 text-[#0D7377]'
                  : 'text-[#6B6B5A] hover:text-[#1A1A18] hover:bg-black/[0.03]'
                }`
              }
              style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User & Logout */}
        <div className="px-6 pt-4 border-t" style={{ borderColor: '#E0D9CF' }}>
          {user && (
            <div className="mb-3">
              <div className="text-sm font-medium" style={{ color: '#1A1A18' }}>{user.name}</div>
              <div className="text-xs" style={{ color: '#9B9B8A', fontFamily: 'var(--font-mono)' }}>
                {user.role === 'manager' ? 'MANAGER' : 'LOAN OFFICER'}
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs font-medium tracking-wide transition-colors hover:text-[#C0392B]"
            style={{ color: '#9B9B8A', fontFamily: 'var(--font-mono)' }}
          >
            <LogOut className="w-3.5 h-3.5" />
            SIGN OUT
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
