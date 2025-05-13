import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import './homepage.css'; 
import featuredImage1 from '../Images/rectangle_92.png'; 
import featuredImage2 from '../Images/rectangle_92.png'; 
import featuredImage3 from '../Images/rectangle_92.png'; 
import createIcon from "../Images/create-item.png";
import Header from '../Header/header';
import Footer from '../footer/footer';
import profileIcon from '../Images/generic-user-profile-picture.png';
import coverpic from '../Images/cover01.jpg'
import ad from '../Images/ad01.png';
import ad02 from '../Images/ad02.png';
import axios from 'axios'; // Ensure axios is imported
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
} from '@mui/material';

import { IconButton } from "@mui/material";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import challengeImage from "../Images/challenge.png";
import coverPhoto01 from "../Images/cover-photo-1.png";
import coverPhoto02 from "../Images/cover-photo-2.png";
import coverPhoto03 from "../Images/cover-photo-3.png";
import coverPhoto04 from "../Images/cover-photo-4.png";




const Homepage = () => {

  const [currentIndex, setCurrentIndex] = useState(0);
  const [animationPaused, setAnimationPaused] = useState(false);
  const [animationClass, setAnimationClass] = useState('sliding-in');
  const [user, setUser] = useState(null); // Store the logged-in user data
  const [error, setError] = useState(null); // Track error state
  const navigate = useNavigate();
  //const [projectType, setProjectType] = useState('Storyboard'); // Default to Storyboard
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]); // State to hold user projects
  const [Collabprojects, setCollabProjects] = useState([]); // State to hold user projects
  const [projectCovers, setProjectCovers] = useState({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState('Storyboard'); // Default to Storyboard

 // Combine fetch functions into one for efficiency
 const fetchProjects = async (email) => {
  try {
    const [storiesResponse, novelsResponse, urduResponse, collabStories, collabNovels, collabUrdu] = await Promise.all([
      axios.get(`http://localhost:5001/api/stories/user/${email}`),
      axios.get(`http://localhost:5001/api/novels/user/${email}`),
      axios.get(`http://localhost:5001/api/urdu/user/${email}`),
      axios.get(`http://localhost:5001/api/stories/collaborator/${email}`), // Collab stories
      axios.get(`http://localhost:5001/api/novels/collaborator/${email}`), // Collab novels
      axios.get(`http://localhost:5001/api/urdu/collaborator/${email}`) // Collab urdu

    ]);

    const combinedProjects = [
      ...storiesResponse.data.map(project => ({ ...project, projectType: 'Storyboard' })),
      ...novelsResponse.data.map(project => ({ ...project, projectType: 'Novelboard' })),
      ...urduResponse.data.map(project => ({ ...project, projectType: 'Urduboard' })),
    ];

    const combinedCollabProjects = [
      ...collabStories.data.map(project => ({ ...project, projectType: 'Storyboard' })),
      ...collabNovels.data.map(project => ({ ...project, projectType: 'Novelboard' })),
      ...collabUrdu.data.map(project => ({ ...project, projectType: 'Urduboard' })),
    ];

    setProjects(combinedProjects);
    setCollabProjects(combinedCollabProjects);

  } catch (err) {
    console.error('Failed to load projects:', err);
  }
};

const getProjectTypeSymbol = (projectType) => {
  switch (projectType) {
    case "Storyboard":
      return "S";
    case "Novelboard":
      return "N";
    case "Urduboard":
      return "U";
    default:
      return "";
  }
};
  
  const itemRef = useRef(null);
  const [itemWidth, setItemWidth] = useState(300); // Default width per item

  // Calculate item width on mount
  useEffect(() => {
      if (itemRef.current) {
          setItemWidth(itemRef.current.offsetWidth); // Get the real width of an item
      }
  }, []);

  const myProjectsRef = useRef(null);
const collabProjectsRef = useRef(null);

const scrollLeft = (ref) => {
    if (ref.current) {
        ref.current.scrollBy({
            left: -itemWidth * 3, // Move by 3 items
            behavior: "smooth"
        });
    }
};

const scrollRight = (ref) => {
    if (ref.current) {
        ref.current.scrollBy({
            left: itemWidth * 3, // Move by 3 items
            behavior: "smooth"
        });
    }
};


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
      // if(user.fullname =='admin'){
      //   navigate('Admin');
      // }
      
      fetchUserProjects(response.data.email); // Fetch user projects
      fetchUserCollabProjects(response.data.email); // Fetch user projects

    } catch (err) {
      console.error(err);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  

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
      // Fetch stories, novels, and Urdu projects where the user is a collaborator
      const [storiesResponse, novelsResponse, urduResponse] = await Promise.all([
        axios.get(`http://localhost:5001/api/stories/collaborator/${email}`),
        axios.get(`http://localhost:5001/api/novels/collaborator/${email}`),
        axios.get(`http://localhost:5001/api/urdu/collaborator/${email}`)
      ]);
  
      // Combine the projects, adding a projectType to distinguish them
      const combinedCollabProjects = [
        ...storiesResponse.data.map(project => ({ ...project, projectType: 'Storyboard' })),
        ...novelsResponse.data.map(project => ({ ...project, projectType: 'Novelboard' })),
        ...urduResponse.data.map(project => ({ ...project, projectType: 'Urduboard' }))
      ];
  
      // Update state with the merged list
      setCollabProjects(combinedCollabProjects);
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  };
  


  fetchUserData();
}, [navigate]);

