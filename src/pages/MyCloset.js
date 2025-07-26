import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import GarmentCard from "../components/GarmentCard";
import FloatingAddButton from "../components/FloatingAddButton";
import GroupImagesModal from "../components/GroupImagesModal"; // NEW!
import AddItemsModal from "../components/AddItemsModal";         // NEW!
import Masonry from "react-masonry-css";

const breakpointColumnsObj = {
  default: 6,
  1536: 5,
  1280: 4,
  1024: 3,
  768: 2,
  0: 1
};

export default function MyCloset() {
  const [user] = useAuthState(auth);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- NEW MODAL FLOW STATES ---
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [allImages, setAllImages] = useState([]); // [File | {url, path}]
  const [groups, setGroups] = useState([]);       // Array of array of indices
  const [currentGroupIdx, setCurrentGroupIdx] = useState(0);

  // --- Fetch posts as before ---
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
        setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Error fetching posts:", err);
      }
      setLoading(false);
    };
    fetchPosts();
  }, [user]);

  // --- Modal logic for grouping/add flow ---
  const handleOpenGroupModal = () => setShowGroupModal(true);

  // When grouping is finished
  const handleGroupsReady = ({ images, groups }) => {
    setAllImages(images);
    setGroups(groups);
    setCurrentGroupIdx(0);
    setShowAddModal(true);
    setShowGroupModal(false);
  };

  // When add-item is finished for a group
  const handleAddItem = (itemData) => {
    if (currentGroupIdx < groups.length - 1) {
      setCurrentGroupIdx(currentGroupIdx + 1); // Move to next group
      setShowAddModal(true);
    } else {
      // All groups handled
      setShowAddModal(false);
      setCurrentGroupIdx(0);
      setGroups([]);
      setAllImages([]);
    }
  };

  // Current group's images for the add-item modal
  const imagesForModal =
    groups.length > 0 && allImages.length > 0
      ? groups[currentGroupIdx].map(idx => allImages[idx])
      : [];

  return (
    <>
      <h1 className="text-3xl font-bold mb-2">My Closet</h1>
      <div className="text-sm mb-4 text-gray-500">Recently Viewed</div>
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
              image={post.images && post.images[0]?.url}
              colorTags={post.colorTags || []}
              itemTags={post.itemTags || []}
            />
          ))
        )}
      </Masonry>
      <FloatingAddButton onClick={handleOpenGroupModal} />

      {/* Grouping modal */}
      <GroupImagesModal
        show={showGroupModal}
        onClose={() => setShowGroupModal(false)}
        onGroupsReady={handleGroupsReady}
      />

      {/* Add item modal (for each group) */}
      <AddItemsModal
        show={showAddModal}
        images={imagesForModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddItem}
      />

      <style>{`
        .my-masonry-grid {
          display: flex;
          margin-left: -24px;
          width: auto;
        }
        .my-masonry-grid_column {
          padding-left: 24px;
          background-clip: padding-box;
        }
      `}</style>
    </>
  );
}