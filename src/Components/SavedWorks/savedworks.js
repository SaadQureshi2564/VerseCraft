import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Scrollbars } from 'react-custom-scrollbars-2';
import './savedworks.css';
import profileIcon from '../Images/generic-user-profile-picture.png';
import recentImg from '../Images/Recent.png';
import {
  Box,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import Header from '../Header/header';




function SavedWorks() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [Collabprojects, setCollabProjects] = useState([]);


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
        console.log(response.data.fullname);
        fetchUserProjects(response.data.email);
        fetchUserCollabProjects(response.data.email);
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
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  };

  const fetchUserCollabProjects = async (email) => {
    try {
      const [storiesResponse, novelsResponse, urduResponse] = await Promise.all([
        axios.get(`http://localhost:5001/api/stories/collaborator/${email}`),
        axios.get(`http://localhost:5001/api/novels/collaborator/${email}`),
        axios.get(`http://localhost:5001/api/urdu/collaborator/${email}`)
      ]);
  
      const combinedCollabProjects = [
        ...storiesResponse.data.map(project => ({ ...project, projectType: 'Storyboard' })),
        ...novelsResponse.data.map(project => ({ ...project, projectType: 'Novelboard' })),
        ...urduResponse.data.map(project => ({ ...project, projectType: 'Urduboard' }))
      ];
  
      setCollabProjects(combinedCollabProjects);
    } catch (err) {
      console.error('Failed to load collaborator projects:', err);
    }
  };

  const renderThumb = ({ style, ...props }) => {
    const thumbStyle = {
      backgroundColor: '#F47D4B',
      borderRadius: '10px',
      opacity: 0,
    };
    return <div style={{ ...style, ...thumbStyle }} {...props} />;
  };

  const renderTrack = ({ style, ...props }) => {
    const trackStyle = {
      backgroundColor: '#191B30',
      borderRadius: '10px',
      opacity: 0,
    };
    return <div style={{ ...style, ...trackStyle }} {...props} />;
  };

  const handleScrollStart = () => {
    const thumb = document.querySelector('.custom-thumb');
    const track = document.querySelector('.custom-track');
    if (thumb) thumb.style.opacity = 1;
    if (track) track.style.opacity = 1;
  };

  const handleScrollStop = () => {
    const thumb = document.querySelector('.custom-thumb');
    const track = document.querySelector('.custom-track');
    if (thumb) thumb.style.opacity = 0;
    if (track) track.style.opacity = 0;
  };


  const handleNovelClick = (projectId) => navigate(`/ReadNovelProject/${projectId}`);
  const handleStoryClick = (projectId) =>     navigate(`/ReadStoryProject/${projectId}`);
  const handleUrduClick = (projectId) => navigate(`/ReadUrduProject/${projectId}`);

  const getFilteredProjects = (type) => {
    const allProjects = [...projects, ...Collabprojects];
    return allProjects
      .filter(project => project.projectType === type)
      .filter(project => project.title?.toLowerCase().includes(searchQuery.toLowerCase()));
  };

    






  return (
    <div className="saved-container">
         <Header />

      <div className="savedworks-dashboard">
        
      <div className="saved-search-bar-container">
        <div className="saved-Search-bar">
          <input
            type="text"
            className="saved-search-input"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>


        <div className="saved-search-type">
          <select>
            <option value="all">All</option>
            <option value="private">Private</option>
            <option value="public">Public</option>
            <option value="collab">Collab</option>
          </select>
        </div>

        <div className="saved-search-sort">
          <select>
            <option value="latest">latest</option>
            <option value="oldest">oldest</option>
          </select>
        </div>
      </div>

      <div className="saved-profile-info">
        <div className="saved-profile-pic">
          <img src={user?.profileImage ? `http://localhost:5001/${user.profileImage}` : profileIcon}
                  alt="Profile"
                  className="savedworks-profile-icon-major"
                />
        </div>
        <div className="saved-profile-name">
          <span className="savedworks-profile-name-major">{user ? user.fullname : 'Guest'}</span>
        </div>
        
        <div className="saved-profile-followers">
          <div className="saved-follower-icon"></div>
          <div className="saved-follower-count">24</div>
          <div className="saved-follower-text">Followers</div>

          <div className="saved-following-icon"></div>
          <div className="saved-following-count">56</div>
          <div className="saved-following-text">Following</div>
        </div>
      </div>

    <Box className="saved-Works">
      <Box className="saved-Stories" sx={{ mb: 2 }}>
        <Typography variant="h1">Stories</Typography>
        <List sx={{ maxHeight: 230, overflowY: 'auto' }}>
          {getFilteredProjects('Storyboard').map((project, index) => (
            <ListItem
              key={project._id || index}
              onClick={() => handleStoryClick(project._id)}
            >
              <ListItemText 
                primary={
                  <span style={{
                    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                    fontWeight: 400
                  }}>
                    {project.title}
                  </span>
                } 
              />

            </ListItem>
          ))}
        </List>
      </Box>

      <Box className="saved-Novels" sx={{ mb: 2 }}>
        <Typography variant="h2">Novels</Typography>
        <List sx={{ maxHeight: 230, overflowY: 'auto' }}>
          {getFilteredProjects('Novelboard').map((project, index) => (
            <ListItem
              key={project._id || index}
              onClick={() => handleNovelClick(project._id)}
            >
              <ListItemText 
                primary={
                  <span style={{
                    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                    fontWeight: 400
                  }}>
                    {project.title}
                  </span>
                } 
              />
            </ListItem>
          ))}
        </List>
      </Box>

      <Box className="saved-Urdu">
        <Typography variant="h2">Urdu works</Typography>
        <List sx={{ maxHeight: "230px", overflowY: 'auto', height: 230 }}>
          {getFilteredProjects('Urduboard').map((project, index) => (
            <ListItem
              key={project._id || index}
              onClick={() => handleUrduClick(project._id)}
            >
              <ListItemText 
                primary={
                  <span style={{
                    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                    fontWeight: 400
                  }}>
                    {project.title}
                  </span>
                } 
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>

        <div className="saved-recents">
          <h1>Recents</h1>
          <Scrollbars
            renderThumbHorizontal={renderThumb}
            renderTrackHorizontal={renderTrack}
            onScrollStart={handleScrollStart}
            onScrollStop={handleScrollStop}
            style={{ height: '150px', overflowY: 'hidden' }}
          >
            <div className="saved-recents-container">
              <div className="saved-recents-scroll">
                {[...projects, ...Collabprojects]
                  .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                  .slice(0, 12)
                  .map((project, index) => (
                    <div key={project._id || index} className="saved-item">
                      <img src={recentImg} alt="Recent" className="saved-recent-icon" />
                      <p>{project.title}</p>
                    </div>
                  ))}
              </div>
            </div>
          </Scrollbars>
        </div>
      </div>
    </div>
  );
}

export default SavedWorks;