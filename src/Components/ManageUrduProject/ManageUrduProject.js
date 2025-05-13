// src/components/UrduEditor.jsx

import React, { useState, useEffect } from "react";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios'; // Ensure Axios is correctly installed and configured
import "./ManageUrduProject.css"; // Custom styles for other components

import menuIcon from '../Images/Logo-V.png';
import plotIcon from '../Images/Plot.png';
import characterIcon from '../Images/Character.png';
import publishIcon from '../Images/Published.png';
import profileIcon from '../Images/generic-user-profile-picture.png';
import goalIcon from '../Images/goal.png';
import favIcon from '../Images/fav.png';
import notiIcon from '../Images/noti.png';
import setIcon from '../Images/set.png';
import journalIcon from '../Images/journal.png';
import comIcon from "../Images/comm.png";
import plusIcon from '../Images/Plus.png';
import botIcon from "../Images/Bot.png";
import Header from '../Header/header';
import Sidebar from '../Sidebar/sidebar';

const ManageUrduProject = () => {
  const { projectId } = useParams(); // Ensure that projectId is correctly obtained from the route
 
  const [theme, setTheme] = useState('theme-light'); // Default theme
 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigate = useNavigate();

  
  // Handlers for navigation
  const handleHomepageClick = () => navigate('/Homepage');
  const handlePublishClick = () => navigate('/Publishing');
  const handleProfileClick = () => navigate('/Profile');
  const handleProjectsClick = () => navigate('/Saved');
  const handleNotificationClick = () => navigate('/Notification');
  const handleProgressClick = () => navigate('/Progress');
  const handleSettingClick = () => navigate('/Setting');
  const handleFavoriteClick = () => navigate('/Favorites');
  const handleChatbotClick = () => navigate('/Chatbot');


  const [isAddCollaboratorsOpen, setIsAddCollaboratorsOpen] = useState(false);

  const handleAddCollaboratorClick = () => {
    setIsAddCollaboratorsOpen(true);
  };


 
  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCharacterClick = () => {
    navigate(`/Character/${projectId}`);
};



  const handlePlotClick = () => {
        
    navigate(`/Plot/${projectId}`);
};

const [project, setProject] = useState(null);
const [chapters, setChapters] = useState([]);
const [editingProject, setEditingProject] = useState(false);
const [editingChapter, setEditingChapter] = useState(null);
const [newChapter, setNewChapter] = useState({
  title: "",
  number: "",
  content: "",
  summary: "",
});

// Fetch project details and chapters
useEffect(() => {
  const fetchData = async () => {
    try {
      const projectResponse = await axios.get(`/api/urdu/${projectId}`);
      setProject(projectResponse.data);

      const chaptersResponse = await axios.get(`/api/urduchapters/${projectId}`);
      setChapters(chaptersResponse.data);
    } catch (err) {
      console.error(err);
    }
  };
  fetchData();
}, [projectId]);

// Handle project updates
const handleProjectUpdate = async () => {
  try {
    await axios.put(`/api/urdu/${projectId}`, project);
    alert("Project updated successfully");
    setEditingProject(false);
  } catch (err) {
    console.error(err);
    alert("Failed to update project");
  }
};

// Handle chapter creation
const handleChapterCreate = async () => {
  try {
    const response = await axios.post("/api/urduchapters", {
      ...newChapter,
      projectId,
    });
    setChapters([...chapters, response.data]);
    setNewChapter({ title: "", number: "", content: "", summary: "" });
    alert("Chapter added successfully");
  } catch (err) {
    console.error(err);
    alert("Failed to add chapter");
  }
};

// Handle chapter updates
const handleChapterUpdate = async () => {
  try {
    const { _id, ...updatedChapter } = editingChapter;
    const response = await axios.put(`/api/urduchapters/${projectId}/${_id}`, updatedChapter);
    setChapters(
      chapters.map((chapter) =>
        chapter._id === _id ? { ...chapter, ...response.data } : chapter
      )
    );
    setEditingChapter(null);
    alert("Chapter updated successfully");
  } catch (err) {
    console.error(err);
    alert("Failed to update chapter");
  }
};


  return (
    <div className={`urdu-editor-container ${theme}`}>
      {/* Header */}
      <Header/>
      <Sidebar projectId={projectId} />


      <div className="homepage-header">
        <header className="homepage-header-item">
          <img 
            src={menuIcon} 
            alt="Menu" 
            className="homepage-menu-icon" 
            onClick={toggleSidebar} 
            style={{ cursor: 'pointer' }}
          />
          <div className="homepage-app-title" onClick={handleHomepageClick} style={{ cursor: 'pointer' }}>
            VerseCraft
          </div>
          <nav>
            <ul>
              <li className="homepage-Plot" onClick={handleProjectsClick} style={{ cursor: 'pointer' }}>
                <img src={journalIcon} alt="My Projects" className="homepage-character-icon" />
                My Projects
              </li>
              <li className="homepage-Character" onClick={handleFavoriteClick} style={{ cursor: 'pointer' }}>
                <img src={favIcon} alt="Favorites" className="homepage-character-icon" />
                Favorites
              </li>
              <li className="homepage-Chatbot" onClick={handleChatbotClick} style={{ cursor: 'pointer' }}>
                <img src={botIcon} alt="InspireBot" className="homepage-chatbot-icon" />
                InspireBot
              </li>
              <li className="homepage-Published" onClick={handleNotificationClick} style={{ cursor: 'pointer' }}>
                <img src={notiIcon} alt="Notifications" className="homepage-publish-icon" />
                Notifications
              </li>
              <li className="homepage-inspire-bot" onClick={handleSettingClick} style={{ cursor: 'pointer' }}>
                <img src={setIcon} alt="Settings" className="homepage-bot-icon" />
                Settings
              </li>
              <li className="homepage-Profile" onClick={handleProfileClick} style={{ cursor: 'pointer' }}>
                <img src={profileIcon} alt="Profile" className="homepage-profile-icon" />
                John Doe
              </li>
            </ul>
          </nav>
        </header>
      </div>

      {/* Sidebar */}
      <div className={`homepage-sidebar ${isSidebarOpen ? 'open' : ''}`} id="sidebar">
        <button id="sidebarToggle" className="homepage-sidebar-toggle" onClick={toggleSidebar} style={{ cursor: 'pointer', background: 'none', border: 'none', fontSize: '1.5em' }}>
          &#9776;
        </button>

        <div className='homepage-journal' style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }} onClick={handlePlotClick}>
          <img src={plotIcon} alt="Plot" className="homepage-journal-icon" />
          <span>Plot</span>
          <img 
            src={plusIcon} 
            alt="Add Plot" 
            className="noveldashboard-Add-plot-icon" 
            style={{ cursor: 'pointer' }}
            onClick={(e) => { e.stopPropagation(); handlePlotClick(); }}
          />
        </div>
        <div className='homepage-notifications' style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }} onClick={handleCharacterClick}>
          <img src={characterIcon} alt="Character" className="homepage-noti-icon" />
          <span>Character</span>
          <img 
            src={plusIcon} 
            alt="Add Character" 
            className="noveldashboard-Add-character-icon" 
            style={{ cursor: 'pointer' }}
            onClick={(e) => { e.stopPropagation(); handleCharacterClick(); }}
          />
        </div>
        <div className='homepage-notifications' style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }} onClick={handleAddCollaboratorClick}>
          <img src={comIcon} alt="Collaborators" className="homepage-noti-icon" />
          <span>Collaborators</span>
          <img 
            src={plusIcon} 
            alt="Add Collaborator" 
            className="noveldashboard-Add-collaborator-icon" 
            style={{ cursor: 'pointer' }}
            onClick={(e) => { e.stopPropagation(); handleAddCollaboratorClick(); }} // Ensure this points to the correct handler if different
          />
        </div>

        <div className='homepage-goals' onClick={handlePublishClick} style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', marginTop: '10px' }}>
          <img src={publishIcon} alt="Publishing" className="homepage-goal-icon" />
          <span>Publishing</span>
        </div>
        <div className='homepage-favorites' onClick={handleProgressClick} style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', marginTop: '10px' }}>
          <img src={goalIcon} alt="Progress" className="homepage-fav-icon" />
          <span>Progress</span>
        </div>
       

      </div>

      <div className={`urdu-editor-container ${theme}`}>
      {/* Header and Sidebar Omitted for Brevity */}

      <div className="ManageurduProject-container">
      {/* Edit Project Section */}
      <div className="ManageurduProject-project-section">
        {project && (
          <div>
            <h2>Edit Project</h2>
            {editingProject ? (
              <div>
                <input
                  type="text"
                  value={project.title}
                  onChange={(e) => setProject({ ...project, title: e.target.value })}
                  placeholder="Project Title"
                  className="ManageurduProject-input"
                />
                <textarea
                  value={project.description}
                  onChange={(e) => setProject({ ...project, description: e.target.value })}
                  placeholder="Project Description"
                  className="ManageurduProject-textarea"
                />
                <button onClick={handleProjectUpdate} className="ManageurduProject-button">
                  Save
                </button>
                <button onClick={() => setEditingProject(false)} className="ManageurduProject-button-cancel">
                  Cancel
                </button>
              </div>
            ) : (
              <div>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <button onClick={() => setEditingProject(true)} className="ManageurduProject-button">
                  Edit
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Manage Chapters Section */}
      <div className="ManageurduProject-chapter-section">
        <h2>Manage Chapters</h2>
        <div className="ManageurduProject-new-chapter">
          <h3>Add New Chapter</h3>
          <input
            type="text"
            value={newChapter.title}
            onChange={(e) => setNewChapter({ ...newChapter, title: e.target.value })}
            placeholder="Chapter Title"
            className="ManageurduProject-input"
          />
          <input
            type="number"
            value={newChapter.number}
            onChange={(e) => setNewChapter({ ...newChapter, number: e.target.value })}
            placeholder="Chapter Number"
            className="ManageurduProject-input"
          />
          <textarea
            value={newChapter.content}
            onChange={(e) => setNewChapter({ ...newChapter, content: e.target.value })}
            placeholder="Chapter Content"
            className="ManageurduProject-textarea"
          />
          <textarea
            value={newChapter.summary}
            onChange={(e) => setNewChapter({ ...newChapter, summary: e.target.value })}
            placeholder="Chapter Summary"
            className="ManageurduProject-textarea"
          />
          <button onClick={handleChapterCreate} className="ManageurduProject-button">
            Add Chapter
          </button>
        </div>

        <div className="ManageurduProject-chapters-list">
          {chapters.map((chapter) => (
            <div key={chapter._id} className="ManageurduProject-chapter-item">
              {editingChapter?._id === chapter._id ? (
                <div>
                  <input
                    type="text"
                    value={editingChapter.title}
                    onChange={(e) =>
                      setEditingChapter({ ...editingChapter, title: e.target.value })
                    }
                    placeholder="Chapter Title"
                    className="ManageurduProject-input"
                  />
                  <input
                    type="number"
                    value={editingChapter.number}
                    onChange={(e) =>
                      setEditingChapter({ ...editingChapter, number: e.target.value })
                    }
                    placeholder="Chapter Number"
                    className="ManageurduProject-input"
                  />
                  <textarea
                    value={editingChapter.content}
                    onChange={(e) =>
                      setEditingChapter({ ...editingChapter, content: e.target.value })
                    }
                    placeholder="Chapter Content"
                    className="ManageurduProject-textarea"
                  />
                  <textarea
                    value={editingChapter.summary}
                    onChange={(e) =>
                      setEditingChapter({ ...editingChapter, summary: e.target.value })
                    }
                    placeholder="Chapter Summary"
                    className="ManageurduProject-textarea"
                  />
                  <button onClick={handleChapterUpdate} className="ManageurduProject-button">
                    Save
                  </button>
                  <button
                    onClick={() => setEditingChapter(null)}
                    className="ManageurduProject-button-cancel"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div>
                  <h3>{chapter.title}</h3>
                  <p>{chapter.content}</p>
                  <button
                    onClick={() => setEditingChapter(chapter)}
                    className="ManageurduProject-button"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>

    </div>

    </div>
  );
};

export default ManageUrduProject;
