
import { useNavigate } from 'react-router-dom';
import './sidebar.css';
import React, { useState,useEffect} from 'react';
import 'react-quill/dist/quill.snow.css';
import plotIcon from '../Images/Plot.png';
import characterIcon from '../Images/Character.png';
import publishIcon from '../Images/Published.png';
import goalIcon from '../Images/goal.png';
import plusIcon from "../Images/Plus.png";
import comIcon from "../Images/comm.png";
import 'react-toastify/dist/ReactToastify.css';
import  {  useRef } from 'react';
import Lottie from 'react-lottie';
import menuAnimation from '../Images/menu-animation.json'; 
import bookIcon from '../Images/create-item-book.png';
import { ToastContainer,  toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import AddCollaborators from '../Storyboard/AddCollaborators'; // Import the AddCollaborators component
import axios from 'axios';
import editorIcon from '../Images/writing.png';

const Sidebar = ({ projectId }) => {

  


const [isAddCollaboratorsOpen, setIsAddCollaboratorsOpen] = useState(false);

// const { projectId } = useParams(); // Assuming projectId refers to Story ID
  const [projectType, setProjectType] = useState(null); // State to hold the project type

const navigate = useNavigate();
const [user, setUser] = useState(null);
  const [error, setError] = useState(null); // State to handle errors

// Fetch user data
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
      console.error('Failed to load user data', err);
    }
  };
  fetchUserData();
  const handleDetectProject = async () => {
    try {
      setError(null);
      const response = await axios.get(`/api/gettype/detect/${projectId}`);
      setProjectType(response.data.type); // assuming the response has 'type' as the project type
    } catch (err) {
      setError(err.response ? err.response.data.message : 'An unexpected error occurred');
    }
  };
  handleDetectProject();
}, [navigate]);





const handlePlotClick = () => {
      
  navigate(`/Plot/${projectId}`);
};

const handleCharacterClick = () => {
 navigate(`/Character/${projectId}`);
};



const handleAddCollaborator = () => {
  if (!projectId) {
      toast.warn("No project selected.");
      return;
  }
  setIsAddCollaboratorsOpen(true);
};

const handlePublishClick = () => {
  navigate(`/Publishing/${projectId}`);

};
const handleProgressClick = () => {
navigate(`/Progress/${projectId}`);

};
const handleManageStoryProjectClick = () => {

console.log("projectType:",projectType);
  
if (projectType === 'Story') {

  navigate(`/ManageStoryProject/${projectId}`);
  }else if (projectType === 'Novel') {

  navigate(`/ManageNovelProject/${projectId}`);
  }else if (projectType === 'Urdu') {

  navigate(`/ManageUrduProject/${projectId}`);
  }

};


const handleItemClick = () => {
  console.log("projectType:",projectType);
  if (projectType === 'Story') {
    navigate(`/Storyboard/${projectId}`);
  } else if (projectType === 'Novel') {
    navigate(`/Novelboard/${projectId}`);
  } else if (projectType === 'Urdu') {
    navigate(`/Urduboard/${projectId}`);
  }
};

const [isSidebarOpen, setIsSidebarOpen] = useState(false);
const [isAnimationPlaying, setIsAnimationPlaying] = useState(false); // Track if animation is playing
const animationRef = useRef(null); // Reference to the Lottie animation

const toggleSidebar = () => {
  // Toggle sidebar state
  setIsSidebarOpen((prev) => !prev);

  // Ensure animationRef.current is not null before using it
  if (!animationRef.current) return;

  if (isAnimationPlaying) {
    // Stop the animation immediately if already playing
    animationRef.current.stop();
    setIsAnimationPlaying(false);
  } else {
    // Start and play the animation
    animationRef.current.play();
    setIsAnimationPlaying(true);

    // Pause the animation after 1 second
    setTimeout(() => {
      if (animationRef.current) { // Check again before stopping
        animationRef.current.stop();
        setIsAnimationPlaying(false);
      }
    }, 1000);
  }
};


const lottieOptions = {
loop: false, // We don't want it to loop
autoplay: false, // Don't autoplay the animation
animationData: menuAnimation, // Path to the Lottie JSON animation data
rendererSettings: {
  preserveAspectRatio: 'xMidYMid slice',
},
};
    

    return (

<div className={`storyboard-sidebar ${isSidebarOpen ? 'open' : ''}`} id="sidebar">
      <div
          id="sidebarToggle"
          className="storyboard-sidebar-toggle"
          onClick={toggleSidebar}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <Lottie
            options={lottieOptions}
            height={30}
            width={30}
            isStopped={!isAnimationPlaying} // Pause if animation is not playing
            isClickToPauseDisabled={true} // Disable default click-to-pause behavior
            ref={animationRef} // Add the reference to control the animation
          />
        </div>


        
        <div className='storyboard-journal'>
          <img src={plotIcon} alt="journal" className="storyboard-journal-icon"  />
          Plot
          <img src={plusIcon} alt="noveldashboard-add-plot" className="noveldashboard-Add-plot-icon" onClick={handlePlotClick}/>
        </div>
        <div className='storyboard-notifications' >
          <img src={characterIcon} alt="notifications" className="storyboard-noti-icon" />
          Character
          <img src={plusIcon} alt="noveldashboard-add-character" className="noveldashboard-Add-character-icon" onClick={handleCharacterClick}/>
        </div>
        <div className='storyboard-notifications'>
                    <img src={comIcon} alt="Collaborators" className="storyboard-noti-icon" />
                    Collaborators
                    <img src={plusIcon} alt="Add Collaborator" className="noveldashboard-Add-collaborator-icon" onClick={handleAddCollaborator} />
                </div>

        <div className='storyboard-goals' onClick={handlePublishClick}>
          <img src={publishIcon} alt="goals" className="storyboard-goal-icon" />
          Publishing
        </div>
        <div className='storyboard-favorites' onClick={handleProgressClick}>
          <img src={goalIcon} alt="favorites" className="storyboard-fav-icon" />
          Progress
        </div>
        <div className='storyboard-favorites' onClick={handleItemClick}>
          <img src={editorIcon} alt="favorites" className="storyboard-fav-icon" />
          Editor 
        </div>
        <div className='storyboard-favorites' onClick={handleManageStoryProjectClick}>
          <img src={bookIcon} alt="favorites" className="storyboard-fav-icon" />
          Manage
        </div>


        
        <AddCollaborators 
                isOpen={isAddCollaboratorsOpen} 
                onClose={() => setIsAddCollaboratorsOpen(false)} 
                projectId={projectId} 
            />
            <ToastContainer />
        
      </div> 


);
};

export default Sidebar;