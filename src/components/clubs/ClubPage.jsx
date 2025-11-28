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
  deleteDoc,
  onSnapshot,
  addDoc
} from 'firebase/firestore'
import { auth, db } from '../../firebase/config'
import ThreadList from '../threads/ThreadList'
import LoadingSpinner from '../shared/LoadingSpinner'
// Step 1: Add Import
import { notifyClubJoinRequest, notifyJoinRequestAccepted, notifyJoinRequestRejected, notifyNewPost } from '../../utils/notifications'

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
  const [memberDetails, setMemberDetails] = useState([])
  const [showMembersModal, setShowMembersModal] = useState(false)

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

  // Fetch member details
  useEffect(() => {
    if (!club?.members) return
    const fetchMemberDetails = async () => {
      const details = await Promise.all(
        club.members.map(async (memberId) => {
          try {
            const userDoc = await getDoc(doc(db, 'users', memberId))
            if (userDoc.exists()) {
              return {
                id: memberId,
                name: userDoc.data().displayName || 'Anonymous',
                isCreator: memberId === club.createdBy
              }
            }
          } catch (error) {
            console.error('Error fetching member:', error)
          }
          return null
        })
      )
      setMemberDetails(details.filter(d => d !== null))
    }
    fetchMemberDetails()
  }, [club?.members, club?.createdBy])

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

      // Step 4: Add to handleCreateThread
      await notifyNewPost(clubId, club.name, club.members, user.uid, user.displayName || 'Anonymous')
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

    // Step 2: Add to handleJoinRequest
    await notifyClubJoinRequest(clubId, club.name, club.createdBy, user.displayName || 'Anonymous')
  }

  const handleCancelRequest = async () => {
    const clubRef = doc(db, 'clubs', clubId)
    const clubDoc = await getDoc(clubRef)
    const currentRequests = clubDoc.data().pendingRequests || []

    // Remove the user's request
    const updatedRequests = currentRequests.filter(req => req.userId !== user.uid)

    await updateDoc(clubRef, {
      pendingRequests: updatedRequests
    })

    setIsPending(false)
  }

  const handleLeaveClub = async () => {
    if (!confirm('Are you sure you want to leave this club?')) return
    try {
      const clubRef = doc(db, 'clubs', clubId)
      await updateDoc(clubRef, {
        members: arrayRemove(user.uid),
        memberCount: increment(-1)
      })
      alert('You have left the club')
      navigate('/clubs')
    } catch (error) {
      console.error('Error leaving club:', error)
      alert('Failed to leave club')
    }
  }

  const handleRemoveMember = async (memberId) => {
    if (memberId === user.uid) {
      alert('You cannot remove yourself. Use the Leave Club button instead.')
      return
    }
    if (!confirm('Are you sure you want to remove this member?')) return
    try {
      const clubRef = doc(db, 'clubs', clubId)
      await updateDoc(clubRef, {
        members: arrayRemove(memberId),
        memberCount: increment(-1)
      })
    } catch (error) {
      console.error('Error removing member:', error)
      alert('Failed to remove member')
    }
  }

  const handleRequestResponse = async (requestUserId, accept) => {
    const clubRef = doc(db, 'clubs', clubId)
    const clubDoc = await getDoc(clubRef)
    const currentRequests = clubDoc.data().pendingRequests || []

    // Step 3: Add to handleRequestResponse
    if (accept) {
      await updateDoc(clubRef, {
        members: arrayUnion(requestUserId),
        memberCount: (club.memberCount || 0) + 1,
        pendingRequests: currentRequests.filter(req => req.userId !== requestUserId)
      })
      // Add Accepted Notification
      await notifyJoinRequestAccepted(requestUserId, club.name, clubId)
    } else {
      await updateDoc(clubRef, {
        pendingRequests: currentRequests.filter(req => req.userId !== requestUserId)
      })
      // Add Rejected Notification
      await notifyJoinRequestRejected(requestUserId, club.name)
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
    <div className="max-w-4xl mx-auto p-6 relative">
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

      {/* Change 1: Club Header Gradient */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-xl shadow-lg p-8 mb-8 text-white">
        {/* Change 2: Club Name Heading */}
        <h1 className="text-4xl font-bold mb-4 font-serif">{club?.name}</h1>
        <p className="text-lg opacity-90 mb-6">{club?.description}</p>
        <div className="flex items-center gap-6">
          <div
            className="flex items-center cursor-pointer hover:bg-white/10 rounded-lg p-2 transition"
            onClick={() => setShowMembersModal(true)}
          >
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
          <span className={`px-4 py-1 rounded-full text-sm ${club?.isPublic
            ? 'bg-green-400 bg-opacity-20'
            : 'bg-purple-400 bg-opacity-20'
            }`}>
            {club?.isPublic ? '🌐 Public Club' : '🔒 Private Club'}
          </span>
          {!isMember ? (
            isPending ? (
              <button
                onClick={handleCancelRequest}
                className="ml-auto px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-white rounded-lg transition duration-200"
              >
                Cancel Request
              </button>
            ) : (
              <button
                onClick={handleJoinRequest}
                className="ml-auto px-6 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition duration-200"
              >
                Request to Join
              </button>
            )
          ) : !isCreator && (
            <button
              onClick={handleLeaveClub}
              className="ml-auto px-6 py-2 bg-red-600/80 hover:bg-red-700 text-white rounded-lg transition duration-200 font-medium"
            >
              Leave Club
            </button>
          )}
        </div>
      </div>

      {isMember ? (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          {/* Change 5: "Start a Discussion" Heading */}
          <h2 className="text-2xl font-bold mb-4 font-serif text-ink">Start a Discussion</h2>
          <form onSubmit={handleCreateThread} className="flex flex-col">
            {/* Change 4: Textarea Border Focus */}
            <textarea
              value={newThread}
              onChange={(e) => setNewThread(e.target.value)}
              className="w-full p-4 border rounded-lg mb-4 min-h-[120px] focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Share your thoughts with the club..."
              required
            />
            <div className="flex justify-between items-center mt-4">
              {/* Change 3: "Post Thread" Button */}
              <button
                type="submit"
                className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-2 rounded-lg hover:from-primary-600 hover:to-primary-700 transition duration-200 font-semibold mr-4"
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
        {/* Change 6: "Recent Discussions" Heading */}
        <h2 className="text-2xl font-bold mb-6 font-serif text-ink">Recent Discussions</h2>
        {threads.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No discussions yet. Be the first to start a conversation!</p>
          </div>
        ) : (
          <ThreadList threads={threads} />
        )}
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
              {/* Change 7: Edit Club Button */}
              <button
                onClick={handleEditSubmit}
                className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {showMembersModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowMembersModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              {/* Change 8: Members Modal Heading */}
              <h2 className="text-2xl font-bold text-ink font-serif">
                Club Members ({club?.memberCount || 0})
              </h2>
              <button
                onClick={() => setShowMembersModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {memberDetails.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition border border-gray-100"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    {/* Change 9: Member Names in Modal */}
                    <p className="font-semibold text-ink">{member.name}</p>
                  </div>
                  {member.isCreator ? (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-semibold">
                      Creator
                    </span>
                  ) : isCreator && (
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs rounded-lg font-medium transition"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            {memberDetails.length === 0 && (
              <p className="text-center text-gray-500 py-8">No members yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ClubPage