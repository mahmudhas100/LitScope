import { useState, useEffect } from 'react'
import { doc, updateDoc, setDoc, onSnapshot } from 'firebase/firestore'
import { updateProfile } from 'firebase/auth'
import { db } from '../../firebase/config'
import { useUser } from '../../hooks/useUser'
import LoadingSpinner from '../shared/LoadingSpinner'

const Profile = () => {
  const { user, userData, isLoading } = useUser()
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [username, setUsername] = useState(userData?.username || '')
  const [isSaving, setIsSaving] = useState(false)
  const [streak, setStreak] = useState(0)
  const [lastCheckIn, setLastCheckIn] = useState(null)

  useEffect(() => {
    if (!user) return

    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data()
        setUsername(data.username || '')
        setStreak(data.streak || 0)
        setLastCheckIn(data.lastCheckIn)
      }
    })

    return () => unsubscribe()
  }, [user])

  useEffect(() => {
    if (user?.displayName) {
      setDisplayName(user.displayName)
    }
  }, [user])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      if (displayName !== user.displayName) {
        await updateProfile(user, { displayName })
      }
      
      const userRef = doc(db, 'users', user.uid)
      await setDoc(userRef, {
        username,
        email: user.email,
        updatedAt: new Date().toISOString()
      }, { merge: true })

      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCheckIn = async () => {
    const today = new Date().toISOString().split('T')[0]
    const userRef = doc(db, 'users', user.uid)
    
    if (lastCheckIn !== today) {
      const newStreak = lastCheckIn === yesterday() ? streak + 1 : 1
      await setDoc(userRef, {
        streak: newStreak,
        lastCheckIn: today
      }, { merge: true })
    }
  }

  const yesterday = () => {
    const date = new Date()
    date.setDate(date.getDate() - 1)
    return date.toISOString().split('T')[0]
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-3xl font-bold text-blue-600">
              {displayName[0]?.toUpperCase() || '👤'}
            </div>
            {isEditing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Display Name"
                  className="block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ) : (
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{displayName || 'Add a name'}</h1>
                <p className="text-gray-600">{username ? `@${username}` : 'Add a username'}</p>
              </div>
            )}
          </div>
          
          {isEditing ? (
            <div className="space-x-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Edit Profile
            </button>
          )}
        </div>

        <div className="space-y-6">
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">Account Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500">Email Status</p>
                <p className="font-medium">{user?.emailVerified ? '✅ Verified' : '⚠️ Not Verified'}</p>
              </div>
              <div>
                <p className="text-gray-500">Member Since</p>
                <p className="font-medium">{new Date(user?.metadata.creationTime).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">Reading Streak</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-blue-600">🔥 {streak} days</p>
                <p className="text-gray-600">Current reading streak</p>
              </div>
              <button
                onClick={handleCheckIn}
                disabled={lastCheckIn === new Date().toISOString().split('T')[0]}
                className={`px-4 py-2 rounded-lg transition ${
                  lastCheckIn === new Date().toISOString().split('T')[0]
                    ? 'bg-gray-100 text-gray-500'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {lastCheckIn === new Date().toISOString().split('T')[0] ? 'Already Checked In' : 'Check In Today'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile