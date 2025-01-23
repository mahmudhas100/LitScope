import { auth, db } from "../../firebase/config";
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  deleteDoc,
} from "firebase/firestore";
import Comment from "./Comment";
import OptionsMenu from "../shared/OptionsMenu";

const ThreadList = ({ threads }) => {
  const handleLike = async (threadId, likedBy) => {
    const userId = auth.currentUser.uid;
    const threadRef = doc(db, "threads", threadId);

    if (likedBy.includes(userId)) {
      await updateDoc(threadRef, {
        likes: likedBy.length - 1,
        likedBy: arrayRemove(userId),
      });
    } else {
      await updateDoc(threadRef, {
        likes: likedBy.length + 1,
        likedBy: arrayUnion(userId),
      });
    }
  };

  const handleEditThread = async (threadId, newContent) => {
    const threadRef = doc(db, "threads", threadId);
    await updateDoc(threadRef, {
      content: newContent,
      edited: true,
    });
  };

  const handleDeleteThread = async (threadId) => {
    if (window.confirm("Are you sure you want to delete this thread?")) {
      await deleteDoc(doc(db, "threads", threadId));
    }
  };

  return (
    <div className="space-y-6">
      {threads.map((thread) => (
        <div
          key={thread.id}
          className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition duration-200"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                {thread.authorName[0].toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  {thread.authorName}
                </h3>
                
                <p className="text-sm text-gray-500">
                  {new Date(thread.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
            <OptionsMenu
              isAuthor={thread.authorId === auth.currentUser?.uid}
              onEdit={() => {
                const newContent = prompt("Edit your thread:", thread.content);
                if (newContent) handleEditThread(thread.id, newContent);
              }}
              onDelete={() => handleDeleteThread(thread.id)}
            />
          </div>

          <p className="text-gray-700 mb-4 text-lg">{thread.content}</p>

          <div className="flex gap-6">
            <button
              onClick={() => handleLike(thread.id, thread.likedBy)}
              className={`flex items-center gap-2 transition duration-200 ${
                thread.likedBy?.includes(auth.currentUser?.uid)
                  ? "text-red-500"
                  : "text-gray-500 hover:text-red-500"
              }`}
            >
              <span className="text-xl">
                {thread.likedBy?.includes(auth.currentUser?.uid) ? "❤️" : "🤍"}
              </span>
              <span className="font-medium">{thread.likes}</span>
            </button>

            <Comment threadId={thread.id} comments={thread.comments} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ThreadList;
