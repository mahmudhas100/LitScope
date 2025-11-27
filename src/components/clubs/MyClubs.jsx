import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase/config";
import { collection, getDocs, query, where } from "firebase/firestore";
import LoadingSpinner from "../shared/LoadingSpinner";
import CreateClubModal from './CreateClubModal';

const MyClubs = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-ink font-serif">My Clubs</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition duration-200 font-medium shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
        >
          Create Club
        </button>
      </div>
      
      <CreateClubModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      {clubs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-stone-100 shadow-sm">
          <h2 className="text-xl text-ink/60 mb-4 font-serif">
            You haven't joined any clubs yet
          </h2>
          <Link
            to="/clubs"
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition duration-200 font-medium shadow-sm"
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
              className="bg-white rounded-xl shadow-sm border border-stone-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1 block h-full"
            >
              <div className="p-6 flex flex-col h-full">
                <h2 className="text-xl font-bold text-ink mb-2 font-serif line-clamp-1">
                  {club.name}
                </h2>
                <p className="text-ink/60 mb-6 line-clamp-2 text-sm flex-grow">
                  {club.description}
                </p>
                <div className="flex justify-between items-center text-sm text-ink/50 pt-4 border-t border-stone-100">
                  <span className="flex items-center gap-1">👥 {club.memberCount || 0} members</span>
                  <span className="flex items-center gap-1">💬 {club.discussionCount || 0} discussions</span>
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
