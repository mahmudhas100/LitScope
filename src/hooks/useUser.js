import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { auth, db } from '../firebase/config'

export const useUser = () => {
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      
      if (currentUser) {
        const unsubscribeFirestore = onSnapshot(
          doc(db, 'users', currentUser.uid), 
          (doc) => {
            if (doc.exists()) {
              setUserData(doc.data())
            }
            setIsLoading(false)
          },
          (error) => {
            console.error('Error fetching user data:', error)
            setIsLoading(false)
          }
        )
        return () => unsubscribeFirestore()
      } else {
        setUserData(null)
        setIsLoading(false)
      }
    })

    return () => unsubscribeAuth()
  }, [])

  return { user, userData, isLoading }
}
export default useUser