// src/components/Settings.js

import React, { useEffect, useState } from "react";
import './settings.css';
import profileIcon from '../Images/generic-user-profile-picture.png';
import AccountInfo from './account-info';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logoIcon from '../Images/Logo-V.png';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SecurityIcon from '@mui/icons-material/Security';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from "@mui/icons-material/Logout";
import Header from '../Header/header';



function Settings(){

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
                // Optionally, navigate to login on auth failure
                if (err.response && err.response.status === 401) {
                    navigate('/login');
                }
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleHomepageClick = () => {
        navigate('/Homepage');
    };

    const handleProjectsClick = () => {
        navigate('/Saved');
    };

    const handleFavoriteClick = () => {
        navigate('/Favorite'); 
    };

    const handleNotificationClick = () => {
        navigate('/Notification');
    };

    const handleSettingClick = () => {
        navigate('/Setting');
    };

    const handleProfileClick = () => {
        navigate('/Profile');
    };

    const handleLogoutClick = () => {
        localStorage.removeItem('token'); // Remove token
        navigate('/Login');
    };

    const handleChatbotClick = () => {
        navigate('/Chatbot');
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }


  // Function to handle smooth scrolling
  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };


    return(
        <div className="setting-container">
           <Header/>

      

                <div className="setting-sidepanel">
    <Stack direction="column" spacing={4}> {/* Increased spacing */}
        <Button 
            style={{
                color: '#7a7a7a', // Default gray color
                fontSize: '16px', // Increased text size
                border: 'none',
                textTransform: 'none',
                marginTop: '20px', // Added margin from the top
                transition: 'color 0.3s', // Smooth transition for text color
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.color = 'orange'; // Change text color on hover
                e.currentTarget.querySelector('svg').style.color = 'orange'; // Change icon color on hover
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.color = '#7a7a7a'; // Reset text color
                e.currentTarget.querySelector('svg').style.color = '#7a7a7a'; // Reset icon color
            }}
            startIcon={<AccountCircleIcon style={{ color: '#7a7a7a', fontSize: '20px' }} />}
            onClick={() => scrollToSection('profile-settings')}
        >
            Profile Settings
        </Button>
        <Button
            style={{
                color: '#7a7a7a',
                fontSize: '16px',
                border: 'none',
                textTransform: 'none',
                transition: 'color 0.3s',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.color = 'orange';
                e.currentTarget.querySelector('svg').style.color = 'orange';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.color = '#7a7a7a';
                e.currentTarget.querySelector('svg').style.color = '#7a7a7a';
            }}
            startIcon={<SecurityIcon style={{ color: '#7a7a7a', fontSize: '20px' }} />}
            onClick={() => scrollToSection('login-security')}
        >
            Login and Security
        </Button>
        <Button
            style={{
                color: '#7a7a7a',
                fontSize: '16px',
                border: 'none',
                textTransform: 'none',
                transition: 'color 0.3s',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.color = 'orange';
                e.currentTarget.querySelector('svg').style.color = 'orange';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.color = '#7a7a7a';
                e.currentTarget.querySelector('svg').style.color = '#7a7a7a';
            }}
            startIcon={<NotificationsIcon style={{ color: '#7a7a7a', fontSize: '20px' }} />}
            onClick={() => scrollToSection('notifications')}
        >
            Notifications
        </Button>
        <Button
            style={{
                color: '#7a7a7a',
                fontSize: '16px',
                border: 'none',
                textTransform: 'none',
                transition: 'color 0.3s',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.color = 'orange';
                e.currentTarget.querySelector('svg').style.color = 'orange';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.color = '#7a7a7a';
                e.currentTarget.querySelector('svg').style.color = '#7a7a7a';
            }}
            startIcon={<SettingsIcon style={{ color: '#7a7a7a', fontSize: '20px' }} />}
            onClick={() => scrollToSection('account-settings')}
        >
            Account Settings
        </Button>
        <Button
            style={{
                color: '#7a7a7a',
                fontSize: '16px',
                border: 'none',
                textTransform: 'none',
                marginBottom: '20px',
                transition: 'color 0.3s',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.color = 'orange';
                e.currentTarget.querySelector('svg').style.color = 'orange';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.color = '#7a7a7a';
                e.currentTarget.querySelector('svg').style.color = '#7a7a7a';
            }}
            startIcon={<LogoutIcon style={{ color: '#7a7a7a', fontSize: '20px' }} />}
            onClick={handleLogoutClick}
        >
            Logout
        </Button>
    </Stack>
</div>


            <div className="setting-dashboard">
                <AccountInfo user={user} setUser={setUser} />
            </div>
        </div>

    );
    
}

export default Settings;