const handleItemClick = (projectId, projectType) => {
  if (projectType === 'Storyboard') {
    navigate(`/Storyboard/${projectId}`);
  } else if (projectType === 'Novelboard') {
    navigate(`/Novelboard/${projectId}`);
  } else if (projectType === 'Urduboard') {
    navigate(`/Urduboard/${projectId}`);
  }
};


  const handleVersionClick = () => {
    navigate('/Saved'); 
  };

 

  const featuredWorks = [
    {
      id: 1,
      title: "Tale of Two: Beginning",
      genre: "Fiction",
      rating: "★★★★☆",
      pages: 350,
      author: "John Doe",
      coverImage: coverpic,
      summary: "A thrilling tale of mystery and adventure, following a detective solving a complex case.",
      longSummary: "In a world of intrigue, Detective Alex must navigate through lies and deception to uncover a hidden truth that could change everything.",
    },
    {
      id: 2,
      title: "The Pharaoh’s Plague",
      genre: "Fiction",
      rating: "★★★★☆",
      pages: 420,
      author: "Sarah King",
      coverImage: coverpic,
      summary: "A historical novel exploring the mysteries of ancient Egypt.",
      longSummary: "A gripping journey through the pyramids and tombs, unraveling a lost civilization's greatest secrets.",
    },
    {
      id: 3,
      title: "Pulp Fiction",
      genre: "Crime",
      rating: "★★★★★",
      pages: 290,
      author: "Quentin Blake",
      coverImage: coverpic,
      summary: "A stylish crime drama filled with twists and turns.",
      longSummary: "A web of criminals, hitmen, and a mysterious briefcase makes this a thrilling ride from start to finish.",
    },
    {
      id: 4,
      title: "Alexandria - The Legacy",
      genre: "Non-fiction",
      rating: "★★★☆☆",
      pages: 310,
      author: "Emily Carter",
      coverImage:coverpic,
      summary: "A deep dive into the cultural and historical significance of the Library of Alexandria.",
      longSummary: "Exploring one of the greatest intellectual centers of the ancient world and its enduring impact on modern knowledge.",
    }
  ];
  

  

  

  // Effect to handle automatic slide changing
  useEffect(() => {
    const interval = setInterval(() => {
      if (!animationPaused) { // Only change index if animation is not paused
        setCurrentIndex((prevIndex) => (prevIndex + 1) % featuredWorks.length);
      }
    }, 2000); // Change slide every second

    return () => clearInterval(interval);
  }, [featuredWorks.length, animationPaused]); // Dependency on animationPaused

  // Start the animation when the page loads
  useEffect(() => {
    const itemsContainer = document.querySelector('.homepage-features-works-items');
    itemsContainer.classList.add(animationClass); // Use state to manage the animation class

    const intervalId = setInterval(() => {
      if (itemsContainer) {
        itemsContainer.classList.remove(animationClass); // Remove the sliding-in class
        void itemsContainer.offsetHeight; // Trigger reflow
        itemsContainer.classList.add(animationClass); // Add it back to trigger animation
      }
    }, 30000); // Duration of the slide animation

    return () => clearInterval(intervalId);
  }, [animationClass]);

  // Handler for clicking on a work item
  const handleWorkItemClick = () => {
    setAnimationPaused(true); // Pause animation
    setAnimationClass(''); // Remove the sliding-in class

    // Restart animation after 5 seconds
    setTimeout(() => {
      setAnimationPaused(false); // Resume animation
      setAnimationClass('sliding-in'); // Reapply animation class
    }, 5000);
  };


  const [hoveredWork, setHoveredWork] = useState(null);
