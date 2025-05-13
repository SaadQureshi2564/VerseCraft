import React, { useEffect, useState } from "react";
import './publishing.css'; // Ensure the CSS is linked correctly
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Header from '../Header/header';
import Sidebar from '../Sidebar/sidebar';
import profileIcon from '../Images/generic-user-profile-picture.png';

const Publishing = () => {
  const navigate = useNavigate();
  const { projectId } = useParams(); // Assuming projectId refers to Project ID
  const [project, setProject] = useState(null); // State to hold project data
  const [chapters, setChapters] = useState([]); // State to hold chapters data
  const [user, setUser] = useState(null); // State to hold user data
  const [error, setError] = useState(null); // State to handle errors
  const [loading, setLoading] = useState(true); // Loading state
  const [coverPicture, setCoverPicture] = useState(null); // State to store the cover picture
  const [projectType, setProjectType] = useState(null); // State to hold the project type

  // Fetch user data on component mount
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


  useEffect(() => {
    const fetchPublishingData = async () => {
      try {
        const response = await axios.get(`/api/publishing/${projectId}`);
        if (response.data) {
          setProject(response.data);
          setCoverPicture(response.data.coverPicture);
        }
      } catch (err) {
       // createPublishing();
        // console.error('Error fetching publishing data:', err);
        // setError('Failed to fetch publishing data');
      }
    };
  
    if (projectId) {
      fetchPublishingData();
    }
  }, [projectId]);
  

  // Handle cover picture change
const handleCoverPictureChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    setCoverPicture(file); // Store the actual file (not URL)
  }
};

// Create publishing information
const createPublishing = async () => {
  try {
    const formData = new FormData();
    formData.append('projectId', projectId);
    formData.append('projectType', projectType);
    formData.append('title', project.title);
    formData.append('shortTitle', project.shortTitle);
    formData.append('summary', project.summary);
    formData.append('genres', project.genres.join(','));
    formData.append('publishingType', 'Public');
    formData.append('audience', project.audience);

    // Append the cover picture file if selected
    if (coverPicture) {
      formData.append('coverPicture', coverPicture);
    }

    await axios.post(`/api/publishing/create/${projectId}`, formData, {
      headers: { 'x-auth-token': localStorage.getItem('token') },
    });
    alert('Publishing project created successfully');
    // navigate(`/projects/${projectId}`);
  } catch (err) {
    console.error(err);
    setError('Failed to create publishing data');
  }
};

// Update publishing information
const updatePublishing = async () => {
  try {
    const formData = new FormData();
    formData.append('projectId', projectId);
    formData.append('projectType', projectType);
    formData.append('title', project.title);
    formData.append('shortTitle', project.shortTitle);
    formData.append('summary', project.summary);
    formData.append('genres', project.genres.join(','));
    formData.append('publishingType', 'Public');
    formData.append('audience', project.audience);

    // Append the cover picture file if selected
    if (coverPicture) {
      formData.append('coverPicture', coverPicture);
    }

    await axios.put(`/api/publishing/create/${projectId}`, formData, {
      headers: { 'x-auth-token': localStorage.getItem('token') },
    });
    alert('Publishing project updated successfully');
    navigate(`/projects/${projectId}`);
  } catch (err) {
    console.error(err);
    setError('Failed to update publishing data');
  }
};


  // Ensure user data is loaded before rendering
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="publishing-container">
    <Header/>
    <Sidebar projectId={projectId} />

      <div className="publishing-dashboard">
        {/* Project Preview Section */}
        <div className="publishing-project-preview-container">
          <div className="publishing-project">
            {chapters.length > 0 ? (
              chapters.map((chapter) => (
                <div key={chapter._id} id={`chapter-${chapter._id}`} className="ReadStoryProject-chapter" style={{display:"flex",flexDirection:"column"}}>
                  <h2 className="ReadStoryProject-chapter-title">
                    Chapter {chapter.number}: {chapter.title}
                  </h2>
                  <div
                    className="ReadStoryProject-chapter-content"
                    dangerouslySetInnerHTML={{ __html: chapter.content }}
                  />
                </div>
              ))
            ) : (
              <div>No chapters available</div>
            )}
            
          </div>
        </div>

        {/* Publishing Form Section */}
        <div className="publishing-project-description">
          <div className="publishing-publishing-heading">Publishing</div>
          <div className="publishing-project-title">
            <h2>Project Title</h2>
            <input
              type="text"
              placeholder="Enter Project Title..."
              className="publishing-input"
              value={project ? project.title : ''}
              onChange={(e) =>
                setProject({ ...project, title: e.target.value })
              }
            />
          </div>
          <div className="publishing-project-short-title">
            <h3>Short Title</h3>
            <input
              type="text"
              placeholder="Enter Short Title"
              className="publishing-input"
              value={project ? project.shortTitle : ''}
              onChange={(e) =>
                setProject({ ...project, shortTitle: e.target.value })
              }
            />
          </div>
          <div style={{display:"flex",flexDirection:"row",gap:"20%"}}>
          <div className="publishing-project-audience">
            <h4>Who This Book Is For</h4>
            <textarea
              placeholder="Enter Audience Details"
              className="publishing-textarea"
              value={project ? project.audience : ''}
              onChange={(e) =>
                setProject({ ...project, audience: e.target.value })
              }
            />
          </div>
          
          <div className="publishing-project-genre">
            <h4>Genre</h4>
            <input
              type="text"
              placeholder="Enter Genre (comma-separated)"
              className="publishing-input"
              value={project ? project.genres.join(', ') : ''}
              onChange={(e) => {
                const genres = e.target.value.split(',').map((genre) => genre.trim());
                setProject((prevProject) => ({
                  ...prevProject,
                  genres: genres,
                }));
              }}
            />
          </div>
          </div>
          <div className="publishing-project-summary">
            <h4>Summary</h4>
            <textarea
              placeholder="Enter Project Summary"
              className="publishing-textarea"
              value={project ? project.summary : ''}
              onChange={(e) =>
                setProject({ ...project, summary: e.target.value })
              }
            />
          </div>
          
         
          <div className="publishing-project-cover">
            <h4>Cover Picture</h4>
            <input
              type="file"
              accept="image/*"
              className="publishing-input-file"
              onChange={handleCoverPictureChange}
            />
           
          </div>
          <div className="publishing-publish-button" onClick={createPublishing}>
            {'Publish'}
          </div>
        </div>
        <div style={{display:"flex", flexDirection:"column"}}>
        <div style={{fontFamily:"sans-serif", fontSize:"20px", fontWeight:"500"}}> Cover Photo Preview</div>
        {(
              <div className="cover-picture-preview">
                <img 
                  src={coverPicture ? (typeof coverPicture === 'string' ? `http://localhost:5001/uploads/${coverPicture}` : URL.createObjectURL(coverPicture)) : ""}
                  alt="Cover" 
                  className="cover-picture-image" 
                />
              </div>
            ) }
        </div>

        {/* Collaborators Section */}
        <div className="publishing-left-sidepanel" style={{marginTop:"19%", marginRight:"8%"}}>
          <div className="publishing-left-sidepanel-title">Collaborators</div>
          <div className="publishing-project-collaborators">
            {project &&
              project.collaborators?.map((collaborator) => (
                <div className="publishing-collaborator-container" key={collaborator.id}>
                  <div className="publishing-collaborator-image">
                    <img
                      src={collaborator.image || profileIcon}
                      alt="publishing-profile"
                      className="publishing-collaborator-icon"
                    />
                  </div>
                  <div className="publishing-collaborator-text">
                    {collaborator.email}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Publishing;
