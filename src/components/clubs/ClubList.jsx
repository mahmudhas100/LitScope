import { useState, useEffect } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { Link } from 'react-router-dom'
import LoadingSpinner from '../shared/LoadingSpinner'

const ClubList = () => {
  const [clubs, setClubs] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

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
    const matchesSearch = club.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' ? true : 
      filter === 'public' ? club.isPublic : !club.isPublic
    return matchesSearch && matchesFilter
  })

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">
          Discover Book Clubs
        </h1>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search clubs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-white"
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
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-800">{club.name}</h2>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  club.isPublic 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {club.isPublic ? 'Public' : 'Private'}
                </span>
              </div>
              <p className="text-gray-600 mb-4 line-clamp-2">{club.description}</p>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>👥 {club.members?.length || 0} members</span>
                <span>💬 {club.discussionCount || 0} discussions</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {filteredClubs.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl text-gray-600">No clubs found matching your criteria</h3>
        </div>
      )}
    </div>
  )
}

export default ClubList