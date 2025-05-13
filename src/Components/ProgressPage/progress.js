import React, { useEffect, useState , useRef } from "react";
import './progress.css'; // Ensure the CSS is linked correctly
import {  useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import AddCollaborators from '../Storyboard/AddCollaborators'; // Import the AddCollaborators component
import { ToastContainer, toast } from 'react-toastify';
import menuAnimation from '../Images/menu-animation.json'; 
import Header from "../Header/header";
import Sidebar from "../Sidebar/sidebar";

const Progress = ()  => {

  const { projectId } = useParams(); // Assuming projectId refers to Story ID

  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isAddCollaboratorsOpen, setIsAddCollaboratorsOpen] = useState(false);


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
}, [navigate]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedWork, setSelectedWork] = useState("Work 1"); // State to keep track of selected work

 
  const handleProgressClick = () => {
    navigate(`/Progress/${projectId}`);

};
  const workTitles = [
    "Work 1: Novel Draft",
    "Work 2: Short Story Compilation",
    "Work 3: Blog Posts",
    "Work 4: Poetry Collection",
    "Work 5: Writing Challenge",
  ];

  const [isAnimationPlaying, setIsAnimationPlaying] = useState(false); // Track if animation is playing
  const animationRef = useRef(null); // Reference to the Lottie animation

  const toggleSidebar = () => {
  setIsSidebarOpen(!isSidebarOpen); // Toggle sidebar state

  // When the sidebar is toggled, toggle the animation play/pause
  if (!isAnimationPlaying) {
      setIsAnimationPlaying(true); // Start the animation
      animationRef.current.play(); // Play the full animation

      // After 0.5 seconds, stop the animation
      setTimeout(() => {
      setIsAnimationPlaying(false); // Pause the animation after 0.5s
      animationRef.current.stop(); // Stop the animation manually
      }, 1000); // 0.5 seconds = 500ms
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
    <div className="progress-container">
   <Header/>
    <Sidebar projectId={projectId} />


      

      <div className="progress-dashboard">
      <div className="left-side-panel">
            <h2>My Works</h2>
            <ul>
              {workTitles.map((title, index) => (
                <li 
                  key={index}
                  className={`work-title ${selectedWork === title ? 'selected' : ''}`} 
                  onClick={() => setSelectedWork(title)}
                >
                  {title}
                </li>
              ))}
            </ul>
          </div>
        

          <div className="progress-main-content">
            

            <div className="goal-setting">
                <h2>Set Your Goal</h2>
                <div className="goal-input">
                    <input type="text" placeholder="Enter your goal (e.g., Write 10,000 words)" />
                    <input type="date" placeholder="Deadline" />
                    <div className="progress-goal-btn-container">
                    <div className="progress-set-goal-btn">Set Goal</div>
                    <div className="progress-reset-goal-btn" >Reset Goal</div>
                    </div>
                </div>
            </div>

            <div className="current-progress">
                <h2>Current Progress</h2>
                <div className="progress-bar">
                    <div className="progress" style={{ width: '70%' }}></div>
                </div>
                <p>Words Written: <span>7000</span> / <span>10000</span></p>
                <p>Milestone: <span>70%</span> Reached</p>
            </div>

            <div className="writing-stats">
                <h2>Writing Stats</h2>
                <p>Average Daily Word Count: <span>500</span></p>
                <p>Best Writing Day: <span>Tuesday</span></p>
            </div>

            <div className="achievements">
                <h2>Achievements</h2>
                <p>[10,000 Words Badge]</p>
                <p>[Monthly Goal Achiever]</p>
            </div>

            <div className="inspirational-quotes">
                <h2>Inspirational Quotes</h2>
                <p>"The first draft is just you telling the story."</p>
            </div>

            <div className="journal-reflection">
                <h2>Journal/Reflection</h2>
                <textarea placeholder="Write your thoughts here..."></textarea>
            </div>

            <div className="writing-schedule">
                <h2>Writing Schedule</h2>
                <ul>
                    <li>Mon: 2 hours</li>
                    <li>Wed: 1 hour</li>
                    <li>Fri: 3 hours</li>
                </ul>
            </div>
        </div>
        </div>

 {/* Add Collaborators Modal */}
 <AddCollaborators 
                isOpen={isAddCollaboratorsOpen} 
                onClose={() => setIsAddCollaboratorsOpen(false)} 
                projectId={projectId} 
            />

            {/* Toast Notifications */}
            <ToastContainer />

    </div>
  );
};

export default Progress;
