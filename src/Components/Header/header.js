// Header.js
import logoIcon from '../Images/Logo-V.png';
import profileIcon from '../Images/generic-user-profile-picture.png';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react'; 
import './header.css';
import axios from 'axios';
import { Menu, MenuItem, Fade } from '@mui/material';
import Grow from '@mui/material/Grow'; // Import Grow
import NotificationsIcon from '@mui/icons-material/Notifications';
import {
    TextField,
    Box,
  } from '@mui/material';
  import { Popover, Typography } from '@mui/material';




const Header = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null); 
    const [isMobile, setIsMobile] = useState(window.innerWidth < 480); 
    const [isOpen, setIsOpen] = useState(false); 
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(null); 
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
   

  
    


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


    const handleHomepageClick = () => {navigate('/Homepage');};
    const handleProfileClick = () => {navigate('/Profile'); };
    const handleProjectsClick = () => {navigate('/Saved');};
    const handleNotificationClick = () => {navigate('/Notification');};
    const handleSettingClick = () => {navigate('/Setting');};
    const handleFavoriteClick = () => {navigate('/Favorite');};
    const handleExploreClick = () => {navigate('/Explore');};
    const handleChatbotClick = () => {navigate('/Chatbot');};
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    window.addEventListener('resize', () => {
        setIsMobile(window.innerWidth < 480);
    });

    const handleToggleSidebar = () => {
        setIsOpen(!isOpen);
    }

  

    
    const handleMouseEnter = () => {
        setAnchorEl(true); // Keeps the dropdown open
    };
    
    const handleMouseLeave = (event) => {
        if (
            event.relatedTarget && // Ensure event.relatedTarget exists
            (event.currentTarget.contains(event.relatedTarget) || menuRef?.current?.contains(event.relatedTarget))
        ) {
            return; // Do nothing if moving within the profile container or dropdown
        }
        setAnchorEl(null); // Close dropdown when pointer leaves both elements
    };
    
    const menuRef = React.useRef(null);
    

  

    return (
        <div className="header-header">
            <div className="header-header-logo-container">
                <img src={logoIcon} alt="home" className="header-logo-icon" onClick={handleHomepageClick} />
                <div className="header-logo-text" onClick={handleHomepageClick}>VERSECRAFT</div>
            </div>
            <div
                className="header-explore"
                onClick={handleExploreClick}
            >
                Explore
            </div>
           



            {/* Searchbar Html code*/}
            <Box
                sx={{ 
                    mt: 0,
                    ml:2 ,
                    width: '520px', 
                    position: 'relative', 
                    zIndex: 1000, 
                    backgroundColor: 'white', 
                    borderColor: "white",
                    borderRadius: 15, 
                    padding: 1, 
                }}
            >
                <TextField
                    className="header-searchbar-textfield"
                    fullWidth
                    label="Search"
                    variant="outlined"
                    sx={{ 
                        backgroundColor: '#fff', 
                        borderRadius: 15, 
                        fontSize: 10, 
                        fontWeight: 500, 
                        padding: 0,
                        '& .MuiOutlinedInput-root': { 
                            borderRadius: 15, 
                            backgroundColor: '#fff', 
                            transition: 'background-color 0.3s ease', 
                            '&:hover': { 
                                backgroundColor: '#e0e0e0', // Light gray on hover
                            },
                        },
                        '& .MuiInputLabel-root': { // Target the label (placeholder)
                            transition: 'transform 0.3s ease, color 0.3s ease, font-size 0.3s ease', // Smooth transition for label
                            '&.Mui-focused': { 
                                transform: 'translate(10, -10px)', // Move label up
                                color: 'rgb(13, 5, 125)', // Change color of the label
                                fontSize: '0.45rem', // Make label text smaller when focused
                                bgcolor: 'transparent !important', // Ensure no background color
                            },
                            fontSize: '1rem', // Default size
                            bgcolor: 'transparent !important', // Default state also has no background
                        },
                    }}
                />
            </Box>



            {isMobile ? (
                <div className="mobile-nav-btn" onClick={handleToggleSidebar}>☰</div>
            ) : (
                <nav>
                    <ul>
                        <li className="header-projects" onClick={handleProjectsClick}>My Projects</li>

                        <li className="header-favorite" onClick={handleFavoriteClick}>Favorites</li>
                        <li className="header-chatbot" onClick={handleChatbotClick}>InspireBot</li>
                        
                        
                    </ul>
                </nav>
            )}
            <div className="header-notification" onClick={handleNotificationClick}>
                <NotificationsIcon
                    sx={{
                        fontSize: 25, // Adjust size
                        
                    }}
                />
            </div>
            <div 
                className={`header-profile-container ${anchorEl ? 'header-profile-active' : ''}`}  
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <img 
                    src={user?.profileImage ? `http://localhost:5001/${user.profileImage}` : profileIcon}
                    alt="Profile"
                    className="header-profile-icon"
                />
                <span className="header-profile-name">{user ? user.fullname : 'Guest'}</span>
            </div>

           
<Menu
    id="fade-menu"
    className='header-profile-menu'
    ref={menuRef}
    MenuListProps={{
        'aria-labelledby': 'fade-button',
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
    }}
    anchorEl={anchorEl ? document.querySelector('.header-profile-container') : null}
    open={Boolean(anchorEl)}
    onClose={() => setAnchorEl(null)}
    TransitionComponent={Grow} // Pop-in effect
    anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left', // Move menu left
    }}
    transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
    }}
    sx={{
        mt: 2, // Push menu down
        ml: 11, // Shift slightly left
        width:'200 !important',
        '& .MuiPaper-root': { // Ensure it removes default shadow and applies the soft one
            boxShadow: '0px 2px 8px rgba(55, 52, 62, 0.08) !important',
            border: '1px solid #e0e0e0', // Light gray border
        },
        px: 2,
        py: 1,
    }}
>
    <MenuItem
        onClick={handleProfileClick}
        sx={{
            bgcolor: 'white', // Ensure the default background is white
            color: 'inherit', // Keep text color normal
            fontWeight: 'lighter', // Use 'lighter' or a numeric value like 300
            typography: 'body2', // Ensures consistent font styling
            '&:hover': {
                bgcolor: '#e3eaf7 !important', // Force hover background
                color: 'rgb(13, 5, 125) !important', // Force hover color
            },
            '&.Mui-selected': {
                bgcolor: '#e3eaf7',
                color: 'rgb(13, 5, 125)',
            },
            '&.Mui-focusVisible': {
                bgcolor: 'white',
            },
            px: 3,
            py: 1,
            ml: 1,
            mr: 1,
            borderRadius: 1,
        }}
    >
        Profile
    </MenuItem>
    <MenuItem
        onClick={handleSettingClick}
        sx={{
            fontWeight: 'lighter', // Use 'lighter' or a numeric value like 300
            typography: 'body2', // Ensures consistent font styling
            '&:hover': { bgcolor: ' #e3eaf7', color: 'rgb(13, 5, 125)' },
            px: 3,
            py: 1,
            ml: 1,
            mr:1,
            borderRadius: 1,
        }}
    >
        Settings
    </MenuItem>
    <MenuItem
        onClick={handleLogout}
        sx={{
            fontWeight: 'lighter', // Use 'lighter' or a numeric value like 300
            typography: 'body2', // Ensures consistent font styling
            '&:hover': { bgcolor: ' #e3eaf7', color: 'rgb(13, 5, 125)' },
            px: 3,
            py: 1,
            ml: 1,
            mr:1,
            borderRadius: 1,
        }}
    >
        Logout
    </MenuItem>
</Menu>


        </div>
    );
};

export default Header;