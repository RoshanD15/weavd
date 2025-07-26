import React, { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence, browserSessionPersistence } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Set session persistence based on "Remember Me"
    const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence;

    try {
      await setPersistence(auth, persistenceType);
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/MyCloset");
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow p-8 flex flex-col w-full max-w-md"
      >
        <h2 className="text-3xl font-bold mb-6 text-center">Login to weavd</h2>
        <label className="mb-2 text-gray-700 font-medium" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          className="mb-4 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
        <label className="mb-2 text-gray-700 font-medium" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          className="mb-4 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
        />
        <label className="flex items-center mb-6">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="mr-2"
          />
          Remember Me
        </label>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-blue-200 text-black rounded-lg font-medium shadow hover:bg-blue-500 transition"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        {error && <div className="text-red-600 mt-4">{error}</div>}
      </form>
    </div>
  );
}