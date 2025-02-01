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
            <button type="submit">Search</button>
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
