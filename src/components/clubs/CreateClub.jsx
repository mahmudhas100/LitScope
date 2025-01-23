import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../../firebase/config'
import { collection, addDoc } from 'firebase/firestore'

const CreateClub = () => {
  const [user, setUser] = useState(null)
  const [clubName, setClubName] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser)
      } else {
        navigate('/login')
      }
    })

    return () => unsubscribe()
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const clubData = {
      name: clubName,
      description,
      isPublic,
      createdBy: user.uid,
      createdAt: new Date().toISOString(),
      members: [user.uid],
      memberCount: 1,
      pendingRequests: []
    }
    
    try {
      await addDoc(collection(db, 'clubs'), clubData)
      navigate('/my-clubs')
    } catch (error) {
      console.error('Error creating club:', error)
    }
  }
  if (!user) return null

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Create New Book Club</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Club Name</label>
          <input
            type="text"
            value={clubName}
            onChange={(e) => setClubName(e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded-md"
            rows="4"
            required
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="rounded"
          />
          <label>Make this club public</label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
        >
          {isLoading ? 'Creating...' : 'Create Club'}
        </button>
      </form>
    </div>
  )
}

export default CreateClub