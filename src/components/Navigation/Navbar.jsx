import { Link } from "react-router-dom";
import { useState } from "react";
import "./Navbar.css";

const Navbar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm);
      setSearchTerm("");
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          ELECTRIC SHEEP
        </Link>
        <div className="nav-menu">
          <form onSubmit={handleSubmit} className="search-form">
            <input
              type="text"
              placeholder="Search the galaxy..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="search-button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
          </form>
          <Link to="/upload" className="nav-link">
            Upload Video
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
