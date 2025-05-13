import React, {useState } from "react";
import './version.css'; 
import {  useNavigate } from 'react-router-dom';
import menuIcon from '../Images/Logo-V.png';
import profileIcon from '../Images/generic-user-profile-picture.png';
import favIcon from '../Images/fav.png';
import notiIcon from '../Images/noti.png';
import setIcon from '../Images/set.png';
import journalIcon from '../Images/journal.png';
import botIcon from "../Images/Bot.png";

const Version = ()  => {

    const navigate = useNavigate();
    const [showProjects, setShowProjects] = useState(true);
    const [showVersionDetails, setShowVersionDetails] = useState(false);
    const [selectedVersion, setSelectedVersion] = useState(null);

  
    const handleHomepageClick = () => {
      navigate('/Homepage'); // Assuming your profile page route is '/profile'
    };
  
  
    const handleProfileClick = () => {
      navigate('/Profile'); // Assuming your profile page route is '/profile'
    };
  
    const handleProjectsClick = () => {
      navigate('/Saved'); // Assuming your profile page route is '/profile'
    };
  
    const handleNotificationClick = () => {
      navigate('/Notification'); // Assuming your profile page route is '/profile'
    };
  
  
    const handleSettingClick = () => {
      navigate('/Setting'); // Assuming your profile page route is '/profile'
    };
  
  
  const handleChatbotClick = () => {
    navigate('/Chatbot'); // Assuming your profile page route is '/profile'
  };

  const handleFavoriteClick = () => {
    navigate('/Favorites'); // Assuming your profile page route is '/profile'
  };


  
  
    

  const toggleProjectsOutline = () => {
    setShowProjects(!showProjects);
  };

  const handleVersionRightClick = (version) => {
    setSelectedVersion(version);
    setShowVersionDetails(true);
  };

  const handleCloseVersionDetails = () => {
    setShowVersionDetails(false);
    setSelectedVersion(null);
  };

  // Sample data arrays
  const projects = [
    { id: 1, name: "Project A" },
    { id: 2, name: "Project B" },
    { id: 3, name: "Project C" },
    { id: 4, name: "Project D" },
    { id: 5, name: "Project E" },
    { id: 6, name: "Project F" },
    { id: 7, name: "Project G" },
    { id: 8, name: "Project H" },
    { id: 9, name: "Project I" },
    { id: 10, name: "Project J" },
    { id: 11, name: "Project K" },
    { id: 12, name: "Project L" },
    { id: 13, name: "Project M" },
    { id: 14, name: "Project N" },
    { id: 15, name: "Project O" },
    { id: 16, name: "Project P" },
    { id: 17, name: "Project Q" },
    { id: 18, name: "Project R" },
    { id: 19, name: "Project S" },
    { id: 20, name: "Project T" },
    { id: 21, name: "Project U" },
    { id: 22, name: "Project V" },
    { id: 23, name: "Project W" },
    { id: 24, name: "Project X" },
    { id: 25, name: "Project Y" },
    { id: 26, name: "Project Z" },
  ];
  

  const outlines = [
    { id: 1, title: "Chapter 1" },
    { id: 2, title: "Chapter 2" },
    { id: 3, title: "Chapter 3" },
    { id: 4, title: "Chapter 4" },
    { id: 5, title: "Chapter 5" },
    { id: 6, title: "Chapter 6" },
    { id: 7, title: "Chapter 7" },
    { id: 8, title: "Chapter 8" },
    { id: 9, title: "Chapter 9" },
    { id: 10, title: "Chapter 10" },
    { id: 11, title: "Chapter 11" },
    { id: 12, title: "Chapter 12" },
    { id: 13, title: "Chapter 13" },
    { id: 14, title: "Chapter 14" },
    { id: 15, title: "Chapter 15" },
    { id: 16, title: "Chapter 16" },
    { id: 17, title: "Chapter 17" },
    { id: 18, title: "Chapter 18" },
    { id: 19, title: "Chapter 19" },
    { id: 20, title: "Chapter 20" },
    { id: 21, title: "Chapter 21" },
    { id: 22, title: "Chapter 22" },
    { id: 23, title: "Chapter 23" },
    { id: 24, title: "Chapter 24" },
    { id: 25, title: "Chapter 25" },
    { id: 26, title: "Chapter 26" },
  ];
  
  const versions = [
    {
      id: "version 1.0",
      date: "2024-10-07",
      author: "John Doe",
      description: "Initial draft of the document",
      status: "Draft",
      history: ["v0.9"],
      permissions: "Edit",
      comments: "Reviewed by team",
    },
    {
      id: "version 1.1",
      date: "2024-10-10",
      author: "Jane Smith",
      description: "Added Chapter 2",
      status: "Approved",
      history: ["v1.0"],
      permissions: "View",
      comments: "Reviewed by manager",
    },
    {
      id: "version 2.0",
      date: "2024-10-15",
      author: "John Doe",
      description: "Finalized content",
      status: "Finalized",
      history: ["v1.1"],
      permissions: "Edit",
      comments: "Ready for publication",
    },
  ];

    


    return (

        <div className="version-container">

<div className="homepage-header">
        <header className="homepage-header-item">
          <img src={menuIcon} alt="Menu" className="homepage-menu-icon"  />
          <div className="homepage-app-title" onClick={handleHomepageClick} >VerseCraft</div>
          <nav>
            <ul>
            <li className="homepage-Plot" onClick={handleProjectsClick}>
                <img src={journalIcon} alt="Character" className="homepage-character-icon" />
                My Projects
              </li>
              <li className="homepage-Character" onClick={handleFavoriteClick}>
                <img src={favIcon} alt="Character" className="homepage-character-icon" />
                Favorites
              </li>
              <li className="homepage-Chatbot" onClick={handleChatbotClick}>
                <img src={botIcon} alt="homepage-chatbot" className="homepage-chatbot-icon" />
                InspireBot
              </li>
              
              <li className="homepage-Published" onClick={handleNotificationClick} >
                <img src={notiIcon} alt="Published Works" className="homepage-publish-icon" />
                Notifications
              </li>
              <li className="homepage-inspire-bot" onClick={handleSettingClick} >
                <img src={setIcon} alt="InspireBot" className="homepage-bot-icon" />
                Settings
              </li>
              <li className="homepage-Profile" onClick={handleProfileClick}>
                <img src={profileIcon} alt="Profile" className="homepage-profile-icon" />
                John Doe
              </li>
            </ul>
          </nav>
        </header>
      </div>
     
          

              

            <div className="version-dashboard">
        <div className={`version-left-sidepanel ${showProjects ? 'show-projects' : 'show-outline'}`}>
            <div className="toggle-button-container">
            <div className="toggle-button">
            <button
                className={`toggle-option ${showProjects ? 'selected' : ''}`}
                onClick={toggleProjectsOutline}
            >
                Project
            </button>
            <button
                className={`toggle-option ${!showProjects ? 'selected' : ''}`}
                onClick={toggleProjectsOutline}
            >
                Outline
            </button>
            <div
                className={`toggle-slider ${showProjects ? 'slide-left' : 'slide-right'}`}
            ></div>
            </div>
        </div>


          {showProjects ? (
            <div className="version-left-sidepanel-project">
              <div className="version-left-sidepanel-project-container">
                <div className="version-left-sidepanel-project-list">
                  {projects.map((project) => (
                    <div key={project.id} className="version-left-sidepanel-project-item">
                      <div className="version-left-sidepanel-project-text">
                        {project.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="version-left-sidepanel-outline">
              <div className="version-left-sidepanel-outline-container">
                <div className="version-left-sidepanel-outline-list">
                  {outlines.map((outline) => (
                    <div key={outline.id} className="version-left-sidepanel-outline-item">
                      <div className="version-left-sidepanel-outline-text">
                        {outline.title}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="version-view-content">
          {/* Scrollable Document View */}

          
          
        </div>

        <div className="version-right-sidepanel">
          <div className="version-right-sidepanel-title">Versions</div>
          <div className="version-right-sidepanel-version-container">
            <div className="version-right-sidepanel-version-list">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className="version-right-sidepanel-version-item"
                  onContextMenu={(e) => {
                    e.preventDefault();
                    handleVersionRightClick(version);
                  }}
                >
                  <div className="version-right-sidepanel-version-text">
                    {version.id}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showVersionDetails && selectedVersion && (
        <div className="version-details-popup">
          <div className="version-details-content">
            <button className="version-details-close" onClick={handleCloseVersionDetails}>
              &times;
            </button>
            <h3>Version Details</h3>
            <p><strong>Version Number:</strong> {selectedVersion.id}</p>
            <p><strong>Date and Time of Creation:</strong> {selectedVersion.date}</p>
            <p><strong>Author or Editor:</strong> {selectedVersion.author}</p>
            <p><strong>Change Description:</strong> {selectedVersion.description}</p>
            <p><strong>Status:</strong> {selectedVersion.status}</p>
            <p><strong>Version History:</strong> {selectedVersion.history.join(", ")}</p>
            <p><strong>Access or Permissions:</strong> {selectedVersion.permissions}</p>
            <p><strong>Comments or Annotations:</strong> {selectedVersion.comments}</p>
          </div>
        </div>
      )}


    </div>        

    );
};

export default Version;