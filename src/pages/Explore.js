import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import GarmentCard from "../components/GarmentCard";
import Masonry from "react-masonry-css";
import PostSearchFilter from "../components/PostSearchFilter";
import { filterPosts } from "../utils/filterPosts";

const COLOR_OPTIONS = [
  "#f87171", // red
  "#fbbf24", // yellow
  "#34d399", // green
  "#60a5fa", // blue
  "#a78bfa", // purple
  "#f472b6", // pink
  "#d1d5db"  // gray
];

export default function Explore() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for search/filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const postList = querySnapshot.docs.map(doc => ({
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
  }, []);

  // Use the filtering utility
  const filteredPosts = filterPosts(posts, searchQuery, selectedColor);

  if (loading) return <div>Loading...</div>;
  if (!posts.length) return <div>No posts found.</div>;

  const breakpointColumnsObj = {
    default: 6,
    1536: 5,
    1280: 4,
    1024: 3,
    768: 2,
    0: 1
  };

  return (
    <>
      <h1 className="text-3xl font-bold mb-2">Explore Fashion</h1>
      <div className="text-sm mb-4 text-gray-500">Popular Now</div>
      <PostSearchFilter
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
        colorOptions={COLOR_OPTIONS}
      />
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {filteredPosts.length === 0
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
            />
          ))
        }
      </Masonry>
    </>
  );
}