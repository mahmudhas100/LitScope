import { useState, useEffect } from "react";
import { doc, updateDoc, setDoc, onSnapshot } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { db } from "../../firebase/config";
import { useUser } from "../../hooks/useUser";
import LoadingSpinner from "../shared/LoadingSpinner";

const Profile = () => {
  const { user, userData, isLoading } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [username, setUsername] = useState("");  // Initialize empty
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

        // Check if streak should be reset
        if (data.lastCheckIn) {
          const lastCheck = new Date(data.lastCheckIn);
          const today = new Date();
          const diffDays = Math.floor(
            (today - lastCheck) / (1000 * 60 * 60 * 24)
          );

          if (diffDays > 1) {
            // Reset streak if more than 1 day has passed
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

  // Add this useEffect to update username when userData changes
  useEffect(() => {
    if (userData && userData.username) {
      setUsername(userData.username);
    }
  }, [userData]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (displayName !== user.displayName) {
        await updateProfile(user, { displayName });
      }

      const userRef = doc(db, "users", user.uid);
      await setDoc(
        userRef,
        {
          username,
          email: user.email,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

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

    // Create new weekly streak array
    const newWeeklyStreak = [
      ...(userData?.weeklyStreak || Array(7).fill(false)),
    ];
    newWeeklyStreak[today.getDay()] = true;

    // Check if last check-in was yesterday
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

  const yesterday = () => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date.toISOString().split("T")[0];
  };

  if (isLoading) return <LoadingSpinner />;

  const renderWeeklyStreak = () => (
    <div className="flex gap-7 justify-center my-4">
      {weeklyStreak.map((day, index) => (
        <div
          key={index}
          className={`w-11 h-11 rounded-full flex items-center justify-center ${
            day ? "bg-green-500 text-white" : "bg-gray-200"
          }`}
        >
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][index]}
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-3xl font-bold text-blue-600">
              {displayName[0]?.toUpperCase() || "👤"}
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
                <h1 className="text-2xl font-bold text-gray-800">
                  {displayName || "Add a name"}
                </h1>
                <p className="text-gray-600">
                  {username ? `@${username}` : "Add a username"}
                </p>
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
                {isSaving ? "Saving..." : "Save"}
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
                <p className="font-medium">
                  {user?.emailVerified ? "✅ Verified" : "⚠️ Not Verified"}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Member Since</p>
                <p className="font-medium">
                  {new Date(user?.metadata.creationTime).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">Reading Streak</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-blue-600">
                  🔥 {streak} days
                </p>
                <p className="text-gray-600">Current reading streak</p>
              </div>
              <button
                onClick={handleCheckIn}
                disabled={hasCheckedInToday}
                className={`px-6 py-2 rounded-lg transition duration-200 ${
                  hasCheckedInToday
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {hasCheckedInToday ? "Checked In Today" : "Check In Today"}
              </button>
            </div>
            {renderWeeklyStreak()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
