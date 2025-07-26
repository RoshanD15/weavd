import React, { useState } from "react";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords must match.");
      setLoading(false);
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setMessage("Account created! Redirecting to your profile...");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      // Redirect to profile after signup
      navigate("/profile");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSignUp}
        className="bg-white shadow p-8 rounded-lg w-full max-w-md space-y-4"
      >
        <h2 className="text-3xl font-bold mb-4 text-center">
          Start your journey today!
        </h2>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="w-full border rounded p-2"
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password (min 6 chars)"
          required
          className="w-full border rounded p-2"
          minLength={6}
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          placeholder="Re-type Password"
          required
          className="w-full border rounded p-2"
          minLength={6}
        />
        <button
          type="submit"
          disabled={
            loading ||
            !email ||
            !password ||
            !confirmPassword ||
            password !== confirmPassword
          }
          className="w-full bg-primary text-gray py-2 px-4 rounded"
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
        {error && <div className="text-red-600">{error}</div>}
        {message && <div className="text-green-600">{message}</div>}
      </form>
    </div>
  );
}