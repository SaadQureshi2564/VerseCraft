import './explore.css';
import 'react-quill/dist/quill.snow.css';
import 'react-toastify/dist/ReactToastify.css';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import { Modal, Box, TextField, List, ListItem, ListItemText } from '@mui/material';
import favoriteImage1 from "../Images/image01.webp";
import favoriteImage2 from "../Images/image02.webp";
import Header from '../Header/header';
import awardIcon from '../Images/award-icon.png';
import coverpic from '../Images/cover01.jpg'


function Explore() {
    const [open, setOpen] = useState(false);
    const [newReleases, setNewReleases] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [openSearchResults, setOpenSearchResults] = useState(false);
    const [tooltipLeft, setTooltipLeft] = useState(0);
    const [tooltipTop, setTooltipTop] = useState(0);
    const navigate = useNavigate();

    const handleAdvanceOpen = () => setOpen(true);
    const handleAdvanceClose = () => setOpen(false);

    // Search handler
    const handleSearch = (event) => {
        const term = event.target.value;
        setSearchTerm(term);
        const filteredBooks = newReleases.filter((book) =>
            book.title.toLowerCase().includes(term.toLowerCase())
        );
        setSearchResults(filteredBooks);
        setOpenSearchResults(term !== '');
    };

    // Fetch all published books from backend
    useEffect(() => {
        const fetchNewReleases = async () => {
            try {
              const { data } = await axios.get('/api/publishing/returnall'); // Correct route here
              if (data.success) {
                setNewReleases(data.data);
              }
            } catch (err) {
              console.error('Failed to fetch new releases:', err);
            }
          };
          

        fetchNewReleases();
    }, []);

    const handleItemClick = (projectId) => {
      navigate(`/reading/${projectId}`);
    };

   

    const handleMouseOver = (e, title) => {
        const rect = e.target.getBoundingClientRect();
        setTooltipLeft(e.clientX - rect.left);
        setTooltipTop(e.clientY - rect.top);
    };

    const handleMouseMove = (e) => {
        setTooltipLeft(e.clientX);
        setTooltipTop(e.clientY);
    };

    const handleMouseOut = () => {
        setTooltipLeft(0);
        setTooltipTop(0);
    };

    return (
        <div className="explore-main-container">
            <Header />

            <div className="explore-body">
                <div className="explore-left-sidepanel">
                <div className="explore-awards">
                    <div className="award-icon" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <img src={awardIcon} alt="Award Icon" className="explore-award-icon" />
                        <h2>Awards</h2>
                    </div>
                        <ul>
                            <li>
                                <div className="award-item">
                                    <div className="award-item-image">
                                        <img src={coverpic} alt="Award-1" />
                                    </div>
                                    <div className="award-info">
                                        <h3>Most Liked</h3>
                                        <h4 >Book Title 1</h4>
                                        <h5 >by Author 1</h5>
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div className="award-item">
                                <div className="award-item-image">
                                        <img src={coverpic} alt="Award-1" />
                                    </div>
                                    <div className="award-info">
                                        <h3 style={{backgroundColor:" rgb(123, 200, 79)"}}>Most Favorited</h3>
                                        <h4 >Book Title 2</h4>
                                        <h5 >by Author 2</h5>
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div className="award-item">
                                <div className="award-item-image">
                                        <img src={favoriteImage2} alt="Award-1" />
                                    </div>
                                    <div className="award-info">
                                        <h3 style={{backgroundColor:"rgb(228, 224, 97)"}}>Highest Rated</h3>
                                        <h4 >Book Title 3</h4>
                                        <h5 >by Author 3</h5>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div className="explore-best-sellers">
                        <h2>Best Sellers</h2>
                        <ul>
                            <li>
                                <div className="best-seller-item">
                                    <div className="best-seller-item-image">
                                        <img src={favoriteImage1} alt="Award-3" />
                                    </div>
                                    <div className="best-seller-info">
                                        <h3>Book Title 1</h3>
                                        <h4>by Author 1</h4>
                                        <h5>Rating: 4.5/5</h5>
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div className="best-seller-item">
                                    <div className="best-seller-item-image">
                                        <img src={favoriteImage1} alt="Award-3" />
                                    </div>
                                    <div className="best-seller-info">
                                        <h3>Book Title 2</h3>
                                        <h4>by Author 2</h4>
                                        <h5>Rating: 4.2/5</h5>
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div className="best-seller-item">
                                    <div className="best-seller-item-image">
                                        <img src={favoriteImage1} alt="Award-3" />
                                    </div>
                                    <div className="best-seller-info">
                                        <h3>Book Title 3</h3>
                                        <h4>by Author 3</h4>
                                        <h5>Rating: 4.8/5</h5>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="explore-main-content-container">
                    <div className="explore-searchbar-container">
                        <p>Browse Books</p>
                        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Box
                            sx={{
                                mt: 2,
                                width: '520px',
                                position: 'relative',
                                zIndex: 1000,
                                backgroundColor: 'white',
                                borderColor: "black",
                                borderRadius: 1,
                                marginLeft:10,
                                marginRight:5,
                                
                            }}
                        >
                            <TextField
                                className="explore-searchbar-textfield"
                                fullWidth
                                label="Search"
                                value={searchTerm}
                                onChange={handleSearch}
                                sx={{
                                    backgroundColor: '#fff',
                                    borderColor: '#ddd',
                                    borderRadius: 5,
                                    fontSize: 10,
                                    fontWeight: 500,
                                    padding: 0
                                }}
                            />
                            {openSearchResults && (
                                <List sx={{
                                    position: 'absolute',
                                    top: 60,
                                    left: -20,
                                    width: '100%',
                                    backgroundColor: '#fff',
                                    border: '1px solid #ddd',
                                    zIndex: 1001,
                                    maxHeight: 300,
                                    overflowY: 'auto',
                                    padding: 2,
                                    borderRadius: 5,
                                    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)'
                                }}>
                                    {searchResults.map((book, index) => (
                                        <ListItem key={index} sx={{
                                            padding: 1,
                                            borderBottom: '1px solid #ddd',
                                            '&:hover': { backgroundColor: '#f5f5f5' }
                                        }}>
                                            <ListItemText primary={book.title} sx={{
                                                fontSize: 14,
                                                fontWeight: 500
                                            }} />
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                            
                        </Box>
                        <div className="explore-advanced-search">
                            <div className="explore-advanced-search-btn" onClick={handleAdvanceOpen}>Advanced Search</div>
                        </div>
                    </div>
                        
                    </div>

                    <Modal
                        open={open}
                        onClose={handleAdvanceClose}
                        aria-labelledby="advanced-search-modal-title"
                        aria-describedby="advanced-search-modal-description"
                    >
                        <div className="advanced-search-modal-container">
                            <h2 id="advanced-search-modal-title">Advanced Search</h2>
                            <form>
                                <div className="advanced-search-form-field">
                                    <label>Title:</label>
                                    <input type="text" />
                                </div>
                                <div className="advanced-search-form-field">
                                    <label>Author:</label>
                                    <input type="text" />
                                </div>
                                <div className="advanced-search-form-field">
                                    <label>Genre:</label>
                                    <select>
                                    <option value="">Select a genre</option>
                                    <option value="action">Action</option>
                                    <option value="adventure">Adventure</option>
                                    <option value="comedy">Comedy</option>
                                    <option value="crime">Crime</option>
                                    <option value="drama">Drama</option>
                                    <option value="fantasy">Fantasy</option>
                                    <option value="fiction">Fiction</option>
                                    <option value="historical-fiction">Historical Fiction</option>
                                    <option value="horror">Horror</option>
                                    <option value="mystery">Mystery</option>
                                    <option value="non-fiction">Non-Fiction</option>
                                    <option value="romance">Romance</option>
                                    <option value="science-fiction">Science Fiction</option>
                                    <option value="thriller">Thriller</option>
                                    <option value="young-adult">Young Adult</option>
                                </select>
                                </div>
                                <button type="submit">Search</button>
                            </form>
                        </div>
                    </Modal>

                    <div className="explore-navigation-container">
                        <div className="explore-new-releases">
                            <p>New Releases</p>
                            <div className="explore-new-releases-list">
                                {newReleases.map((book, index) => (
                                    <div
                                        key={index}
                                        className="explore-new-releases-book"
                                        onMouseOver={(e) => handleMouseOver(e, book.title)}
                                        onMouseMove={(e) => handleMouseMove(e)}
                                        onMouseOut={handleMouseOut}
                                        onClick={() => handleItemClick(book.projectId)}
                                    >{}
                                        <img src={`http://localhost:5001/uploads/${book.coverPicture}`      || 'uploads/1737972365000-874815971.jpg'} alt={book.title} className="explore-new-releases-book-cover" 
                                        />
                                        <div className="explore-new-releases-book-title">{book.title}</div>
                                        <span className="book-title-tooltip" style={{ left: tooltipLeft, top: tooltipTop }}>
                                            {book.title}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="explore-featured-books">
                            <p>Featured Items</p>
                            <div className="explore-featured-books-list">
                                {newReleases.slice(0, 3).map((book, index) => (
                                    <div
                                        key={index}
                                        className="explore-featured-books-book"
                                        onMouseOver={(e) => handleMouseOver(e, book.title)}
                                        onMouseMove={(e) => handleMouseMove(e)}
                                        onMouseOut={handleMouseOut}
                                        onClick={() => handleItemClick(book.projectId)}
                                    >
                                        <img src={`http://localhost:5001/uploads/${book.coverPicture}` || 'uploads/1737972365000-874815971.jpg'} alt={book.title} className="explore-featured-books-book-cover" />
                                        <div className="explore-featured-books-book-title">{book.title}</div>
                                        <span className="book-feature-title-tooltip" style={{ left: tooltipLeft, top: tooltipTop }}>
                                            {book.title}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>

                <div className="explore-right-sidepanel">
                    <div className="book-copyright">
                        <p>&copy; 2023-2024 Book Authors and Publishers. All rights reserved.</p>
                    </div>
                    <div className="book-copyright-content">
                        <ul>
                            <li>Unauthorized reproduction or distribution is strictly prohibited.</li>
                            <li>All characters and events in this book are fictional unless stated otherwise.</li>
                            <li>No part of this work may be copied, stored, or shared without permission.</li>
                            <li>Quoting from this work must include proper attribution to the author.</li>
                            <li>Adaptations, translations, or modifications require explicit author approval.</li>
                            <li>Purchasing this book grants only personal reading rights; resale or redistribution is prohibited.</li>
                            <li>Legal action may be taken against copyright violations or unauthorized commercial use.</li>
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Explore;
