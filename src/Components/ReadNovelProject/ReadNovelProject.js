import React, { useState, useEffect ,useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ReadNovelProject.css';
import { useParams} from 'react-router-dom';
import Switch from '@mui/material/Switch';
import Header from '../Header/header';
import { Rating, TextField, Button } from '@mui/material';
import {  List, ListItem, ListItemText, Divider } from '@mui/material';



function ReadNovelProject() {
    const navigate = useNavigate();
    const [chapters, setChapters] = useState([]);

    const { projectId } = useParams(); // Assuming projectId refers to Story ID
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
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
  }, [navigate]);

  useEffect(() => {
    fetch(`/api/novels/${projectId}/chapters`)
      .then((res) => res.json())
      .then((data) => {
        setChapters(data);
        
      })
      .catch((error) => console.error(error));
  }, [projectId]);

 


 
 const chapterContainerRef = useRef(null);
    const [scrollPosition, setScrollPosition] = useState(0);
  
    const handleScroll = () => {
      if (chapterContainerRef.current) {
        const scrollTop = chapterContainerRef.current.scrollTop;
        const clientHeight = chapterContainerRef.current.clientHeight;
        const scrollHeight = chapterContainerRef.current.scrollHeight;
        const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
        setScrollPosition(progress);
      }
    };

    const handleDarkModeToggle = () => {
      const body = document.body;
      body.classList.toggle('dark-mode');
    };

    
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

const [ratingValue, setRatingValue] = useState(0);
      const [comment, setComment] = useState('');
    
      const handleRatingChange = (event, newValue) => {
        setRatingValue(newValue);
      };
    
      const [comments, setComments] = useState([]);
      const [newComment, setNewComment] = useState('');
      const [username, setUsername] = useState('');
    
      const handleCommentChange = (event) => {
        setNewComment(event.target.value);
      };
    
      const handleUsernameChange = (event) => {
        setUsername(event.target.value);
      };
    
      const handleCommentSubmit = () => {
        const newCommentObject = {
          username,
          comment: newComment,
        };
        setComments((prevComments) => [...prevComments, newCommentObject]);
        setNewComment('');
        setUsername('');
      };

 

  return (
    <div className="read-novel-container">
      
        <Header />

     
      <div className="ReadNovelProject-dashboard">
           

            <div className="ReadNovel-dashboard-progressbar">
              <div className="ReadNovel-progressbar-container">
                <div
                  className="ReadNovel-progressbar"
                  style={{ width: `${scrollPosition}%` }}
                >
                  <span className="ReadNovel-progressbar-text">
                  {Math.round(scrollPosition)}%
                </span>
                </div>
              </div>
            </div>

            <div className="ReadNovel-toolbar-options">
              
              <div className="ReadNovel-toolbar-option">
              Dark Mode
                <Switch onChange={handleDarkModeToggle} />
              </div>
            


          <div className="ReadNovel-toolbar-option">
          Font Size
            <select className="ReadNovel-font-size-select">
              

              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>

          </div>

          <div className="ReadNovel-project-chapter-outline-container">
          <div className="ReadNovel-project-chapter-outline-heading">Chapters</div>
          <div className="ReadNovel-project-chapter-outline-list">
            {chapters.map((chapter) => (
              <div
                key={chapter._id}
                className="ReadNovel-project-chapter-outline-item"
                onClick={() => handleChapterClick(chapter._id)}
              >
                <span>Chapter {chapter.number}: {chapter.title}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="ReadNovelProject-heading">
                <h1>Your Novel</h1>
            </div>

          
        
          <div className="ReadNovelProject-chapter-container" ref={chapterContainerRef} onScroll={handleScroll}>
              {chapters.map((chapter) => (
                  <div key={chapter._id}  id={`chapter-${chapter._id}`}  className="ReadNovelProject-chapter">
                      <h2 className="ReadNovelProject-chapter-title">
                          Chapter {chapter.number}: {chapter.title}
                      </h2>
                      <div
                          className="ReadNovelProject-chapter-content"
                          dangerouslySetInnerHTML={{ __html: chapter.content }}
                      />
                  </div>
              ))}
          </div>


        </div>


    </div>
  );
}

export default ReadNovelProject;