import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../../firebase/config";
import { addDoc, collection } from "firebase/firestore";

const CreateClubModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = auth.currentUser;
      const docRef = await addDoc(collection(db, "clubs"), {
        name,
        description,
        isPublic,
        createdBy: user.uid,
        createdAt: new Date().toISOString(),
        members: [user.uid],
        memberCount: 1,
        pendingRequests: [],
      });
      onClose();
      navigate(`/clubs/${docRef.id}`);
    } catch (error) {
      console.error("Error creating club:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center backdrop-blur-sm">
      <div
        className="bg-white rounded-xl p-8 max-w-md w-full m-4 shadow-xl border border-stone-100"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-6 text-ink font-serif">Create a New Club</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-ink/80 text-sm font-bold mb-2">
              Club Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-stone-50"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-ink/80 text-sm font-bold mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-stone-50"
              rows="4"
              required
            />
          </div>
          <div className="mb-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="mr-3 w-5 h-5 text-primary-600 rounded focus:ring-primary-500 border-gray-300"
              />
              <span className="text-sm text-ink/80 font-medium">
                Make this club public
              </span>
            </label>
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-ink/60 hover:bg-stone-100 rounded-lg transition duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition duration-200 font-medium shadow-sm"
            >
              {isLoading ? "Creating..." : "Create Club"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClubModal;
