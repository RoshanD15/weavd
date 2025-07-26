import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, getDoc, deleteDoc } from "firebase/firestore";

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [postUser, setPostUser] = useState(null); // <-- to store post author data
  const [loading, setLoading] = useState(true);
  const currentUserId = auth.currentUser?.uid;

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchPostAndUser = async () => {
      setLoading(true);
      try {
        // Fetch the post
        const docRef = doc(db, "posts", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const postData = { id: docSnap.id, ...docSnap.data() };
          setPost(postData);

          // Fetch the post author user document
          if (postData.userId) {
            const userRef = doc(db, "users", postData.userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              setPostUser(userSnap.data());
            } else {
              setPostUser(null);
            }
          }
        } else {
          setPost(null);
        }
      } catch (err) {
        console.error("Error fetching document:", err);
        setPost(null);
        setPostUser(null);
      }
      setLoading(false);
    };

    fetchPostAndUser();
  }, [id]);

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this post?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "posts", id));
      alert("Post deleted successfully.");
      navigate("/Closet");
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete the post.");
    }
  };

  if (loading) return <div>Loading post...</div>;

  if (!post)
    return (
      <div>
        <div className="text-red-500">Post not found.</div>
        <button onClick={() => navigate(-1)} className="mt-4 underline">
          Back
        </button>
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto p-6">
      <button onClick={() => navigate(-1)} className="mb-4 underline">
        ← Back
      </button>

      {/* Show post author info */}
      {postUser && (
        <div
          className="flex items-center gap-4 mb-6 cursor-pointer"
          onClick={() => navigate(`/Closet/${post.userId}`)} // Navigate to user's Closet/profile page
        >
          <img
            src={postUser.photoURL || "/default-profile.png"} // fallback image
            alt={postUser.displayName || "User"}
            className="w-12 h-12 rounded-full object-cover border border-gray-300"
          />
          <span className="font-semibold text-lg text-primary">
            {postUser.displayName || "Unknown User"}
          </span>
        </div>
      )}

      <h2 className="text-3xl font-bold mb-2">{post.itemName}</h2>
      <div className="text-gray-600 mb-4">{post.description}</div>

      <div className="flex flex-wrap gap-3 mb-6">
        {(post.colorTags || []).map((c, i) => (
          <span
            key={i}
            className="inline-block w-6 h-6 rounded-full"
            style={{ background: c }}
            title={c}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        {(post.images || []).map((img, i) => (
          <img
            key={i}
            src={img.url}
            alt={post.itemName}
            className="rounded shadow max-h-60"
            style={{ maxWidth: "100%" }}
          />
        ))}
      </div>

      {(post.itemTags || []).length > 0 && (
        <div className="mb-4">
          <span className="font-semibold">Tags: </span>
          {post.itemTags.join(", ")}
        </div>
      )}

      {/* Show delete button only if current user is the post author */}
      {post.userId === currentUserId && (
        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Delete Post
        </button>
      )}
    </div>
  );
}