import React, { useState, useEffect ,useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './reading.css';
import { useParams} from 'react-router-dom';
import Switch from '@mui/material/Switch';
import Header from '../Header/header'; 
import { Rating, TextField, Button } from '@mui/material';
import {  List, ListItem, ListItemText, Divider ,Typography} from '@mui/material';
import characterIcon from '../Images/Character.png';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { toast } from 'react-toastify';
import { Box } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import pieChart from '../Images/pie-chart-icon.png';
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import SentimentModal from "./SentimentModal";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

import autoTable from 'jspdf-autotable';
const Reading = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projectType, setProjectType] = useState(null); // State to hold the project type
  const [characters, setCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isSentimentModalOpen, setIsSentimentModalOpen] = useState(false);
  const chapterContainerRef = useRef(null);

  // Rating and comment state variables
  const [ratingValue, setRatingValue] = useState(0); // Rating value state
  const [comments, setComments] = useState([]); // Comments state
  const [newComment, setNewComment] = useState(''); // New comment state
  const [username, setUsername] = useState(''); // Username state
  const [projects, setProjects] = useState([]); // State to hold user projects
  const [averageRating, setAverageRating] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [isAuthor, setIsAuthor] = useState(false); // State to check if user is author of the project

  const [expandedComments, setExpandedComments] = useState({});
  const [overflowingComments, setOverflowingComments] = useState({}); // Tracks if a comment is overflowing
  const commentRefs = useRef([]); // Store refs for each comment


  useEffect(() => {
    // Check if each comment text is overflowing
    const checkOverflow = () => {
      const newOverflowingComments = {};
      commentRefs.current.forEach((ref, index) => {
        if (ref) {
          const isOverflowing = ref.scrollHeight > ref.clientHeight;
          newOverflowingComments[index] = isOverflowing;
        }
      });
      setOverflowingComments(newOverflowingComments);
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow); // Recalculate on window resize
    return () => window.removeEventListener("resize", checkOverflow);
  }, [comments]); // Re-run if comments change

  const toggleExpand = (index) => {
    setExpandedComments((prev) => ({
      ...prev,
      [index]: !prev[index], // Toggle only the selected comment
    }));
  };



  //const [commentType, setCommentType] = useState('neutral');
  // Add these state variables
  const [isFavorited, setIsFavorited] = useState(false);  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        const response = await axios.get('http://localhost:5001/api/users/profile', {
          headers: { 'x-auth-token': token },
        });
        setUser(response.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
    handleDetectProject();
  }, [navigate]);


  
 // Fetch user data and user projects on component mount
 useEffect(() => {
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:5001/api/users/profile', {
        headers: { 'x-auth-token': token },
      });

      setUser(response.data);
      
      
      fetchUserProjects(response.data.email); // Fetch user projects

    } catch (err) {
      console.error(err);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  

  fetchUserData();
}, [navigate]);

const fetchUserProjects = async (email) => {
  try {
    const [storiesResponse, novelsResponse, urduResponse] = await Promise.all([
      axios.get(`http://localhost:5001/api/stories/user/${email}`),
      axios.get(`http://localhost:5001/api/novels/user/${email}`),
      axios.get(`http://localhost:5001/api/urdu/user/${email}`),
    ]);

    const combinedProjects = [
      ...storiesResponse.data.map(project => ({ ...project, projectType: 'Storyboard' })),
      ...novelsResponse.data.map(project => ({ ...project, projectType: 'Novelboard' })),
      ...urduResponse.data.map(project => ({ ...project, projectType: 'Urduboard' })),
    ];

    setProjects(combinedProjects);

    // Check if the current projectId exists in the fetched projects
    const isCurrentProjectAuthor = combinedProjects.some(project => project._id === projectId);
    setIsAuthor(isCurrentProjectAuthor);
    console.log('isAuthor:', isCurrentProjectAuthor);

  } catch (err) {
    console.error('Failed to load projects:', err);
    toast.error('Failed to load projects');
  }
};




