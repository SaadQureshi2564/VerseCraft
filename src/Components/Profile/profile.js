import React, { useEffect, useState } from "react";
import './profile.css'; // Ensure the CSS is linked correctly
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import profileIcon from '../Images/generic-user-profile-picture.png';
import userbackground from '../Images/user-background-image.png';
import image01 from "../Images/image01.webp";
import image02 from "../Images/image02.webp";
import image03 from "../Images/image03.webp";
import image04 from "../Images/image04.webp";
import logoIcon from '../Images/Logo-V.png';
import Header from '../Header/header';


const Profile = () => {
  const navigate = useNavigate();

  // State variables for user data
  const [user, setUser] = useState(null); // User object
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get the token from localStorage
        const token = localStorage.getItem('token');

        // If no token is found, redirect to login page
        if (!token) {
          navigate('/login');
          return;
        }

        // Make a GET request to fetch user data
        const response = await axios.get('http://localhost:5001/api/users/profile', {
          headers: {
            'x-auth-token': token,
          },
        });

        // Update state with user data
        setUser(response.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to load user data');
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);


 // Fetch user data on component mount
 useEffect(() => {
  const fetchUserData = async () => {
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token');

      // If no token is found, redirect to login page
      if (!token) {
        navigate('/login');
        return;
      }

      // Make a GET request to fetch user data
      const response = await axios.get('http://localhost:5001/api/users/profile', {
        headers: {
          'x-auth-token': token,
        },
      });

      // Update state with user data
      setUser(response.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to load user data');
      setLoading(false);
    }
  };

  fetchUserData();
}, [navigate]);

  // Navigation functions
  const handleHomepageClick = () => navigate('/Homepage');
  const handleProjectsClick = () => navigate('/Saved');
  const handleFavoriteClick = () => navigate('/Favorite');
  const handleChatbotClick = () => navigate('/Chatbot');
  const handleNotificationClick = () => navigate('/Notification');
  const handleSettingClick = () => navigate('/Setting');
  const handleProfileClick = () => navigate('/Profile');


  // Array of published works
  const publishedWorks = [
    { image: image01, title: 'The Enchanted Forest', summary: 'A journey through the magical forest filled with wonder.', rating: 4.5 },
    { image: image02, title: 'Mysteries of the Deep Sea', summary: 'Exploring the secrets of the deep blue ocean.', rating: 4.8 },
    { image: image03, title: 'Galactic Adventures', summary: 'An interstellar quest across galaxies and beyond.', rating: 4.2 },
    { image: image04, title: 'Tokyo Undone', summary: 'Jump into the cyberpunk universe of creation', rating: 4.2 },
  ];

  // Handle loading and error states
  if (loading) {
    return <div className="profile-container">Loading...</div>;
  }

  if (error) {
    return <div className="profile-container">{error}</div>;
  }

  return (
    <div className="profile-container">
      <Header/>

       {/* Background image */}
       <div className="profile-background-image">
          <img src={userbackground} alt="userback" className="user-background-image" />
        </div>


      <div className="profile-dashboard">


       

        <div className="profile-user-info-sidepanal">
          Profile
          {/* Profile image */}
          <div className="profile-user-image">
          <img
          src={`http://localhost:5001/${user.profileImage}`} // Display the user's profile image
          alt="user"
          className="user-image"
          />
          </div>

          {/* Biography */}
          <div className="profile-bio"> Bio
           
              <p className="profile-bio-description">{user.description}</p>
              <div>_______________________________</div>
          </div>

          <div className="profile-interests">
            Interests
            <div className="profile-interest-items-container">
              <div className="profile-interest-items">gaming</div>
              <div className="profile-interest-items">tennis</div>
              <div className="profile-interest-items">reading</div>
            </div>


          </div>
          <div>_______________________________</div>

          <div className="profile-contact-details">
            Contact
            <div className="profile-contact-phone">+92 3156292460</div>
            <div className="profile-contact-email">messi@gmail.com</div>
          </div>

          <div>_______________________________</div>

          <div className="profile-socials">Socials</div>
            <div className="profile-socials-container">
            <div className="profile--instagram">
            
            </div>
            <div className="profile-facebook">
              
            </div>
            <div className="profile-twitter">
              
            </div>
            <div className="profile-linkedin">
              {/* You'll need to add a fifth image or use a different icon */}
            
            </div>
          </div>

          <div className="profile-statistics">
            <div className="profile-statistics-works"></div>
            <div classname="profile-statistics-collabs"></div>
            <div className="profile-statistics-user-rating"></div>
          </div>

        </div>


        

     

        

      

        

       
       
        {/* Published Works within Dashboard */}
        <div className="profile-published-works-container">
          {publishedWorks.map((work, index) => (
            <div className="profile-published-work-items" key={index}>
              <div
                className="profile-published-work-image"
                style={{ backgroundImage: `url(${work.image})` }}
              ></div>
              <div className="profile-published-work-title">{work.title}</div>
              <div className="profile-published-work-summary">{work.summary}</div>
              <div className="profile-published-work-rating">Rating: {work.rating} ⭐</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};



export default Profile;
