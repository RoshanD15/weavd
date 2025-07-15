import React from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-4xl font-bold text-primary mb-4">
        Welcome to MyScents!
      </h1>
      <p className="text-lg text-gray-700 mb-8">
        Track, discover, and manage your fragrance collection.
      </p>
      <div className="flex flex-col gap-4 mb-4 max-w-xs">
        <button
          className="px-6 py-3 w-32 bg-primary text-black rounded-lg font-medium shadow hover:bg-blue-300 transition"
          onClick={() => navigate("/login")}
        >
          Login
        </button>
        <button
          className="px-6 py-3 w-32 bg-accent text-black rounded-lg font-medium shadow hover:bg-green-400 transition"
          onClick={() => navigate("/SignUp")}
        >
          Join
        </button>
      </div>
      {/* The Skip link */}
      <Link
        to="/Explore"
        className="underline text-sm text-primary hover:text-accent transition cursor-pointer"
      >
        Skip
      </Link>
    </div>
  );
}