import { collection, addDoc } from 'firebase/firestore'
import { db } from '../firebase/config'

/**
 * Create a notification for a user
 * @param {string} userId - The user ID to send the notification to
 * @param {string} type - Type of notification (club_join_request, club_join_accepted, etc.)
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} link - Optional link to navigate to when clicked
 */
export const createNotification = async (userId, type, title, message, link = null) => {
    try {
        await addDoc(collection(db, 'notifications'), {
            userId,
            type,
            title,
            message,
            link,
            read: false,
            createdAt: new Date().toISOString()
        })
    } catch (error) {
        console.error('❌ Error creating notification:', error)
    }
}

/**
 * Notify club creator about a join request
 */
export const notifyClubJoinRequest = async (clubId, clubName, creatorId, requesterName) => {
    await createNotification(
        creatorId,
        'club_join_request',
        'New Join Request',
        `${requesterName} wants to join "${clubName}"`,
        `/clubs/${clubId}`
    )
}

/**
 * Notify user that their join request was accepted
 */
export const notifyJoinRequestAccepted = async (userId, clubName, clubId) => {
    await createNotification(
        userId,
        'club_join_accepted',
        'Join Request Accepted! 🎉',
        `You've been accepted to join "${clubName}"`,
        `/clubs/${clubId}`
    )
}

/**
 * Notify user that their join request was rejected
 */
export const notifyJoinRequestRejected = async (userId, clubName) => {
    await createNotification(
        userId,
        'club_join_rejected',
        'Join Request Declined',
        `Your request to join "${clubName}" was declined`,
        null
    )
}

/**
 * Notify all club members about a new post
 */
export const notifyNewPost = async (clubId, clubName, clubMembers, authorId, authorName) => {
    // Don't notify the author
    const membersToNotify = clubMembers.filter(memberId => memberId !== authorId)

    const notifications = membersToNotify.map(memberId =>
        createNotification(
            memberId,
            'new_post',
            'New Discussion',
            `${authorName} posted in "${clubName}"`,
            `/clubs/${clubId}`
        )
    )

    await Promise.all(notifications)
}

/**
 * Notify club members about a new member joining
 */
export const notifyNewMember = async (clubId, clubName, clubMembers, newMemberName) => {
    const notifications = clubMembers.map(memberId =>
        createNotification(
            memberId,
            'new_member',
            'New Member',
            `${newMemberName} joined "${clubName}"`,
            `/clubs/${clubId}`
        )
    )

    await Promise.all(notifications)
}
