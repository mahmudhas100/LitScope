import NotificationPanel from '../notifications/NotificationPanel'
import { Link } from 'react-router-dom'
import { useUser } from '../../hooks/useUser'

const Navbar = () => {
  const { user } = useUser()

  return (
    <div className="fixed top-0.5 left-0 right-0 bg-gradient-to-r from-paper to-primary-50/30 shadow-sm z-40 border-b border-stone-100">
      <div className="flex justify-between items-center h-16 px-6 max-w-7xl mx-auto">
        {/* Left-aligned text logo */}
        <Link to="/" className="flex items-center gap-3 group ml-7">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200">
            <span className="text-white font-bold text-xl font-serif">L</span>
          </div>
          <span className="text-2xl font-bold text-ink font-serif tracking-tight">
            Lit<span className="text-primary-600">Scope</span>
          </span>
        </Link>

        {/* Right side - NotificationPanel (only for logged-in users) */}
        <div className="flex items-center gap-4">
          {user && <NotificationPanel />}
        </div>
      </div>
    </div>
  )
}

export default Navbar