import { useState, useEffect } from "react";
import { doc, updateDoc, setDoc, onSnapshot, query, where, collection, getDocs, writeBatch } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { db } from "../../firebase/config";
import { useUser } from "../../hooks/useUser";
import LoadingSpinner from "../shared/LoadingSpinner";
// Step 2: Import UserAvatar
import UserAvatar from "../shared/UserAvatar";

const Profile = () => {
  const { user, userData, isLoading } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [favoriteGenre, setFavoriteGenre] = useState("");
  const [readingGoal, setReadingGoal] = useState(12);
  const [isSaving, setIsSaving] = useState(false);
  const [streak, setStreak] = useState(0);
  const [lastCheckIn, setLastCheckIn] = useState(null);
  const [weeklyStreak, setWeeklyStreak] = useState([]);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);

  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setLastCheckIn(data.lastCheckIn);
        setStreak(data.streak || 0);
        setWeeklyStreak(data.weeklyStreak || Array(7).fill(false));
        setBio(data.bio || "");
        setLocation(data.location || "");
        setFavoriteGenre(data.favoriteGenre || "");
        setReadingGoal(data.readingGoal || 12);

        if (data.lastCheckIn) {
          const lastCheck = new Date(data.lastCheckIn);
          const today = new Date();
          const diffDays = Math.floor((today - lastCheck) / (1000 * 60 * 60 * 24));

          if (diffDays > 1) {
            updateDoc(userRef, {
              streak: 0,
              weeklyStreak: Array(7).fill(false),
            });
          }
        }
      }
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (user?.displayName) {
      setDisplayName(user.displayName);
    }
  }, [user]);

  useEffect(() => {
    if (lastCheckIn) {
      const lastCheck = new Date(lastCheckIn);
      const today = new Date();
      setHasCheckedInToday(
        lastCheck.getDate() === today.getDate() &&
        lastCheck.getMonth() === today.getMonth() &&
        lastCheck.getFullYear() === today.getFullYear()
      );
    }
  }, [lastCheckIn]);

  useEffect(() => {
    if (userData?.username) {
      setUsername(userData.username);
    }
  }, [userData]);

  const updateDisplayNameGlobally = async (userId, newDisplayName) => {
    const batch = writeBatch(db);
    try {
      const threadsQuery = query(collection(db, 'threads'), where('authorId', '==', userId));
      const threadsSnapshot = await getDocs(threadsQuery);
      threadsSnapshot.forEach((doc) => {
        batch.update(doc.ref, { authorName: newDisplayName });
      });

      const commentsQuery = query(collection(db, 'comments'), where('authorId', '==', userId));
      const commentsSnapshot = await getDocs(commentsQuery);
      commentsSnapshot.forEach((doc) => {
        batch.update(doc.ref, { authorName: newDisplayName });
      });

      const clubsSnapshot = await getDocs(collection(db, 'clubs'));
      clubsSnapshot.forEach((clubDoc) => {
        const pendingRequests = clubDoc.data().pendingRequests || [];
        const updated = pendingRequests.map(req =>
          req.userId === userId ? { ...req, userName: newDisplayName } : req
        );

        if (JSON.stringify(pendingRequests) !== JSON.stringify(updated)) {
          batch.update(clubDoc.ref, { pendingRequests: updated });
        }
      });

      await batch.commit();
    } catch (error) {
      console.error('❌ Error updating display name globally:', error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const oldDisplayName = user.displayName;
      const hasNameChanged = displayName !== oldDisplayName;

      if (hasNameChanged) {
        await updateProfile(user, { displayName });
      }

      const userRef = doc(db, "users", user.uid);
      await setDoc(
        userRef,
        {
          displayName,
          username,
          location,
          favoriteGenre,
          readingGoal,
          email: user.email,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      if (hasNameChanged) {
        await updateDisplayNameGlobally(user.uid, displayName);
      }

      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCheckIn = async () => {
    if (!user || hasCheckedInToday) return;

    const today = new Date();
    const userRef = doc(db, "users", user.uid);

    const newWeeklyStreak = [...(userData?.weeklyStreak || Array(7).fill(false))];
    newWeeklyStreak[today.getDay()] = true;

    const isConsecutive = lastCheckIn
      ? new Date(lastCheckIn).getDate() === today.getDate() - 1
      : false;

    await updateDoc(userRef, {
      lastCheckIn: today.toISOString(),
      streak: isConsecutive ? streak + 1 : 1,
      weeklyStreak: newWeeklyStreak,
    });

    setHasCheckedInToday(true);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-gradient-to-br from-primary-50 to-orange-50 rounded-xl shadow-lg border border-primary-100 p-8 mb-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            {/* Step 2: Use UserAvatar Component */}
            <UserAvatar
              user={user}
              displayName={displayName}
              size="xl"
              className="shadow-xl ring-4 ring-white"
            />
            <div>
              <h1 className="text-3xl font-bold text-ink font-serif mb-1">
                {displayName || "Add a name"}
              </h1>
              <p className="text-ink/60 text-lg">
                {username ? `@${username}` : "Add a username"}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-5 py-2.5 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition duration-200 font-medium"
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        <div className="relative">
          {isEditingBio ? (
            <div className="space-y-2">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                className="w-full p-4 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white resize-none"
                rows="3"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={async () => {
                    const userRef = doc(db, "users", user.uid);
                    await setDoc(userRef, { bio }, { merge: true });
                    setIsEditingBio(false);
                  }}
                  className="px-4 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
                >
                  Save Bio
                </button>
                <button
                  onClick={() => setIsEditingBio(false)}
                  className="px-4 py-1.5 border border-stone-300 rounded-lg hover:bg-stone-50 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="relative group">
              {bio ? (
                <p className="text-ink/70 bg-white/60 p-4 rounded-lg border border-stone-100 pr-12">
                  {bio}
                </p>
              ) : (
                <p className="text-ink/40 bg-white/60 p-4 rounded-lg border border-stone-100 pr-12 italic text-sm">
                  Click the pencil to add a bio
                </p>
              )}
              <button
                onClick={() => setIsEditingBio(true)}
                className="absolute top-3 right-3 p-2 text-ink/40 hover:text-ink hover:bg-white rounded-lg transition"
                title="Edit bio"
              >
                ✏️
              </button>
            </div>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="bg-white rounded-xl shadow-lg border border-stone-100 p-6 mb-6">
          <h2 className="text-xl font-bold text-ink font-serif mb-4">Edit Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Display Name"
              className="px-4 py-2.5 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="px-4 py-2.5 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="📍 Location"
              className="px-4 py-2.5 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
            <input
              type="text"
              value={favoriteGenre}
              onChange={(e) => setFavoriteGenre(e.target.value)}
              placeholder="📚 Favorite Genre"
              className="px-4 py-2.5 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
            <div>
              <label className="block text-sm text-ink/60 mb-1">Reading Goal (books/year)</label>
              <input
                type="number"
                value={readingGoal}
                onChange={(e) => setReadingGoal(parseInt(e.target.value))}
                className="w-full px-4 py-2.5 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg transition duration-200 font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          {!isEditing && (location || favoriteGenre || readingGoal) && (
            <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-6">
              <h2 className="text-xl font-bold text-ink font-serif mb-4">About</h2>
              <div className="space-y-3">
                {location && (
                  <div className="flex items-center gap-2 text-ink/70">
                    <span>📍</span>
                    <span>{location}</span>
                  </div>
                )}
                {favoriteGenre && (
                  <div className="flex items-center gap-2 text-ink/70">
                    <span>📚</span>
                    <span>{favoriteGenre}</span>
                  </div>
                )}
                {readingGoal && (
                  <div className="flex items-center gap-2 text-ink/70">
                    <span>🎯</span>
                    <span>Goal: {readingGoal} books/year</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-6">
            <h2 className="text-xl font-bold text-ink font-serif mb-4">Account</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-ink/60">Email</span>
                <span className="font-medium text-ink">{user?.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-ink/60">Joined</span>
                <span className="font-medium text-ink">
                  {new Date(user?.metadata.creationTime).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl shadow-sm border border-emerald-100 p-6 text-center">
          <h2 className="text-xl font-bold text-ink font-serif mb-4">Reading Streak</h2>

          <div className="mb-6">
            <div className="text-6xl font-bold text-emerald-600 mb-2">
              🔥 {streak}
            </div>
            <p className="text-lg text-ink/60 font-medium">days in a row</p>
          </div>

          <button
            onClick={handleCheckIn}
            disabled={hasCheckedInToday}
            className={`w-full px-6 py-2.5 rounded-xl transition duration-200 font-bold shadow-lg ${hasCheckedInToday
                ? "bg-stone-200 text-ink/40 cursor-not-allowed"
                : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white hover:shadow-xl transform hover:-translate-y-0.5"
              }`}
          >
            {hasCheckedInToday ? "✓ Checked In Today" : "Check In Today"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;