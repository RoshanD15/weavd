import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs, query, orderBy, where, startAfter, limit } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import GarmentCard from "../components/GarmentCard";
import FloatingAddButton from "../components/FloatingAddButton";
import GroupImagesModal from "../components/GroupImagesModal";
import AddItemsModal from "../components/AddItemsModal";
import Masonry from "react-masonry-css";
import PostSearchFilter from "../components/PostSearchFilter"; 
import { filterPosts } from "../utils/filterPosts"; 
import Skeleton from "../components/Skeleton"; 

const COLOR_OPTIONS = [
  "#f87171", "#fbbf24", "#34d399", "#60a5fa", "#a78bfa", "#f472b6", "#d1d5db"
];

const breakpointColumnsObj = {
  default: 6,
  1536: 5,
  1280: 4,
  1024: 3,
  768: 2,
  0: 1
};

const PAGE_SIZE = 20;

export default function MyCloset() {
  const [user] = useAuthState(auth);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  // Search/filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  // Modal logic states
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [allImages, setAllImages] = useState([]);
  const [groups, setGroups] = useState([]);
  const [currentGroupIdx, setCurrentGroupIdx] = useState(0);

  
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const fetchPosts = async () => {
      try {
        let q;
        if (selectedColor) {
          q = query(
            collection(db, "posts"),
            where("userId", "==", user.uid),
            where("colorTags", "array-contains", selectedColor),
            orderBy("createdAt", "desc"),
            limit(PAGE_SIZE)
          );
        } else {
          q = query(
            collection(db, "posts"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc"),
            limit(PAGE_SIZE)
          );
        }
        const snapshot = await getDocs(q);
        setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
        setHasMore(snapshot.docs.length === PAGE_SIZE);
      } catch (err) {
        setError("Error fetching posts.");
        setPosts([]);
      }
      setLoading(false);
    };
    fetchPosts();
  }, [user, selectedColor]);

  // Client-side search
  const filteredPosts = filterPosts(posts, searchQuery, ""); 
  // Load more posts
  const handleLoadMore = async () => {
    if (!user || !lastDoc) return;
    setLoadingMore(true);
    setError(null);
    try {
      let q;
      if (selectedColor) {
        q = query(
          collection(db, "posts"),
          where("userId", "==", user.uid),
          where("colorTags", "array-contains", selectedColor),
          orderBy("createdAt", "desc"),
          startAfter(lastDoc),
          limit(PAGE_SIZE)
        );
      } else {
        q = query(
          collection(db, "posts"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"),
          startAfter(lastDoc),
          limit(PAGE_SIZE)
        );
      }
      const snapshot = await getDocs(q);
      setPosts(prev => [...prev, ...snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
    } catch (err) {
      setError("Error loading more posts.");
    }
    setLoadingMore(false);
  };

  // Modal logic
  const handleOpenGroupModal = () => setShowGroupModal(true);
  const handleGroupsReady = ({ images, groups }) => {
    setAllImages(images);
    setGroups(groups);
    setCurrentGroupIdx(0);
    setShowAddModal(true);
    setShowGroupModal(false);
  };
  const handleAddItem = (itemData) => {
    if (currentGroupIdx < groups.length - 1) {
      setCurrentGroupIdx(currentGroupIdx + 1);
      setShowAddModal(true);
    } else {
      setShowAddModal(false);
      setCurrentGroupIdx(0);
      setGroups([]);
      setAllImages([]);
    }
  };
  const imagesForModal =
    groups.length > 0 && allImages.length > 0
      ? groups[currentGroupIdx].map(idx => allImages[idx])
      : [];

  return (
    <>
      <h1 className="text-3xl font-bold mb-2">My Closet</h1>
      <div className="text-sm mb-4 text-gray-500">Recently Viewed</div>
      {/* Filter/search UI */}
      <PostSearchFilter
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
        colorOptions={COLOR_OPTIONS}
      />

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
          {error}
          <button onClick={() => window.location.reload()} className="ml-4 underline">Retry</button>
        </div>
      )}

      {/* Masonry grid */}
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {loading
          ? Array.from({ length: PAGE_SIZE }).map((_, i) => <Skeleton key={i} />)
          : !posts.length
          ? <div className="text-gray-400 col-span-full py-8 text-center">No items in your Closet.</div>
          : filteredPosts.length === 0
            ? <div className="text-gray-400 col-span-full py-8 text-center">No items match your search.</div>
            : filteredPosts.map(post => (
                <GarmentCard
                  key={post.id}
                  id={post.id}
                  name={post.itemName || "Name"}
                  Description={post.description || "Description"}
                  image={post.images && post.images[0]?.url}
                  colorTags={post.colorTags || []}
                  itemTags={post.itemTags || []}
                  imgProps={{ loading: "lazy" }}
                />
              ))
        }
      </Masonry>

      {/* Pagination */}
      {!loading && hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-6 py-2 bg-gray-800 text-white rounded-lg shadow hover:bg-gray-900 disabled:opacity-60"
          >
            {loadingMore ? "Loading..." : "Load More"}
          </button>
        </div>
      )}

      {/* Grouping modal */}
      <GroupImagesModal
        show={showGroupModal}
        onClose={() => setShowGroupModal(false)}
        onGroupsReady={handleGroupsReady}
      />

      {/* Add item modal */}
      <AddItemsModal
        show={showAddModal}
        images={imagesForModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddItem}
      />

      {/* Masonry CSS */}
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