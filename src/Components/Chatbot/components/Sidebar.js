import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toggleOpen from '../styles/toggle-open.png';
import toggleClose from '../styles/toggle-close.png';

function Sidebar({ setSelectedProjectId }) {
  


  const [projects, setProjects] = useState([]);
  const [collabProjects, setCollabProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(true);
  const [animateBounce, setAnimateBounce] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('User not logged in');
          return;
        }

        const userResponse = await axios.get('http://localhost:5001/api/users/profile', {
          headers: { 'x-auth-token': token },
        });

        const email = userResponse.data.email;

        const [stories, novels, urdu, collabStories, collabNovels, collabUrdu] = await Promise.all([
          axios.get(`http://localhost:5001/api/stories/user/${email}`),
          axios.get(`http://localhost:5001/api/novels/user/${email}`),
          axios.get(`http://localhost:5001/api/urdu/user/${email}`),
          axios.get(`http://localhost:5001/api/stories/collaborator/${email}`),
          axios.get(`http://localhost:5001/api/novels/collaborator/${email}`),
          axios.get(`http://localhost:5001/api/urdu/collaborator/${email}`),
        ]);

        setProjects([
          ...stories.data.map(proj => ({ ...proj, type: 'Storyboard' })),
          ...novels.data.map(proj => ({ ...proj, type: 'Novelboard' })),
          ...urdu.data.map(proj => ({ ...proj, type: 'Urduboard' })),
        ]);

        setCollabProjects([
          ...collabStories.data.map(proj => ({ ...proj, type: 'Storyboard' })),
          ...collabNovels.data.map(proj => ({ ...proj, type: 'Novelboard' })),
          ...collabUrdu.data.map(proj => ({ ...proj, type: 'Urduboard' })),
        ]);
      } catch (err) {
        console.error('Failed to fetch projects:', err);
        setError('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);


  const handleToggle = () => {
    if (!isOpen) {
      setAnimateBounce(true); // Trigger animation when opening
      setTimeout(() => setAnimateBounce(false), 100); // Stop animation after bounce
    }
    setIsOpen(!isOpen);
  };

  document.addEventListener("DOMContentLoaded", function () {
    const toggleButton = document.querySelector(".toggle-btn");
  
    toggleButton.addEventListener("click", function () {
      const originalColor = getComputedStyle(this).backgroundColor;
      
      this.style.backgroundColor = "#2980b9"; // Pulse color
  
      setTimeout(() => {
        this.style.backgroundColor = originalColor; // Revert back
      }, 300); // Duration of the effect
    });
  });



  return (
    <div className={`chatbot-sidebar ${isOpen ? 'open' : 'collapsed'} ${animateBounce ? 'bounce' : ''} `} style={{ marginLeft: !isOpen ? '-18%' : '0', transition:'margin-left 0.5s ease-in-out' }}>
    {/* Toggle Button */}
    <div className="toggle-btn"onClick={handleToggle}>
      <img src={isOpen ? toggleClose : toggleOpen} alt="Toggle Sidebar" />
    </div>

    {isOpen && (
      <>
        {loading ? (
          <p>Loading projects...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <>
            <h3>Your Projects</h3>
            <ul>
              {projects.length > 0 ? (
                projects.map((project) => (
                  <li key={project._id}>
                    <button onClick={() => setSelectedProjectId(project._id)} >{project.title}</button>
                  </li>
                ))
              ) : (
                <p>No projects found</p>
              )}
            </ul>

            <h3>Collaborations</h3>
            <ul className="collab-projects">
              {collabProjects.length > 0 ? (
                collabProjects.map((project) => (
                  <li key={project._id}>
                    <button  onClick={() => setSelectedProjectId(project._id)} >{project.title} </button>
                  </li>
                ))
              ) : (
                <p>No collaborative projects</p>
              )}
            </ul>
          </>
        )}
      </>
    )}
  </div>
);
}
export default Sidebar;
