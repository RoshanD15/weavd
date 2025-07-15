
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import './index.css';
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Collection from "./pages/Collection";
import Explore from "./pages/Explore";

function App() {
  return (
    <Router>
      <Routes>
        {/* Home page route */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} /> 
        <Route path="/SignUp" element={<SignUp />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/Explore" element={<Explore />} />
      </Routes>
    </Router>
  );
}

export default App;
