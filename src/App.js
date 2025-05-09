import React, { useState } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navigation/Navbar";
import VideoDetails from "./components/VideoPlayer/VideoDetails";
import VideoUpload from "./components/VideoUpload/VideoUpload";
import Earth from "./components/Earth";
import Galaxy from "./components/Galaxy";
import CanvasWrapper from "./components/CanvasWrapper";

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  return (
    <Router>
      <div className="app-container">
        <Navbar onSearch={setSearchTerm} />
        <div className="main-content">
          <Routes>
            <Route
              path="/earth"
              element={
                <CanvasWrapper camera={{ position: [0, 0, 8], fov: 90 }}>
                  <Earth />
                </CanvasWrapper>
              }
            />
            <Route
              path="/"
              element={
                <CanvasWrapper camera={{ position: [30, 20, 30], fov: 60 }}>
                  <Galaxy searchTerm={searchTerm} />
                </CanvasWrapper>
              }
            />
            <Route path="/video/:id" element={<VideoDetails />} />
            <Route path="/upload" element={<VideoUpload />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