const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });

const handlefeatureMouseEnter = (e, work) => {
  const target = e?.currentTarget;
  if (!target) return; // Ensure target exists

  const rect = target.getBoundingClientRect();
  setHoveredWork(work);
  setModalPosition({
    top: rect.top + window.scrollY -50,
    left: rect.left + window.scrollX+300,
    width: rect.width,
  });
};



const handlefeatureMouseLeave = () => {
  setHoveredWork(null);
};






    // Initial list of tasks as an array of objects
  const [tasks, setTasks] = useState([
    
  ]);

  const [newTask, setNewTask] = useState('');

  // Function to handle adding new tasks
  const handleAddTask = () => {
    if (newTask.trim() === '') return; // Prevent empty tasks
    const newTaskItem = {
      id: tasks.length + 1,
      text: newTask,
      completed: false,
    };
    setTasks([...tasks, newTaskItem]); // Add the new task to the array
    setNewTask(''); // Clear input field
  };

  const handleTaskCompletion = (taskId) => {
    // Filter out the completed task
    setTasks(tasks.filter((task) => task.id !== taskId));
  };
  



  const handleCreateNewClick = () => {
    setIsModalOpen(true); // Open the modal when "Create New" is clicked
  };

  const handleModalClose = () => {
    setIsModalOpen(false); // Close the modal
  };

  // Function to handle project creation submission
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!projectName) {
      alert('Please provide a project name.');
      return;
    }
  
    try {
      const token = localStorage.getItem('token');
  
      const newProject = {
        title: projectName,
        projectType: projectType,
        author: {
          name: user?.fullname || user.fullname,
          email: user?.email || user.email,
        },
        description: 'A new project created by the user.',
        genres: ['Adventure'], // Example genre
        collaborators: [], // Optionally add collaborators later
      };
  
      // Determine the endpoint based on projectType
      let endpoint = '';
      if (projectType === 'Storyboard') {
        endpoint = 'http://localhost:5001/api/stories';
      } else if (projectType === 'Novelboard') {
        endpoint = 'http://localhost:5001/api/novels';
      } else if (projectType === 'Urduboard') {
        endpoint = 'http://localhost:5001/api/urdu';
      } else {
        alert('Invalid project type selected.');
        return;
      }
  
      const response = await axios.post(endpoint, newProject, {
        headers: { 'x-auth-token': token },
      });
  


      alert('Project created successfully!');
      setIsModalOpen(false); // Close the modal after creation
      fetchProjects(user.email); // Refresh
      navigate('/Homepage'); // Redirect to projects page
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project');
    }
  };

  const images = [
    ad ,ad02,ad ,ad02,ad
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Auto-slide every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const prevImage = () => {
    setIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const nextImage = () => {
    setIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const coverPhotos = [coverPhoto01, coverPhoto02, coverPhoto03, coverPhoto04];

  useEffect(() => {
    // Assign a random cover to each project only if it doesn't have one already
    const newProjectCovers = {};
    projects.forEach((project) => {
      if (!projectCovers[project._id]) {
        newProjectCovers[project._id] =
          coverPhotos[Math.floor(Math.random() * coverPhotos.length)];
      }
    });
    setProjectCovers((prev) => ({ ...prev, ...newProjectCovers }));
  }, [projects]); // Runs when projects change

  useEffect(() => {
    // Assign a random cover to each project only if it doesn't have one already
    const newProjectCovers = {};
    Collabprojects.forEach((project) => {
      if (!projectCovers[project._id]) {
        newProjectCovers[project._id] =
          coverPhotos[Math.floor(Math.random() * coverPhotos.length)];
      }
    });
    setProjectCovers((prev) => ({ ...prev, ...newProjectCovers }));
  }, [Collabprojects]); // Runs when Collabprojects change

  

  return (

    <div className="homepage-container">

      <Header />


      {/* Dashboard Html code*/}
      <div className="homepage-dashboard">

        <div className="homepage-row-one">

       

        <div className="homepage-welcome-section">
          
          <div style={{display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
            <div className="homepage-welcome-text">Welcome back, {user ? user.fullname : 'Guest'}</div>
            {/*Homepage create a new work*/}
            <div className="hompage-create-new-work-container">
              <div className="homepage-new-project">
                <button
                  className="homepagecreate-new-work-button"
                  onClick={handleCreateNewClick}
                >
                  <img src={createIcon} alt="Create New Item" className="create-icon" />
                  Create Manuscript
                </button>
              </div>
                {/* Modal */}
                <Dialog open={isModalOpen} onClose={handleModalClose} fullWidth maxWidth="sm">
                  <DialogTitle>Create New Project</DialogTitle>
                    <form onSubmit={handleSubmit}>
                      <DialogContent>
                        <Box mb={2}>
                          <TextField
                            label="Name your project"
                            variant="outlined"
                            fullWidth
                            id="projectName"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            required
                          />
                        </Box>
                        <Box mb={2}>
                          <FormControl variant="outlined" fullWidth required>
                            <InputLabel id="projectType-label">Project Type</InputLabel>
                            <Select
                              labelId="projectType-label"
                              id="projectType"
                              value={projectType}
                              onChange={(e) => setProjectType(e.target.value)}
                              label="Project Type"
                            >
                              <MenuItem value="">
                                <em>Select Project Type</em>
                              </MenuItem>
                              <MenuItem value="Novelboard">Novelboard</MenuItem>
                              <MenuItem value="Storyboard">Storyboard</MenuItem>
                              <MenuItem value="Urduboard">Urduboard</MenuItem>
                              
                            </Select>
                          </FormControl>
                        </Box>
                      </DialogContent>
                      <DialogActions>
                        <Button type="submit" variant="contained" color="primary">
                          Create Project
                        </Button>
                        <Button onClick={handleModalClose} variant="outlined" color="secondary">
                          Cancel
                        </Button>
                    </DialogActions>
                  </form>
                </Dialog>
            </div>
          </div>
        </div>

      
        <div className="carousel-container">
      {/* Image Wrapper */}
      <div className="carousel-track" style={{ transform: `translateX(-${index * 100}%)` }}>
        {images.map((img, i) => (
          <img key={i} src={img} alt={`Slide ${i + 1}`} className="carousel-image" />
        ))}
      </div>

      {/* Navigation Buttons */}
      <button className="carousel-button left" onClick={prevImage}>‹</button>
      <button className="carousel-button right" onClick={nextImage}>›</button>

      {/* Indicator Dots */}
      <div className="carousel-indicators">
        {images.map((_, i) => (
          <span
            key={i}
            className={`dot ${i === index ? "active" : ""}`}
            onClick={() => setIndex(i)}
          ></span>
        ))}
      </div>
    </div>
        

         
        </div>

       
       
       
        <div className="homepage-projects-container">
        
        <div className="homepage-recent-projects-title">Continue from where you left of</div>
        <div className="homepage-my-projects-recent">
          <div className="homepage-my-projects-add-project-text" onClick={handleVersionClick}>View All</div>
          <div style={{display:'flex', flexDirection:'row'}}>
          {projects.length > 4 && (
          <IconButton onClick={() => scrollLeft(myProjectsRef)}
          sx={{
              position: "absolute", // Ensure it stays in place
              left: 0, // Align with the left edge
              transform: "translateY(-50%)",
              backgroundColor: "white",
              mt: "6.5%",
              ml:"0.4%",
              zIndex: 100,
              color: "black",
              boxShadow: "0px 4px 10px rgba(24, 24, 26, 0.3)", // Increase opacity slightly
              "&:hover": {
                  backgroundColor: "rgba(234, 236, 240)",
              },
              "&::after": { // Creates a subtle overlay behind the button
                  content: '""',
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: "100%",
                  height: "100%",
                  background: "rgba(255, 255, 255, 0.6)", // Light white overlay
                  borderRadius: "50%",
                  zIndex: -1, // Place it behind the button
                  boxShadow: "0px 2px 6px rgba(24, 24, 26, 0.3)", // Persistent shadow
              },
              width: 50, 
              height: 50,
              borderRadius: "50%",
              transition: "all 0.3s ease-in-out"
          }}
      >
          <ArrowBackIos sx={{ fontSize: 30, color: "black", alignSelf: "center", ml: "30%" }} />
      </IconButton>
      
          )}

            <div
                className="homepage-my-projects-container"  ref={myProjectsRef}
            >
                {projects.length > 0 ? (
                    projects.map((project) => (
                        <div
                            key={project._id}
                            className="homepage-my-projects-item"
                           
                            onClick={() => handleItemClick(project._id, project.projectType)}
                            
                        >
                          <div className="homepage-my-project-item-detail-container">
                               {/* Cover Image Container */}
                              <div
                                style={{
                                  width: "35%",
                                  display: "flex",
                                  backgroundColor: "grey",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  position: "relative", // Needed for absolute positioning
                                  overflow: "hidden",
                                }}
                              >
                                {/* Cover Image */}
                                <img
                                  src={projectCovers[project._id]}
                                  alt="Cover"
                                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />

                                {/* Title & Author Overlay */}
                                <div
                                  style={{
                                    position: "absolute",
                                    width: "90%",
                                    textAlign: "center",
                                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                                    color: "white",
                                    padding: "5px",
                                    borderRadius: "5px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    overflow: "hidden",
                                    whiteSpace: "nowrap",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  <div style={{ fontSize: "14px", fontWeight: "bold" }}>
                                    {project.title || "Untitled Project"}
                                  </div>
                                  <div style={{ fontSize: "12px" }}>
                                    {user ? user.fullname : "Guest"}
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column' ,width:'65%' ,height:'100%'}}>
                                  <div className="homepage-my-project-item-detail-container-header">
                                    <div className="homepage-my-projects-item-name">
                                        {project.title || 'Untitled Project'} 
                                    </div>
                                    <div className="homepage-my-project-item-type">
                                      {getProjectTypeSymbol(project.projectType)}
                                    </div>
                                  </div>
                                  <div className="homepage-my-project-item-summary">No summary added yet</div>
                                <div className="homepage-my-project-item-author"> Auther: 
                                  <div className="homepage-my-project-item-auther-name"> {user ? user.fullname : 'Guest'}</div>
                                </div>
                              </div>
                          </div>

                          
                        </div>
                       
                    ))
                ) : (
                    <div className="homepage-no-own-projects-text-msg">No Projects Found 
                     
                    </div>
                    
                )}
            </div>
            {projects.length > 4 && (
            <IconButton onClick={() => scrollRight(myProjectsRef)} 
            sx={{
                position: "absolute",
                right: 0, // Align with the right edge
                transform: "translateY(-50%)",
                backgroundColor: "white",
                mr:"0.2%",
                mt: "6.5%",
                zIndex: 100,
                color: "black",
                boxShadow: "0px 4px 10px rgba(24, 24, 26, 0.3)", // Increased opacity slightly
                "&:hover": {
                    backgroundColor: "rgba(234, 236, 240)",
                },
                "&::after": { // Creates a subtle overlay behind the button
                    content: '""',
                    position: "absolute",
                    right: 0,
                    top: 0,
                    
                    width: "100%",
                    height: "100%",
                    background: "rgba(255, 255, 255, 0.6)", // Light white overlay
                    borderRadius: "50%",
                    zIndex: -1, // Place it behind the button
                    boxShadow: "0px 2px 6px rgba(24, 24, 26, 0.3)", // Persistent shadow
                },
                width: 50, 
                height: 50,
                borderRadius: "50%",
                transition: "all 0.3s ease-in-out"
            }}
        >
            <ArrowForwardIos sx={{ fontSize: 30, color: "black", alignSelf: "center", ml: "15%" }} />
        </IconButton>
        
            )}
            </div>
        </div>
        
        <div className="homepage-recent-projects-title" style={{marginBottom:'2%', marginTop:'1%'}}>Recent Collaborations</div>
        <div className="homepage-my-projects-collab">
        
          <div className="homepage-my-projects-view-collab" onClick={handleVersionClick}>View All</div>
          <div style={{display:'flex', flexDirection:'row'}}>
          {projects.length > 4 && (
          <IconButton onClick={() => scrollLeft(collabProjectsRef)}
          sx={{
              position: "absolute", // Ensure it stays in place
              left: 0, // Align with the left edge
              transform: "translateY(-50%)",
              backgroundColor: "white",
              mt: "6.5%",
              ml:"0.4%",
              zIndex: 100,
              color: "black",
              boxShadow: "0px 4px 10px rgba(24, 24, 26, 0.3)", // Increase opacity slightly
              "&:hover": {
                  backgroundColor: "rgba(234, 236, 240)",
              },
              "&::after": { // Creates a subtle overlay behind the button
                  content: '""',
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: "100%",
                  height: "100%",
                  background: "rgba(255, 255, 255, 0.6)", // Light white overlay
                  borderRadius: "50%",
                  zIndex: -1, // Place it behind the button
                  boxShadow: "0px 2px 6px rgba(24, 24, 26, 0.3)", // Persistent shadow
              },
              width: 50, 
              height: 50,
              borderRadius: "50%",
              transition: "all 0.3s ease-in-out"
          }}
      >
          <ArrowBackIos sx={{ fontSize: 30, color: "black", alignSelf: "center", ml: "30%" }} />
      </IconButton>
      
          )}
            <div
                className="homepage-my-projects-container" ref={collabProjectsRef}
               
            >
                {Collabprojects.length > 0 ? (
                    Collabprojects.map((project) => (
                        <div
                            key={project._id}
                            className="homepage-my-projects-item"
                            
                            onClick={() => handleItemClick(project._id, project.projectType)}
                        >
                           
                           <div className="homepage-my-project-item-detail-container">
                           {/* Cover Image Container */}
                              <div
                                style={{
                                  borderRight: "1px solid black",
                                  width: "35%",
                                  display: "flex",
                                  backgroundColor: "#FAF1E6",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  position: "relative", // Needed for absolute positioning
                                  overflow: "hidden",
                                }}
                              >
                                {/* Cover Image */}
                                <img
                                  src={projectCovers[project._id]}
                                  alt="Cover"
                                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />

                                {/* Title & Author Overlay */}
                                <div
                                  style={{
                                    position: "absolute",
                                    width: "90%",
                                    textAlign: "center",
                                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                                    color: "white",
                                    padding: "5px",
                                    borderRadius: "5px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    overflow: "hidden",
                                    whiteSpace: "nowrap",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  <div style={{ fontSize: "14px", fontWeight: "bold" }}>
                                    {project.title || "Untitled Project"}
                                  </div>
                                  <div style={{ fontSize: "12px" }}>
                                    {user ? user.fullname : "Guest"}
                                  </div>
                                </div>
                              </div>

                              <div style={{ display: 'flex', flexDirection: 'column' ,width:'65%' ,height:'100%'}}>
                                  <div className="homepage-my-project-item-detail-container-header">
                                    <div className="homepage-my-projects-item-name">
                                        {project.title || 'Untitled Project'} 
                                    </div>
                                    <div className="homepage-my-project-item-type">S</div>
                                  </div>
                                  <div className="homepage-my-project-item-summary">No summary added yet</div>
                                <div className="homepage-my-project-item-author"> Auther: 
                                  <div className="homepage-my-project-item-auther-name"> {user ? user.fullname : 'Guest'}</div>
                                </div>
                              </div>

                          </div>

                            
                        </div>
                    ))
                ) : (
                    <h1 className="homepage-no-collabs">No projects found</h1>
                )}
            </div>

            {projects.length > 4 && (
           <IconButton onClick={() => scrollRight(collabProjectsRef)}
            sx={{
                position: "absolute",
                right: 0, // Align with the right edge
                transform: "translateY(-50%)",
                backgroundColor: "white",
                mr:"0.2%",
                mt: "6.5%",
                zIndex: 100,
                color: "black",
                boxShadow: "0px 4px 10px rgba(24, 24, 26, 0.3)", // Increased opacity slightly
                "&:hover": {
                    backgroundColor: "rgba(234, 236, 240)",
                },
                "&::after": { // Creates a subtle overlay behind the button
                    content: '""',
                    position: "absolute",
                    right: 0,
                    top: 0,
                    
                    width: "100%",
                    height: "100%",
                    background: "rgba(255, 255, 255, 0.6)", // Light white overlay
                    borderRadius: "50%",
                    zIndex: -1, // Place it behind the button
                    boxShadow: "0px 2px 6px rgba(24, 24, 26, 0.3)", // Persistent shadow
                },
                width: 50, 
                height: 50,
                borderRadius: "50%",
                transition: "all 0.3s ease-in-out"
            }}
        >
            <ArrowForwardIos sx={{ fontSize: 30, color: "black", alignSelf: "center", ml: "15%" }} />
        </IconButton>
        
            )}
           </div>

           </div>








           
        <div className="homepage-featured-projects-title">Featured Works</div>
        <div className="homepage-featured-works-container"
         >
          <div className="homepage-featured-works">
            
            <div className="homepage-features-works-items">
            {featuredWorks.map((work, index) => (
              <div 
                key={index} 
                className="homepage-features-works-image-container"
                onMouseEnter={(e) => handlefeatureMouseEnter(e,work)}
                onMouseLeave={handlefeatureMouseLeave}
              >
                <div className="homepage-features-works-title">{work.title}</div>
                <div className="homepage-features-works-details">
                  <div className="homepage-features-works-genre">Genre: {work.genre}</div>
                  <div className="homepage-features-works-rating">Rating: {work.rating}</div>
                  <div className="homepage-features-works-pages">Pages: {work.pages}</div>
                </div>
                <div className="homepage-features-works-summary">{work.summary}</div>
              </div>
            ))}

              

          
        </div>
        </div>
        </div>

        <div className="homepage-featured-projects-title">Challenges & Writing Contests</div>
        <div className="homepage-challenges-container" style={{display:'flex', flexDirection:'row'}}>
          <div className="homepage-challenges-image">
          <img src={challengeImage} alt="Challenge Banner" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{display:'flex', flexDirection:'column', width:"50%"}}>
            <div className='homepage-challenges-heading'> VerseCraft Challenge No.1</div>
            <div className="homepage-challenges-description">Unleash your creativity in VerseCraft Challenge No.1! Craft a compelling story or poem based on a unique prompt. Compete with fellow writers, showcase your talent, and claim the top spot in this exciting literary challenge!</div>   
            <div className="homepage-challenge-start-button">Compete Now</div>
          </div>       

        </div>
        

        <div className="homepage-featured-projects-title">Trending & Popular Stories:</div>
        <div className="homepage-featured-works-container" style={{marginBottom:"100px" ,     background: "linear-gradient(to right, #9b00e8, #00c896, #1e90ff)"}}>
          <div className="homepage-featured-works">
            
            <div className="homepage-features-works-items">
              <div className="homepage-features-works-image-container">
                <div className="homepage-features-works-title">Starting Nexus</div>
                <div className="homepage-features-works-details">
                  <div className="homepage-features-works-genre">Genre: Fiction</div>
                  <div className="homepage-features-works-rating">Rating: ★★★★☆</div>
                  <div className="homepage-features-works-pages">Pages: 350</div>
                </div>
                <div className="homepage-features-works-summary">
                  A thrilling tale of mystery and adventure, following a detective solving a complex case.
                </div>
              </div>
              <div className="homepage-features-works-image-container">
                <div className="homepage-features-works-title">Trading Lives</div>
                <div className="homepage-features-works-details">
                  <div className="homepage-features-works-genre">Genre: Non-fiction</div>
                  <div className="homepage-features-works-rating">Rating: ★★★☆☆</div>
                  <div className="homepage-features-works-pages">Pages: 200</div>
                </div>
                <div className="homepage-features-works-summary">
                  An insightful exploration of history, focusing on the key events of the 20th century.
                </div>
              </div>
              <div className="homepage-features-works-image-container">
                <div className="homepage-features-works-title">Lionel Messi- The Goat</div>
                <div className="homepage-features-works-details">
                  <div className="homepage-features-works-genre">Genre: Non-fiction</div>
                  <div className="homepage-features-works-rating">Rating: ★★★☆☆</div>
                  <div className="homepage-features-works-pages">Pages: 200</div>
                </div>
                <div className="homepage-features-works-summary">
                  An insightful exploration of history, focusing on the key events of the 20th century.
                </div>
              </div>
              <div className="homepage-features-works-image-container">
                <div className="homepage-features-works-title">Beyond time</div>
                <div className="homepage-features-works-details">
                  <div className="homepage-features-works-genre">Genre: Non-fiction</div>
                  <div className="homepage-features-works-rating">Rating: ★★★☆☆</div>
                  <div className="homepage-features-works-pages">Pages: 200</div>
                </div>
                <div className="homepage-features-works-summary">
                  An insightful exploration of history, focusing on the key events of the 20th century.
                </div>
              </div>
            </div>
          </div>
        </div>
   </div>
      <Footer/>
      </div>
      {hoveredWork && (
                <div 
                  className="hover-modal" 
                  style={{ top: modalPosition.top, left: modalPosition.left }}
                >
                  <img src={hoveredWork.coverImage} alt={hoveredWork.title} className="hover-modal-image" style={{height:"100px"}}/>
                  <div className="hover-modal-content">
                    <h2>{hoveredWork.title}</h2>
                    <p><strong>Author:</strong> {hoveredWork.author}</p>
                    <p><strong>Rating:</strong> {hoveredWork.rating}</p>
                    <p><strong>Summary:</strong> {hoveredWork.longSummary}</p>
                  </div>
                </div>
              )}

    </div>
  );
};

export default Homepage;
