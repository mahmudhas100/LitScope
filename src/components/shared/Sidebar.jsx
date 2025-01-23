import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { auth } from '../../firebase/config'
import { useUser } from '../../hooks/useUser'
import LoadingSpinner from './LoadingSpinner'

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const { user, userData, isLoading } = useUser()
  const navigate = useNavigate()

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
    <div className="fixed top-0 left-0 h-screen z-50">
      <button
        className="p-4 hover:bg-gray-100 rounded-lg m-2"
        onMouseEnter={() => setIsOpen(true)}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div
        className={`absolute left-0 top-0 h-screen w-64 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        onMouseLeave={() => setIsOpen(false)}
      >
        <div className="p-6 flex flex-col h-full">
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="mb-8 p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl font-bold text-blue-500">
                  {user?.displayName?.[0]?.toUpperCase() || '👤'}
                </div>
                <div className="user-info">
                  {user?.displayName && (
                    <h2 className="font-bold text-lg">{user.displayName}</h2>
                  )}
                  {userData?.username && (
                    <p className="text-sm opacity-75">@{userData.username}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-white/80">
                    <span className="text-lg">🔥</span>
                    <span className="text-sm font-bold">{userData?.streak || 0}</span>
                  </div>
                </div>
              </div>
              <Link 
                to="/profile" 
                className="block w-full text-center bg-white/20 hover:bg-white/30 py-2 rounded-lg transition duration-200"
              >
                View Profile
              </Link>
            </div>
          )}

          <form onSubmit={searchBooks} className="mt-4 mb-4 border-b pb-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search books..."
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </form>

          {isSearching ? (
            <LoadingSpinner />
          ) : (
            <div className="overflow-y-auto flex-grow">
              {searchResults.map((book) => (
                <Link 
                  to={`/book/${book.id}`}
                  key={book.id} 
                  className="block p-2 hover:bg-gray-50 rounded-lg mb-2 transition duration-200"
                >
                  <div className="flex items-center gap-2">
                    {book.volumeInfo.imageLinks?.thumbnail && (
                      <img 
                        src={book.volumeInfo.imageLinks.thumbnail} 
                        alt={book.volumeInfo.title}
                        className="w-12 h-16 object-cover rounded"
                      />
                    )}
                    <div>
                      <h3 className="font-medium text-sm">{book.volumeInfo.title}</h3>
                      <p className="text-xs text-gray-600">
                        {book.volumeInfo.authors?.join(', ')}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <nav className="space-y-4">
            <Link to="/" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition duration-200">
              <span className="text-xl">🏠</span>
              Home
            </Link>
            <Link to="/my-clubs" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition duration-200">
              <span className="text-xl">📚</span>
              My Clubs
            </Link>
          </nav>

          <button 
            onClick={handleLogout}
            className="mt-auto flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-lg transition duration-200"
          >
            <span className="text-xl">🚪</span>
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default Sidebar