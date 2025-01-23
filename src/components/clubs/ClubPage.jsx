import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  doc, 
  getDoc, 
  collection,
  query,
  where,
  orderBy,
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  deleteDoc,
  onSnapshot,
  addDoc
} from 'firebase/firestore'
import { auth, db } from '../../firebase/config'
import ThreadList from '../threads/ThreadList'
import LoadingSpinner from '../shared/LoadingSpinner'

const ClubPage = () => {
  const navigate = useNavigate()
  const { clubId } = useParams()
  const user = auth.currentUser
  const [club, setClub] = useState(null)
  const [isMember, setIsMember] = useState(false)
  const [newThread, setNewThread] = useState('')
  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(true)
  const [isPending, setIsPending] = useState(false)
  const [pendingRequests, setPendingRequests] = useState([])
  const [showMenu, setShowMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const isCreator = club?.createdBy === user?.uid
    useEffect(() => {
      if (!clubId) return

      const unsubscribeClub = onSnapshot(doc(db, 'clubs', clubId), async (docSnapshot) => {
        if (docSnapshot.exists()) {
          const clubData = docSnapshot.data()
          const members = clubData.members || []
          const isCreatorMember = members.includes(clubData.createdBy)
          
          // One-time update to ensure creator is a member
          if (clubData.createdBy && !isCreatorMember) {
            const updatedMembers = [...members, clubData.createdBy]
            await updateDoc(doc(db, 'clubs', clubId), {
              members: updatedMembers,
              memberCount: updatedMembers.length
            })
          }

          setClub({
            id: docSnapshot.id,
            ...clubData,
            members: isCreatorMember ? members : [...members, clubData.createdBy],
            memberCount: isCreatorMember ? members.length : members.length + 1
          })
          
          // Set member status based on user role
          setIsMember(clubData.createdBy === user?.uid || members.includes(user?.uid))
          setPendingRequests(clubData.pendingRequests || [])
          setIsPending(clubData.pendingRequests?.some(req => req.userId === user?.uid))
          setEditName(clubData.name)
          setEditDescription(clubData.description)
        }
        setLoading(false)
      })

      const threadsRef = collection(db, 'threads')
      const q = query(
        threadsRef,
        where('clubId', '==', clubId),
        orderBy('createdAt', 'desc')
      )

      const unsubscribeThreads = onSnapshot(q, (snapshot) => {
        const threadData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setThreads(threadData)
      })

      return () => {
        unsubscribeClub()
        unsubscribeThreads()
      }
    }, [clubId, user?.uid])

    const handleCreateThread = async (e) => {
      e.preventDefault()
    
      if (!isMember) {
        alert("You must be a member to post in this club")
        return
      }

      const threadData = {
        content: newThread,
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        clubId,
        createdAt: new Date().toISOString(),
        likes: 0,
        likedBy: [],
        comments: []
      }

    try {
      await addDoc(collection(db, 'threads'), threadData)
      setNewThread('')
    } catch (error) {
      console.error('Error creating thread:', error)
    }
  }

  const handleJoinRequest = async () => {
    const requestData = {
      userId: user.uid,
      userName: user.displayName || 'Anonymous',
      timestamp: new Date().toISOString()
    }
  
    await updateDoc(doc(db, 'clubs', clubId), {
      pendingRequests: arrayUnion(requestData)
    })
    setIsPending(true)
  }

  const handleRequestResponse = async (requestUserId, accept) => {
    const clubRef = doc(db, 'clubs', clubId)
    const clubDoc = await getDoc(clubRef)
    const currentRequests = clubDoc.data().pendingRequests || []
    
    if (accept) {
      await updateDoc(clubRef, {
        members: arrayUnion(requestUserId),
        memberCount: (club.memberCount || 0) + 1,
        pendingRequests: currentRequests.filter(req => req.userId !== requestUserId)
      })
    } else {
      await updateDoc(clubRef, {
        pendingRequests: currentRequests.filter(req => req.userId !== requestUserId)
      })
    }
  }

  const handleEditSubmit = async () => {
    const clubRef = doc(db, 'clubs', clubId)
    await updateDoc(clubRef, {
      name: editName,
      description: editDescription,
      updatedAt: new Date().toISOString()
    })
    setIsEditing(false)
  }

  const handleDeleteClub = async () => {
    if (window.confirm('Are you sure you want to delete this club?')) {
      try {
        await deleteDoc(doc(db, 'clubs', clubId))
        navigate('/my-clubs')
      } catch (error) {
        console.error('Error deleting club:', error)
      }
    }
  }

  const handleStartVoiceChat = () => {
    alert('Coming as slow as possible...')
  }

  if (!user || loading) return <LoadingSpinner />

  return (
    <div className="relative max-w-4xl mx-auto p-6">
      {isCreator && (
        <div className="absolute top-7 right-7">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 hover:bg-gray-300 rounded-xl"
          >
            <svg className="w-6 h-6" fill="black" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </button>
        
          {showMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-50">
              <button 
                onClick={() => setIsEditing(true)}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-md border-b"
              >
                Edit Club
              </button>
              
              {pendingRequests.length > 0 && (
                <div className="border-t">
                  <div className="px-4 py-2 text-sm font-medium text-gray-700">
                    Pending Requests ({pendingRequests.length})
                  </div>
                  {pendingRequests.map(request => (
                    <div key={request.userId} className="px-4 py-2 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{request.userName}</span>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleRequestResponse(request.userId, true)}
                            className="text-sm px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                          >
                            Accept
                          </button>
                          <button 
                            onClick={() => handleRequestResponse(request.userId, false)}
                            className="text-sm px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <button 
                onClick={handleDeleteClub}
                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 rounded-md border-t"
              >
                Delete Club
              </button>
            </div>
          )}
        </div>
      )}
    
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-8 mb-8 text-white">
        <h1 className="text-4xl font-bold mb-4">{club?.name}</h1>
        <p className="text-lg opacity-90 mb-6">{club?.description}</p>
        <div className="flex items-center gap-6">
          <div className="flex items-center">
            <span className="text-2xl mr-2">👥</span>
            <div>
              <p className="font-semibold">{club?.memberCount || 0}</p>
              <p className="text-sm opacity-75">Members</p>
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-2xl mr-2">💬</span>
            <div>
              <p className="font-semibold">{threads.length}</p>
              <p className="text-sm opacity-75">Discussions</p>
            </div>
          </div>
          <span className={`px-4 py-1 rounded-full text-sm ${
            club?.isPublic 
              ? 'bg-green-400 bg-opacity-20' 
              : 'bg-purple-400 bg-opacity-20'
          }`}>
            {club?.isPublic ? '🌎 Public Club' : '🔒 Private Club'}
          </span>
          {!isMember && (
            <button
              onClick={handleJoinRequest}
              disabled={isPending}
              className="ml-auto px-6 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition duration-200"
            >
              {isPending ? 'Request Pending' : 'Request to Join'}
            </button>
          )}
        </div>
      </div>

      {isMember ? (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Start a Discussion</h2>
          <form onSubmit={handleCreateThread} className="flex flex-col">
            <textarea
              value={newThread}
              onChange={(e) => setNewThread(e.target.value)}
              className="w-full p-4 border rounded-lg mb-4 min-h-[120px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Share your thoughts with the club..."
              required
            />
            <div className="flex justify-between items-center mt-4">
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition duration-200 font-semibold mr-4"
              >
                Post Thread
              </button>
              <button
                type="button"
                onClick={handleStartVoiceChat}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition duration-200 font-semibold"
              >
                Start Voice Chat
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="text-center p-6 bg-secondary rounded-lg">
          <p className="text-primary mb-4">Join this club to participate in discussions</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Recent Discussions</h2>
        <ThreadList threads={threads} />
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Edit Club</h2>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full p-2 border rounded mb-4"
              placeholder="Club Name"
            />
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full p-2 border rounded mb-4"
              placeholder="Description"
              rows="4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClubPage