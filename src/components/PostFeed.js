import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import GarmentCard from "./GarmentCard"; // adjust path if needed

export default function PostsFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
console.log("PostsFeed mounted");
console.log("Fetched posts from Firestore:", postList);
  useEffect(() => {
    // Fetch posts from Firestore
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
        console.log("Fetched posts:", postList);
        // Debug log to see what you get from Firestore:
        console.log("Fetched posts:", postList);
      } catch (err) {
        console.error("Error fetching posts:", err);
      }
      setLoading(false);
    };

    fetchPosts();
  }, []);

    if (loading) return <div>Loading...</div>;
  if (!posts.length) return <div>No posts found.</div>;
  
  // LOG HERE, just before return:
  console.log("Rendering posts in PostsFeed:", posts);
    console.log("Firestore doc.id:", doc.id); 
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {posts.map(post => {
        console.log("Passing props to GarmentCard:", {
  id: post.id,
  name: post.itemName,
  house: post.description,
  image: post.images?.[0]?.url,
  colorTags: post.colorTags
});
        return (
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
            colorTags={post.colorTags}
            itemTags={post.itemTags}
          />
        );
      })}
    </div>
  );
}