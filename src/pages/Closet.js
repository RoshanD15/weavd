import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import GarmentCard from "../components/GarmentCard";
import Masonry from "react-masonry-css";

export default function Closet() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [userPfp, setUserPfp] = useState("");   // ← NEW

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // Fetch user's display name and profile picture
    const fetchUserName = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserName(data.displayName || "User");
          setUserPfp(data.photoURL || data.pfp || ""); // change to your actual pfp field
        } else {
          setUserName("User");
          setUserPfp("");
        }
      } catch (err) {
        setUserName("User");
        setUserPfp("");
      }
    };

    fetchUserName();
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchUserPosts = async () => {
      setLoading(true);
      try {
        const postsRef = collection(db, "posts");
        const q = query(postsRef, where("userId", "==", userId));
        const querySnapshot = await getDocs(q);

        const userPosts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setPosts(userPosts);
      } catch (err) {
        console.error("Error fetching user's posts:", err);
      }
      setLoading(false);
    };

    fetchUserPosts();
  }, [userId]);

  if (loading) return <div>Loading Closet...</div>;
  if (!posts.length) return <div>No items found in this Closet.</div>;

  const breakpointColumnsObj = {
    default: 6,
    1536: 5,
    1280: 4,
    1024: 3,
    768: 2,
    0: 1
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 underline text-black hover:text-blue-800"
      >
        ← Back
      </button>
      <div className="flex items-center gap-4 mb-6">
        {userPfp && (
          <img
            src={userPfp}
            alt={`${userName}'s profile`}
            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 shadow-sm"
          />
        )}
        <h1 className="text-2xl font-bold">{userName}&apos;s Closet</h1>
      </div>
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {posts.map(post => (
          <GarmentCard
            key={post.id}
            id={post.id}
            name={post.itemName || "Unnamed Item"}
            Description={post.description || ""}
            image={
              post.images && post.images.length > 0 && post.images[0].url
                ? post.images[0].url
                : undefined
            }
            colorTags={post.colorTags || []}
            itemTags={post.itemTags || []}
          />
        ))}
      </Masonry>
    </div>
  );
}