useEffect(() => {
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await axios.get('http://localhost:5001/api/users/profile', {
        headers: { 'x-auth-token': token },
      });
      setUser(response.data);
      console.log('User state after fetchUserData:', response.data); // ADD THIS LINE
      fetchUserProjects(response.data.email);
    } catch (err) {
      console.error(err);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };
  fetchUserData();
  handleDetectProject();
}, [navigate]);



useEffect(() => {
  const fetchRatings = async () => {
    if (projectId) {
      try {
        // Get average rating
        const averageResponse = await axios.get('/api/ratings/average', {
          params: { projectId }
        });
        setAverageRating(averageResponse.data.averageRating);
        setTotalRatings(averageResponse.data.totalRatings);

        // Get user's rating if logged in
        if (user?.email) {
          const userRatingResponse = await axios.get('/api/ratings/user', {
            params: { userEmail: user.email, projectId }
          });
          setUserRating(userRatingResponse.data.userRating);
        }
      } catch (error) {
        console.error('Error fetching ratings:', error);
      }
    }
  };

  fetchRatings();
}, [projectId, user]);

// Effect to check favorite status on component mount and updates
useEffect(() => {
  const checkFavoriteStatus = async () => {
    if (user?.email && projectId) {
      try {
        const response = await axios.get('/api/favorites/check', {
          params: {
            userEmail: user.email,  // Using logged-in user's email
            projectId: projectId   // Current project ID from URL
          }
        });
        setIsFavorited(response.data.favorited);
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    }
  };

  checkFavoriteStatus();
}, [user, projectId]); 

  // Fetch Comments for the current project
  useEffect(() => {
    const fetchComments = async () => {
      if (!projectId) return;
      try {
        const response = await axios.get(`/api/comments`, { params: { projectId } });
        setComments(response.data);
      } catch (err) {
        console.error('Error fetching comments:', err);
        toast.error('Failed to load comments');
      }
    };

    fetchComments();
  }, [projectId]);

  // Detect project type
  const handleDetectProject = async () => {
    try {
      setError(null);
      const response = await axios.get(`/api/gettype/detect/${projectId}`);
      setProjectType(response.data.type); // assuming the response has 'type' as the project type
    } catch (err) {
      setError(err.response ? err.response.data.message : 'An unexpected error occurred');
    }
  };

  // Fetch project details based on project type
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        if (projectType === 'Story') {
          const projectResponse = await axios.get(`/api/stories/${projectId}`);
          const chaptersResponse = await axios.get(`/api/stories/${projectId}/chapters`);
          setProject(projectResponse.data);
          setChapters(chaptersResponse.data);

        } else if (projectType === 'Novel') {
          const projectResponse = await axios.get(`/api/novels/${projectId}`);
          const chaptersResponse = await axios.get(`/api/novels/${projectId}/chapters`);
          setProject(projectResponse.data);
          setChapters(chaptersResponse.data);

        } else if (projectType === 'Urdu') {
          const projectResponse = await axios.get(`/api/urdu/${projectId}`);
          const chaptersResponse = await axios.get(`/api/urduchapters/${projectId}`);
          setProject(projectResponse.data);
          setChapters(chaptersResponse.data);
        }

      } catch (error) {
        console.error('Error fetching project data:', error);
        setError('Failed to fetch project data');
      }
    };

    if (projectId && projectType) {
      fetchProjectData();
    }
  }, [projectId, projectType, navigate]);

  // Fetch characters data
  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/characters?projectId=${projectId}`);
        setCharacters(response.data);
      } catch (error) {
        console.error('Error fetching characters:', error);
      }
    };

    if (projectId) {
      fetchCharacters();
    }
  }, [projectId]);

  // Handle chapter click for smooth scrolling
  const handleChapterClick = (chapterId) => {
    const chapterElement = chapterContainerRef.current.querySelector(
      `#chapter-${chapterId}`
    );
    if (chapterElement) {
      chapterContainerRef.current.scrollTo({
        top: chapterElement.offsetTop,
        behavior: 'smooth',
      });
    }
  };

  // Handle scroll position for tracking
  const handleScroll = () => {
    if (chapterContainerRef.current) {
      const scrollTop = chapterContainerRef.current.scrollTop;
      const clientHeight = chapterContainerRef.current.clientHeight;
      const scrollHeight = chapterContainerRef.current.scrollHeight;
      const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
      setScrollPosition(progress);
    }
  };

  // Handle dark mode toggle
  const handleDarkModeToggle = () => {
    const body = document.body;
    body.classList.toggle('dark-mode');
  };

  // Modal functions for character details
  const openModal = (char) => {
    setSelectedCharacter(char);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedCharacter(null);
    setIsModalOpen(false);
  };

  // Handle comment changes
  const handleCommentChange = (event) => {
    setNewComment(event.target.value);
  };


 

  // Ensure user data is loaded before rendering
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }
  
    
 
  const handleFavoriteToggle = async () => {
    if (!user?.email) {
      toast.error('Please login to add favorites');
      return;
    }
  
    try {
      const response = await axios.post('/api/favorites/toggle', {
        userEmail: user.email,
        projectId: projectId,
        projectType: projectType
      });
  
      setIsFavorited(response.data.favorited);
      toast.success(response.data.favorited ? 'Added to favorites!' : 'Removed from favorites');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Error updating favorite');
    }
  };



  const handleRatingChange = async (event, newValue) => {
    if (!user?.email) {
      toast.error('Please login to rate this project');
      return;
    }
  
    try {
      const response = await axios.post('/api/ratings/submit', {
        userEmail: user.email,
        projectId,
        projectType,
        rating: newValue
      });
  
      setUserRating(response.data.userRating);
      setAverageRating(response.data.averageRating);
      toast.success('Rating submitted successfully!');
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Error submitting rating');
    }
  };
  const handleCommentSubmit = async () => {
    if (!user?.email) {
      toast.error('Please login to post comments');
      return;
    }
  
    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }
  
    try {
      const response = await axios.post('/api/comments', {
        userEmail: user.email,
        projectId,
        comment: newComment,
        isAuthor: isAuthor,
        commentType: 'Undecided' 
      });
  
      setComments((prevComments) => [response.data, ...prevComments]);
      setNewComment('');
      toast.success('Comment submitted successfully!');
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error('Error submitting comment');
    }
  };

  
