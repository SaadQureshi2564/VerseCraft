import React, { useState, useEffect } from "react";
import './favorites.css';
import { useNavigate } from 'react-router-dom';
import Header from '../Header/header';
import axios from 'axios';

const Favorites = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortCriteria, setSortCriteria] = useState("title");
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  // Fetch user data and favorites on component mount
  useEffect(() => {
    const fetchUserDataAndFavorites = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Fetch user profile
        const userResponse = await axios.get('http://localhost:5001/api/users/profile', {
          headers: { 'x-auth-token': token },
        });
        setUser(userResponse.data);

        // Fetch favorites
        const favoritesResponse = await axios.get(`/api/favorites/favorites/${userResponse.data.email}`);
        setFavorites(favoritesResponse.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserDataAndFavorites();
  }, [navigate]);

  // Pagination logic
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    const gridContainer = document.querySelector('.favorites-works-grid');
    const scrollPosition = (pageNumber - 1) * gridContainer.offsetWidth;
    gridContainer.scrollTo({ left: scrollPosition, behavior: 'smooth' });
  };

  const renderPagination = () => {
    const pageCount = Math.ceil(filteredFavorites.length / itemsPerPage);
    const paginationButtons = [];
    for (let i = 1; i <= pageCount; i++) {
      paginationButtons.push(
        <button
          key={i}
          className={`pagination-button ${currentPage === i ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }
    return <div className="pagination-container">{paginationButtons}</div>;
  };

  // Search and sort handlers
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleSortChange = (e) => setSortCriteria(e.target.value);

  // Filter and sort favorites
  const filteredFavorites = favorites
    .filter(work =>
      work.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      work.summary.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortCriteria === "title") return a.title.localeCompare(b.title);
      if (sortCriteria === "rating") return b.rating - a.rating;
      return 0;
    });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="favorites-container">
      <Header />
      <div className="favorites-dashboard">
        <h1>Favorites</h1>
        <div className="favorites-controls">
          <input
            type="text"
            placeholder="Search favorites..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="favorites-search-bar"
          />
          <select value={sortCriteria} onChange={handleSortChange} className="favorites-sort-dropdown">
            <option value="title">Sort by Title</option>
            <option value="rating">Sort by Rating</option>
          </select>
        </div>

        <div className="favorites-works-grid">
          {filteredFavorites
            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
            .map((work, index) => (
              <div className="favorite-work-item" key={index}>
                <div
                  className="favorite-work-image"
                  style={{ backgroundImage: `url(http://localhost:5001/uploads/${work.coverPicture || 'default-image.jpg'})` }}

                ></div>
                <div className="favorite-work-details">
                  <h3 className="favorite-work-title">{work.title}</h3>
                  <p className="favorite-work-summary">{work.summary}</p>
                </div>
                <div className="favorite-work-rating">{work.rating} ⭐</div>
                <div className="favorite-genre-container">
                  Genres
                  <div className="favorite-genre-types">
                    {work.genres.map((genre, idx) => (
                      <span key={idx} className="genre-tag">{genre}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
        </div>
        {renderPagination()}
      </div>
      <div className="favorite-suggestions-container">Suggestions</div>
    </div>
  );
};

export default Favorites;