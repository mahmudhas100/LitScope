import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { auth } from '../../firebase/config'
import { useUser } from '../../hooks/useUser'
import LoadingSpinner from './LoadingSpinner'
import { 
  HomeIcon, 
  BookOpenIcon, 
  ArrowRightOnRectangleIcon, 
  MagnifyingGlassIcon, 
  UserCircleIcon, 
  FireIcon,
  Bars3Icon
} from '@heroicons/react/24/outline'

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const sidebarRef = useRef(null)
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const { user, userData, isLoading } = useUser()
  const navigate = useNavigate()

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only handle click-outside for mobile devices
      if (window.innerWidth < 768 && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = async () => {
    await auth.signOut()
    navigate('/login')
  }

  const searchBooks = async (e) => {
    e.preventDefault()
    if (!user) {
      alert('Please Signin or Signup to search for books')
      navigate('/login')
      return
    }
    setIsSearching(true)
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${query}&key=${import.meta.env.VITE_GOOGLE_BOOKS_API_KEY}`
      )
      const data = await response.json()
      setSearchResults(data.items || [])
    } catch (error) {
      console.error('Error searching books:', error)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <>
      {/* Mobile-only overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <div className="fixed top-0 left-0 h-screen z-50">
        <button
          className="p-4 hover:bg-stone-100 rounded-lg m-2 text-ink"
          onClick={() => setIsOpen(!isOpen)}
          onMouseEnter={() => window.innerWidth >= 768 && setIsOpen(true)}
        >
          <Bars3Icon className="w-6 h-6" />
        </button>

        <div
          ref={sidebarRef}
          className={`absolute left-0 top-0 h-screen w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out border-r border-stone-100
            ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
          onMouseEnter={() => window.innerWidth >= 768 && setIsOpen(true)}
          onMouseLeave={() => window.innerWidth >= 768 && setIsOpen(false)}
        >
          <div className="p-6 flex flex-col h-full">
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <div className="mb-8 p-6 bg-primary-600 rounded-2xl text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
                <div className="flex items-center gap-4 mb-4 relative z-10">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-xl font-bold text-white border border-white/30">
                    {user?.displayName?.[0]?.toUpperCase() || <UserCircleIcon className="w-8 h-8" />}
                  </div>
                  <div className="user-info">
                    {user?.displayName && (
                      <h2 className="font-bold text-lg font-serif tracking-wide">{user.displayName}</h2>
                    )}
                    {userData?.username && (
                      <p className="text-sm opacity-80">@{userData.username}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-white/90">
                      <FireIcon className="w-5 h-5 text-orange-300" />
                      <span className="text-sm font-bold">{userData?.streak || 0} day streak</span>
                    </div>
                  </div>
                </div>
                <Link 
                  to="/profile" 
                  className="block w-full text-center bg-white/20 hover:bg-white/30 py-2 rounded-lg transition duration-200 text-sm font-medium backdrop-blur-sm"
                >
                  View Profile
                </Link>
              </div>
            )}

            <form onSubmit={searchBooks} className="mt-2 mb-6 relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search books..."
                className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              />
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
            </form>

            {isSearching ? (
              <LoadingSpinner />
            ) : (
              <div className="overflow-y-auto flex-grow pr-2 scrollbar-thin scrollbar-thumb-stone-200">
                {searchResults.map((book) => (
                  <Link 
                    to={`/book/${book.id}`}
                    key={book.id} 
                    className="block p-3 hover:bg-stone-50 rounded-xl mb-3 transition duration-200 border border-transparent hover:border-stone-100 group"
                  >
                    <div className="flex items-center gap-3">
                      {book.volumeInfo.imageLinks?.thumbnail ? (
                        <img 
                          src={book.volumeInfo.imageLinks.thumbnail} 
                          alt={book.volumeInfo.title}
                          className="w-12 h-16 object-cover rounded shadow-sm group-hover:shadow-md transition-all"
                        />
                      ) : (
                        <div className="w-12 h-16 bg-stone-200 rounded flex items-center justify-center text-stone-400">
                          <BookOpenIcon className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-sm text-ink line-clamp-1 font-serif">{book.volumeInfo.title}</h3>
                        <p className="text-xs text-ink/60 line-clamp-1">
                          {book.volumeInfo.authors?.join(', ')}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <nav className="space-y-2 mt-4">
              <Link to="/" className="flex items-center gap-3 p-3 text-ink/80 hover:bg-primary-50 hover:text-primary-700 rounded-xl transition duration-200 font-medium">
                <HomeIcon className="w-6 h-6" />
                Home
              </Link>
              <Link to="/my-clubs" className="flex items-center gap-3 p-3 text-ink/80 hover:bg-primary-50 hover:text-primary-700 rounded-xl transition duration-200 font-medium">
                <BookOpenIcon className="w-6 h-6" />
                My Clubs
              </Link>
            </nav>

            <button 
              onClick={handleLogout}
              className="mt-auto flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-xl transition duration-200 font-medium"
            >
              <ArrowRightOnRectangleIcon className="w-6 h-6" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar