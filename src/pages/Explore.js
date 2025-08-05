import React, { useEffect, useState, useRef } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, orderBy, where, startAfter, limit } from "firebase/firestore";
import GarmentCard from "../components/GarmentCard";
import Masonry from "react-masonry-css";
import PostSearchFilter from "../components/PostSearchFilter";
import { filterPosts } from "../utils/filterPosts"; // still needed for client-side search
import Skeleton from "../components/Skeleton"; // You'll make a simple skeleton card component

const COLOR_OPTIONS = [
  "#f87171", // red
  "#fbbf24", // yellow
  "#34d399", // green
  "#60a5fa", // blue
  "#a78bfa", // purple
  "#f472b6", // pink
  "#d1d5db"  // gray
];

const PAGE_SIZE = 20; // Number of posts per page

export default function Explore() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  // Pagination
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  // Search/filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  // Fetch initial posts (and refetch when color filter changes)
  useEffect(() => {
    let ignore = false;
    const fetchInitialPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        let q = query(
          collection(db, "posts"),
          orderBy("createdAt", "desc"),
          limit(PAGE_SIZE)
        );
        if (selectedColor) {
          q = query(
            collection(db, "posts"),
            where("colorTags", "array-contains", selectedColor),
            orderBy("createdAt", "desc"),
            limit(PAGE_SIZE)
          );
        }
        const snapshot = await getDocs(q);
        if (ignore) return;

        const postList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setPosts(postList);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
        setHasMore(snapshot.docs.length === PAGE_SIZE);
      } catch (err) {
        setError("Failed to load posts. Please try again.");
        setPosts([]);
        setHasMore(false);
      }
      setLoading(false);
    };

    fetchInitialPosts();
    return () => { ignore = true; };
  }, [selectedColor]);

  // Load more handler
  const handleLoadMore = async () => {
    if (!hasMore || !lastDoc) return;
    setLoadingMore(true);
    setError(null);
    try {
      let q = query(
        collection(db, "posts"),
        orderBy("createdAt", "desc"),
        startAfter(lastDoc),
        limit(PAGE_SIZE)
      );
      if (selectedColor) {
        q = query(
          collection(db, "posts"),
          where("colorTags", "array-contains", selectedColor),
          orderBy("createdAt", "desc"),
          startAfter(lastDoc),
          limit(PAGE_SIZE)
        );
      }
      const snapshot = await getDocs(q);
      const morePosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setPosts(prev => [...prev, ...morePosts]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
    } catch (err) {
      setError("Failed to load more posts.");
      setHasMore(false);
    }
    setLoadingMore(false);
  };

  // Filter on search client-side for now (Firestore doesn't support full text search)
  const filteredPosts = filterPosts(posts, searchQuery, ""); // Don't pass color, it's handled server-side now

  const breakpointColumnsObj = {
    default: 6,
    1536: 5,
    1280: 4,
    1024: 3,
    768: 2,
    0: 1
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Explore Fashion</h1>
      <div className="text-sm mb-4 text-gray-500">Popular Now</div>
      <PostSearchFilter
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
        colorOptions={COLOR_OPTIONS}
      />
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-4 rounded">
          {error}
          <button className="ml-4 underline" onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {/* Loading skeletons */}
        {loading
          ? Array.from({ length: PAGE_SIZE }).map((_, i) => <Skeleton key={i} />)
          : filteredPosts.length === 0
            ? <div className="text-gray-400 col-span-full py-8 text-center">No posts match your search.</div>
            : filteredPosts.map(post => (
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
                  imgProps={{ loading: "lazy" }} // Pass as prop to <img>
                />
              ))}
      </Masonry>
      {/* Pagination Load More */}
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
    </div>
  );
}