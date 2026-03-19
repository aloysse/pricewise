import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: '首頁', icon: '🏠' },
  { to: '/record', label: '記錄', icon: '📷' },
  { to: '/history', label: '歷史', icon: '📋' },
  { to: '/analytics', label: '分析', icon: '📊' },
] as const

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex safe-area-pb">
      {navItems.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-2 text-xs gap-1 ${
              isActive ? 'text-sky-500' : 'text-gray-500'
            }`
          }
        >
          <span className="text-xl">{icon}</span>
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
