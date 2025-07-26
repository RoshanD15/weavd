import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import GarmentCard from "../components/GarmentCard";
import FloatingAddButton from "../components/FloatingAddButton";
import AddItemsModal from "../components/AddItemsModal";
import Masonry from "react-masonry-css";

// 1. Masonry breakpoints
const breakpointColumnsObj = {
  default: 6,   // 6 columns for extra large screens
  1536: 5,      // 5 columns when width >= 1536px (2xl Tailwind)
  1280: 4,      // 4 columns when width >= 1280px (xl Tailwind)
  1024: 3,      // 3 columns when width >= 1024px (lg Tailwind)
  768: 2,       // 2 columns when width >= 768px (md Tailwind)
  0: 1          // 1 column for mobile/small screens
};

export default function MyCloset() {
  // Firebase user and post fetch
  const [user] = useAuthState(auth);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "posts"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const postList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPosts(postList);
      } catch (err) {
        console.error("Error fetching posts:", err);
      }
      setLoading(false);
    };
    fetchPosts();
  }, [user]);

  // Modal logic (unchanged)
  const [showModal, setShowModal] = useState(false);
  const [allImages, setAllImages] = useState([]);
  const [groups, setGroups] = useState([]);
  const [currentGroupIdx, setCurrentGroupIdx] = useState(0);
  const imagesForModal =
    groups.length > 0 && allImages.length > 0
      ? groups[currentGroupIdx].map(idx => allImages[idx])
      : [];

  const handleOpenModal = () => setShowModal(true);

  const handleAdd = (itemData) => {
    setShowModal(false);
    setCurrentGroupIdx(0);
    // Optionally, refresh Closet items here
  };

  return (
    <>
      <h1 className="text-3xl font-bold mb-2">My Closet</h1>
      <div className="text-sm mb-4 text-gray-500">Recently Viewed</div>
      {/* 2. Use Masonry here */}
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {loading ? (
          <div>Loading...</div>
        ) : !posts.length ? (
          <div>No items in your Closet.</div>
        ) : (
          posts.map(post => (
            <GarmentCard
              key={post.id}
              id={post.id}
              name={post.itemName || "Name"}
              Description={post.description || "Description"}
              image={
                post.images && post.images.length > 0 && post.images[0].url
                  ? post.images[0].url
                  : undefined
              }
              colorTags={post.colorTags || []}
              itemTags={post.itemTags || []}
            />
          ))
        )}
      </Masonry>
      <FloatingAddButton onClick={handleOpenModal} />
      <AddItemsModal
        show={showModal}
        images={imagesForModal}
        onClose={() => setShowModal(false)}
        onAdd={handleAdd}
      />

      {/* 3. Basic Masonry grid CSS (add this globally or in your main css file) */}
      <style>
        {`
        .my-masonry-grid {
          display: flex;
          margin-left: -24px; /* gutter size offset */
          width: auto;
        }
        .my-masonry-grid_column {
          padding-left: 24px; /* gutter size */
          background-clip: padding-box;
        }
        /* Style your cards as normal, they just get stacked in columns now */
        `}
      </style>
    </>
  );
}