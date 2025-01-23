import { useState } from "react";
import { auth, db } from "../../firebase/config";
import { doc, updateDoc } from "firebase/firestore";
import OptionsMenu from "../shared/OptionsMenu";

const Comment = ({ threadId, comments }) => {
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);

  const handleAddComment = async (e) => {
    e.preventDefault();

    const commentData = {
      content: newComment,
      authorId: auth.currentUser.uid,
      authorName: auth.currentUser.displayName || "Anonymous",
      createdAt: new Date().toISOString(),
    };

    const threadRef = doc(db, "threads", threadId);
    await updateDoc(threadRef, {
      comments: [...(comments || []), commentData],
    });

    setNewComment("");
  };

  const handleEditComment = async (commentIndex, newContent) => {
    const threadRef = doc(db, "threads", threadId);
    const updatedComments = [...comments];
    updatedComments[commentIndex] = {
      ...updatedComments[commentIndex],
      content: newContent,
      edited: true,
    };
    await updateDoc(threadRef, { comments: updatedComments });
  };

  const handleDeleteComment = async (commentIndex) => {
    const threadRef = doc(db, "threads", threadId);
    const updatedComments = comments.filter(
      (_, index) => index !== commentIndex
    );
    await updateDoc(threadRef, { comments: updatedComments });
  };

  return (
    <div className="mt-4">
      <button
        onClick={() => setShowComments(!showComments)}
        className="text-gray-500 hover:text-blue-600 transition duration-200"
      >
        💬 {comments?.length || 0} Comments
      </button>

      {showComments && (
        <div className="mt-4 space-y-4">
          {comments?.map((comment, index) => (
            <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {comment.authorName[0].toUpperCase()}
                  </div>
                  <div>
                    <span className="font-medium">{comment.authorName}</span>

                    <p className="text-sm text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <OptionsMenu
                  isAuthor={comment.authorId === auth.currentUser?.uid}
                  onEdit={() => {
                    const newContent = prompt(
                      "Edit your comment:",
                      comment.content
                    );
                    if (newContent) handleEditComment(index, newContent);
                  }}
                  onDelete={() => {
                    if (window.confirm("Delete this comment?")) {
                      handleDeleteComment(index);
                    }
                  }}
                />
              </div>
              <p className="mt-2 text-gray-700">{comment.content}</p>
            </div>
          ))}

          <form onSubmit={handleAddComment} className="mt-4">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <button
              type="submit"
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Post Comment
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Comment;