// Helper function to render trait sections
const renderTraitSection = (title, traits) => {
  if (!traits || traits.length === 0) return null;
  
  return (
    <div className="Read_character_card-section">
      <h3>{title}</h3>
      <div className="Read_character_card-traits-grid">
        {traits.map((trait, index) => (
          <div key={index} className="Read_character_card-trait-card">
            <div className="Read_character_card-trait-name">{trait.name}</div>
            <div className="Read_character_card-trait-description">{trait.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
 
  
const handleDownload = async () => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 30;

    // Add cover page
    doc.setFillColor(245, 245, 245);
    doc.rect(0, 0, pageWidth, 300, 'F');
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(94, 53, 177); // Purple color
    doc.text(project.title, pageWidth / 2, 100, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.text(`By ${user?.name || 'VerseCraft Author'}`, pageWidth / 2, 120, { align: 'center' });
    
    // Add decorative line
    doc.setDrawColor(94, 53, 177);
    doc.setLineWidth(1);
    doc.line(50, 130, pageWidth - 50, 130);

    // Add table of contents
    doc.addPage();
    yPos = 30;
    doc.setFontSize(22);
    doc.setTextColor(94, 53, 177);
    doc.text("Table of Contents", 15, yPos);
    yPos += 20;

    chapters.forEach((chapter, index) => {
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Chapter ${chapter.number}`, 20, yPos);
      doc.text(`${chapter.title}`, 60, yPos);
      doc.text(`........................... ${index + 1}`, pageWidth - 40, yPos, { align: 'right' });
      yPos += 10;
    });

    // Add chapters with styling
    chapters.forEach((chapter) => {
      doc.addPage();
      yPos = 50;
      
      // Chapter header
      doc.setFillColor(94, 53, 177);
      doc.rect(0, 30, pageWidth, 15, 'F');
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text(`Chapter ${chapter.number}: ${chapter.title}`, 15, 40);

      // Chapter content
      const cleanContent = chapter.content.replace(/<[^>]+>/g, '');
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.setFont("times", "normal");
      
      const splitText = doc.splitTextToSize(cleanContent, 180);
      splitText.forEach((line) => {
        if (yPos > 280) {
          doc.addPage();
          yPos = 30;
        }
        // First line indent
        const indent = splitText.indexOf(line) === 0 ? 20 : 0;
        doc.text(line, 15 + indent, yPos);
        yPos += 7;
      });

      // Add decorative element
      doc.setFontSize(30);
      doc.setTextColor(200, 200, 200);
      doc.text("❝", pageWidth - 30, yPos + 10);
    });

    // Add character profiles
    doc.addPage();
    yPos = 30;
    doc.setFontSize(22);
    doc.setTextColor(94, 53, 177);
    doc.text("Character Profiles", 15, yPos);
    yPos += 20;

    characters.forEach((character) => {
      // Character card
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(15, yPos, 180, 50, 3, 3, 'F');
      doc.setDrawColor(200, 200, 200);
      doc.roundedRect(15, yPos, 180, 50, 3, 3);

      // Character image
      if (character.backgroundImage) {
        const img = new Image();
        img.src = `http://localhost:5001/${character.backgroundImage}`;
        doc.addImage(img, 'JPEG', 20, yPos + 5, 30, 40);
      }

      // Character details
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Name: ${character.fullName}`, 60, yPos + 10);
      doc.text(`Age: ${character.age || 'N/A'}`, 60, yPos + 20);
      doc.text(`Role: ${character.roles[0]?.name || 'N/A'}`, 60, yPos + 30);

      yPos += 60;
      if (yPos > 200) {
        doc.addPage();
        yPos = 30;
      }
    });

    // Add final page
    doc.addPage();
    doc.setFontSize(16);
    doc.setTextColor(94, 53, 177);
    doc.text("The End", pageWidth / 2, 150, { align: 'center' });

    doc.save(`${project.title}_Storybook.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.error('Failed to generate PDF');
  }
};

  return(
    <div className="reading-container">
     <Header/>
     
      <div className="readingProject-dashboard">


          <div className="reading-dashboard-progressbar">
              <div className="reading-progressbar-container">
                <div
                  className="reading-progressbar"
                  style={{ width: `${scrollPosition}%` }}
                >
                  <span className="reading-progressbar-text">
                  {Math.round(scrollPosition)}%
                </span>
                </div>
              </div>
            </div>

            <div style={{display: 'flex', flexDirection: 'row'}}>

            <div className="reading-left-column" >

            <div className="reading-toolbar-options">
             
              <div className="reading-toolbar-option">
              Dark Mode
                <Switch onChange={handleDarkModeToggle} />
              </div>
           
        

          <div className="reading-toolbar-option">
          Font Size
            <select className="reading-font-size-select">
              

              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
         
        </div>

        <div className="reading-project-chapter-outline-container">
          <div className="reading-project-chapter-outline-heading">Chapters</div>
          <div className="reading-project-chapter-outline-list">
            {chapters.length > 0 ? (
              chapters.map((chapter) => (
                <div
                  key={chapter._id}
                  className="reading-project-chapter-outline-item"
                  onClick={() => handleChapterClick(chapter._id)}
                >
                  <span>Chapter {chapter.number}: {chapter.title}</span>
                </div>
              ))
            ) : (
              <div className="reading-project-chapter-outline-item">No chapters available</div>
            )}
          </div>
        </div>


      <div className="reading-character-container">
      <div className="reading-character-heading">Characters</div>

      <div className="reading-character-list">
        {characters.length > 0 ? (
          characters.map((char) => (
            <div key={char._id} className="reading-character-item" onClick={() => openModal(char)}>
              {char.backgroundImage ? (
                <img
                  src={`http://localhost:5001/${char.backgroundImage}`}
                  alt={char.fullName}
                  className="character-list__picture"
                />
              ) : (
                <img src={characterIcon} alt={char.fullName} className="character-list__picture" />
              )}
              <div className="reading-character-name">{char.fullName}</div>
            </div>
          ))
        ) : (
          <div className="reading-character-item">No characters available</div>
        )}
      </div>
      {/* Modal */}
{/* Modal */}
{/* Modal */}
{isModalOpen && selectedCharacter && (
  <div className="Read_character_card-modal-overlay" onClick={closeModal}>
    <div className="Read_character_card-modal-content" onClick={(e) => e.stopPropagation()}>
      <button className="Read_character_card-close-button" onClick={closeModal}>✖</button>
      
      <div className="Read_character_card-modal-header">
        <h2>{selectedCharacter.fullName}</h2>
        <div className="Read_character_card-basic-info">
          {selectedCharacter.age && <span>Age: {selectedCharacter.age}</span>}
          {selectedCharacter.gender && <span>Gender: {selectedCharacter.gender}</span>}
          {selectedCharacter.ethnicity && <span>Ethnicity: {selectedCharacter.ethnicity}</span>}
        </div>
      </div>

      <div className="Read_character_card-modal-body">
        {selectedCharacter.backgroundImage && (
          <div className="Read_character_card-image-section">
            <img
              src={`http://localhost:5001/${selectedCharacter.backgroundImage}`}
              alt={selectedCharacter.fullName}
              className="Read_character_card-character-image"
            />
          </div>
        )}

        <div className="Read_character_card-details-section">
          {selectedCharacter.summary && (
            <div className="Read_character_card-section">
              <h3>Summary</h3>
              <p>{selectedCharacter.summary}</p>
            </div>
          )}

          {selectedCharacter.backstory && (
            <div className="Read_character_card-section">
              <h3>Backstory</h3>
              <p>{selectedCharacter.backstory}</p>
            </div>
          )}

          {renderTraitSection('Physical Traits', selectedCharacter.physicalTraits)}
          {renderTraitSection('Personality Traits', selectedCharacter.personalityTraits)}
          {renderTraitSection('Character Arcs', selectedCharacter.characterArcs)}
          {renderTraitSection('Relationships', selectedCharacter.relationships)}
          {renderTraitSection('Skills & Abilities', selectedCharacter.skills)}
          {renderTraitSection('Weaknesses', selectedCharacter.weaknesses)}
          {renderTraitSection('Roles', selectedCharacter.roles)}
        </div>
      </div>
    </div>
  </div>
)}


    </div>
      



        <div className="download-button-wrapper">
          <button className="download-button" onClick={handleDownload}>
            <span className="icon">
              <span className="arrow"></span>
              <svg className="line"></svg>
            </span>
            Download
          </button>
        </div>




        </div>

     
        <div className="reading-center-column">
          <div className="readingProject-chapter-container" ref={chapterContainerRef} onScroll={handleScroll}>
            <div className="readingProject-heading">
              <h1>{project ? project.title : "Title Unavailable"}</h1>
            </div>
            
            {chapters.length > 0 ? (
              chapters.map((chapter) => (
                <div key={chapter._id} id={`chapter-${chapter._id}`} className="readingProject-chapter">
                  <h2 className="readingProject-chapter-title">
                    Chapter {chapter.number}: {chapter.title}
                  </h2>
                  <div
                    className="readingProject-chapter-content"
                    dangerouslySetInnerHTML={{ __html: chapter.content }}
                  />
                </div>
              ))
            ) : (
              <div className="readingProject-chapter-content">No content available</div>
            )}
          </div>
        </div>

          <div className="reading-right-column">
          
         

    <Box
    class="add-to-favorites"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2, // Adds spacing between elements
        padding: 2,
        border: '1px solid #ccc',
        borderRadius: 2,
        maxWidth: 300,
        margin: 'auto',
      }}
    >
      {/* Primary Action: Add to Favorites */}
            <Button
          variant="contained"
          color="primary"
          startIcon={isFavorited ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          onClick={handleFavoriteToggle}
          sx={{
            textTransform: 'none',
            fontWeight: 'bold',
            backgroundColor: isFavorited ? '#ff4081' : '#1976d2',
            '&:hover': {
              backgroundColor: isFavorited ? '#d81b60' : '#1565c0',
            }
          }}
        >
          {isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
        </Button>
     
    </Box>



          


          <div className="readingProject-evaluation">
          <div className="readingProject-evaluation-Rating" 
  style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: "flex-start", gap: "10%" }}>
  <div>
    <h2 style={{ fontSize: "20px" }}>Rating</h2>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Rating
        name="rating"
        value={userRating}
        onChange={handleRatingChange}
        precision={0.5}
        max={5}
        sx={{
          mt: "1%",
          color: "gold",
          "& .MuiRating-iconFilled": { color: "gold" },
          "& .MuiRating-iconHover": { color: "darkgoldenrod" }
        }}
      />
      <span>({averageRating.toFixed(1)})</span>
      <span style={{ fontSize: '0.9rem', color: '#666' }}>
        ({totalRatings} ratings)
      </span>
    </div>
  </div>
</div>
<div className="readingProject-evaluation-Comments">
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
        <h2 style={{ fontSize: "20px", marginRight: "10%" }}>Comment</h2>

        {/* Sentiment Analysis Button */}
        <div
          className="reading-comment-sentiment-button"
          style={{ marginTop: "2%", cursor: "pointer", display: "flex", alignItems: "center" }}
          onClick={() => setIsSentimentModalOpen(true)}
        >
          <img src={pieChart} alt="Sentiment Analysis" style={{ width: "24px", height: "24px", marginRight: "5px" }} />
          <span className="sentiment-analysis-span" >Sentiment</span>
        </div>
      </div>

      {/* Modal for Sentiment Analysis */}
      <SentimentModal
        isOpen={isSentimentModalOpen}
        onClose={() => setIsSentimentModalOpen(false)}
        projectId={projectId} // Pass Project ID here
      />


              

              <List
      sx={{
        height: "200px",
        maxHeight: "200px",
        overflowY: "auto",
        overflowX: "hidden",
        border: "1px solid #ccc",
        borderRadius: "5px",
        padding: "8px",
         // Custom scrollbar styles
    "&::-webkit-scrollbar": {
      width: "6px", // Thin scrollbar
    },
    "&::-webkit-scrollbar-track": {
      background: "#f1f1f1", // Light gray track
      borderRadius: "10px",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "#888", // Darker scrollbar
      borderRadius: "10px",
    },
    "&::-webkit-scrollbar-thumb:hover": {
      background: "#555", // Darker color on hover
    },
      }}
    >
      {comments.map((comment, index) => (
        <div key={index}>
          <ListItem>
            <ListItemText
              primary={
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: "8px",
                    maxWidth: "200px",
                    wordWrap: "break-word",
                    overflowWrap: "break-word",
                    whiteSpace: "normal",
                  }}
                >
                  {(
                    <span
                      style={{
                        backgroundColor: comment.isAuthor ? "#1976d2" : "#ccc", // Blue for Author, Gray for Reader
                        color: "white",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                      }}
                    >
                      {comment.isAuthor ? "Author" : "Reader"}
                    </span>
                  )}
                  <Typography
                    ref={(el) => (commentRefs.current[index] = el)}
                    variant="body2"
                    sx={{
                      fontSize: "0.875rem",
                      color: "#666",
                      maxWidth: "180px",
                      maxHeight: expandedComments[index] ? "none" : "100px",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      display: expandedComments[index] ? "block" : "-webkit-box",
                      WebkitLineClamp: expandedComments[index] ? "unset" : 5,
                      WebkitBoxOrient: "vertical",
                      overflowWrap: "break-word",
                      whiteSpace: "normal",
                    }}
                  >
                {`${comment.userEmail.split("@")[0]}: ${comment.comment}`}


                  </Typography>
                  
                  {/* Show More/Less Button ONLY if the comment is overflowing */}
                  {overflowingComments[index] && (
                    <button
                      onClick={() => toggleExpand(index)}
                      style={{
                        fontSize: "0.75rem",
                        color: "#1976d2",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "2px",
                        alignSelf: "flex-end",
                      }}
                    >
                      {expandedComments[index] ? "Less" : "More"}
                    </button>
                  )}
                </div>
              }
            />
          </ListItem>
          <Divider />
        </div>
      ))}
    </List>


              <div className="readingProject-evaluation-Comments-Form">
                <TextField
                  fullWidth
                  label="Write a comment"
                  value={newComment}
                  onChange={handleCommentChange}
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCommentSubmit}
                  sx={{ mt: 1 }}
                >
                  Submit
                </Button>
              </div>




            </div>
          </div>
          

          </div>
        </div>
  </div>


    </div>
  );
}

export default Reading;