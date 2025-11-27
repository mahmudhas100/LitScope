import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useUser } from '../../hooks/useUser'
import { useNavigate } from 'react-router-dom'
import { BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { BellIcon as BellIconSolid } from '@heroicons/react/24/solid'

const NotificationPanel = () => {
  const { user } = useUser()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user) return

    const notificationsRef = collection(db, 'notifications')
    const q = query(
      notificationsRef,
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setNotifications(notifs)
      setUnreadCount(notifs.filter(n => !n.read).length)
    })

    return () => unsubscribe()
  }, [user])

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.read) {
      await updateDoc(doc(db, 'notifications', notification.id), {
        read: true
      })
    }

    // Navigate based on notification type
    if (notification.link) {
      navigate(notification.link)
      setIsOpen(false)
    }
  }

  const handleDeleteNotification = async (e, notificationId) => {
    e.stopPropagation()
    await deleteDoc(doc(db, 'notifications', notificationId))
  }

  const getNotificationIcon = (type) => {
    const iconMap = {
      'club_join_request': '👥',
      'club_join_accepted': '✅',
      'club_join_rejected': '❌',
      'new_post': '💬',
      'new_comment': '💭',
      'new_member': '🎉',
    }
    return iconMap[type] || '🔔'
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-stone-100 rounded-lg transition duration-200"
      >
        {unreadCount > 0 ? (
          <BellIconSolid className="w-6 h-6 text-primary-600" />
        ) : (
          <BellIcon className="w-6 h-6 text-ink/60" />
        )}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-stone-200 z-50 max-h-[32rem] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <h3 className="text-lg font-bold text-ink font-serif">Notifications</h3>
              <span className="text-sm text-ink/60">{notifications.length} total</span>
            </div>

            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-4xl mb-2">🔔</div>
                  <p className="text-ink/60">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 border-b border-stone-100 cursor-pointer transition-colors hover:bg-stone-50 ${
                      !notification.read ? 'bg-primary-50/30' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!notification.read ? 'font-semibold text-ink' : 'text-ink/80'}`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-ink/60 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <span className="text-xs text-ink/40 mt-1 block">
                          {formatTime(notification.createdAt)}
                        </span>
                      </div>
                      <button
                        onClick={(e) => handleDeleteNotification(e, notification.id)}
                        className="text-ink/40 hover:text-rose-600 transition-colors flex-shrink-0"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default NotificationPanel
