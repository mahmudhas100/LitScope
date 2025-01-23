import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase/config";
import { collection, getDocs, query, where } from "firebase/firestore";
import LoadingSpinner from "../shared/LoadingSpinner";

const MyClubs = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      alert("Please sign in or create an account to view your clubs");
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchUserClubs = async () => {
      setLoading(true);
      const clubsRef = collection(db, "clubs");
      const threadsRef = collection(db, "threads");

      const clubsSnapshot = await getDocs(
        query(clubsRef, where("members", "array-contains", user.uid))
      );

      const clubsData = await Promise.all(
        clubsSnapshot.docs.map(async (doc) => {
          const clubId = doc.id;
          const threadsSnapshot = await getDocs(
            query(threadsRef, where("clubId", "==", clubId))
          );
          return {
            id: clubId,
            ...doc.data(),
            discussionCount: threadsSnapshot.size,
          };
        })
      );

      setClubs(clubsData);
      setLoading(false);
    };

    if (user) {
      fetchUserClubs();
    }
  }, [user]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">My Book Clubs</h1>

      {clubs.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl text-gray-600 mb-4">
            You haven't joined any clubs yet
          </h2>
          <Link
            to="/clubs"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Discover Clubs
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map((club) => (
            <Link
              to={`/clubs/${club.id}`}
              key={club.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  {club.name}
                </h2>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {club.description}
                </p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>👥 {club.memberCount || 0} members</span>
                  <span>💬 {club.discussionCount || 0} discussions</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyClubs;
