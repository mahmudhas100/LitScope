import { useState, useEffect } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db, auth } from '../../firebase/config'
import { Link } from 'react-router-dom'
import LoadingSpinner from '../shared/LoadingSpinner'
import CreateClubModal from './CreateClubModal'

const ClubList = () => {
  const [clubs, setClubs] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchClubsAndThreads = async () => {
      setLoading(true)
      const clubsRef = collection(db, 'clubs')
      const threadsRef = collection(db, 'threads')

      const clubsSnapshot = await getDocs(clubsRef)
      const clubsData = await Promise.all(
        clubsSnapshot.docs.map(async (doc) => {
          const clubId = doc.id
          const threadsSnapshot = await getDocs(
            query(threadsRef, where('clubId', '==', clubId))
          )
          return {
            id: clubId,
            ...doc.data(),
            discussionCount: threadsSnapshot.size
          }
        })
      )
      setClubs(clubsData)
      setLoading(false)
    }

    fetchClubsAndThreads()
  }, [])

  if (loading) {
    return <LoadingSpinner />
  }

  const filteredClubs = clubs.filter(club => {
    const user = auth.currentUser;
    const isNotMember = !club.members?.includes(user?.uid); // Filter out joined clubs
    const matchesSearch = club.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' ? true :
      filter === 'public' ? club.isPublic : !club.isPublic
    return isNotMember && matchesSearch && matchesFilter
  })

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold font-serif text-ink">Book Clubs</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 shadow-sm transition duration-200"
        >
          Create Club
        </button>
      </div>

      <CreateClubModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-stone-100">
        <h1 className="text-3xl font-bold text-ink mb-4 md:mb-0 font-serif">
          Discover Book Clubs
        </h1>
        <div className="flex gap-4 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search clubs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-stone-50 w-full md:w-64"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-stone-200 rounded-lg bg-stone-50 text-ink/80 outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Clubs</option>
            <option value="public">Public Only</option>
            <option value="private">Private Only</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClubs.map(club => (
          <Link
            to={`/clubs/${club.id}`}
            key={club.id}
            className="bg-white rounded-xl shadow-sm border border-stone-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1 block h-full"
          >
            <div className="p-6 flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-ink font-serif line-clamp-1">{club.name}</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${club.isPublic
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-primary-100 text-primary-800'
                  }`}>
                  {club.isPublic ? 'Public' : 'Private'}
                </span>
              </div>
              <p className="text-ink/60 mb-6 line-clamp-3 text-sm flex-grow">{club.description}</p>
              <div className="flex justify-between items-center text-sm text-ink/50 pt-4 border-t border-stone-100">
                <span className="flex items-center gap-1">👥 {club.members?.length || 0} members</span>
                <span className="flex items-center gap-1">💬 {club.discussionCount || 0} discussions</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredClubs.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-stone-100 shadow-sm">
          <h3 className="text-xl text-ink/50 font-serif">No clubs found matching your criteria</h3>
        </div>

      )}
    </div>
  )
}

export default ClubList