// src/components/Notifications.js

import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './notifications.css';
import verticalOptionIcon from '../Images/vertical-options.png';
import { Scrollbars } from 'react-custom-scrollbars-2';
import animationData from '../Images/mail-animation01.json';
import welcomeanimation from '../Images/mail-animation02.json'; // Ensure correct path
import Lottie from 'react-lottie';
import Header from '../Header/header';

// Material-UI Imports
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    IconButton,
    Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';


function Notifications() {
    const navigate = useNavigate();

    // State variables for user data
    const [user, setUser] = useState(null); // User object
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state

    // State for notifications
    const [notifications, setNotifications] = useState([]);

    // State for modal visibility and selected notification
    const [visible, setVisible] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);

    // Fetch user data and notifications on component mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const userResponse = await axios.get('/api/users/profile', {
                    headers: {
                        'x-auth-token': token,
                    },
                });

                setUser(userResponse.data);

                // Fetch notifications for the user
                const notificationsResponse = await axios.get('/api/notifications/user-notifications', {
                    headers: {
                        'x-auth-token': token,
                    },
                });

                setNotifications(notificationsResponse.data.notifications);
                console.log('Fetched Notifications:', notificationsResponse.data.notifications); // Debug log
            } catch (err) {
                console.error(err);
                setError('Failed to load data.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    // No search functionality; display all notifications directly
    const filteredNotifications = notifications; // No filtering applied

    const handleScrollStart = () => {
        const thumb = document.querySelector('.custom-thumb');
        const track = document.querySelector('.custom-track');
        if (thumb) thumb.style.opacity = 1;
        if (track) track.style.opacity = 1;
    };

    const handleScrollStop = () => {
        const thumb = document.querySelector('.custom-thumb');
        const track = document.querySelector('.custom-track');
        if (thumb) thumb.style.opacity = 0;
        if (track) track.style.opacity = 0;
    };

    // Handle notification actions like delete, accept, reject
    const handleNotificationAction = async (action) => {
        if (selectedNotification) {
            const { notificationId, projectId, projectType } = selectedNotification;
            const token = localStorage.getItem('token');

            console.log(`Action: ${action}`, selectedNotification); // Debug log

            try {
                if (action === 'delete') {
                    await axios.delete(`/api/notifications/${notificationId}`, {
                        headers: {
                            'x-auth-token': token,
                        },
                    });
                    setNotifications(notifications.filter((n) => n.notificationId !== notificationId));
                } else if (action === 'accept') {
                    // Validate projectType before sending
                    if (!projectType) {
                        setError('Project type is missing.');
                        return;
                    }

                    // Call the accept-invite endpoint
                    await axios.post('/api/notifications/accept-invite', {
                        projectId,
                        projectType, // Ensure projectType is available
                        notificationId, // Pass notificationId
                    }, {
                        headers: {
                            'x-auth-token': token,
                        },
                    });

                    // Remove the notification from the list
                    setNotifications(notifications.filter((n) => n.notificationId !== notificationId));
                } else if (action === 'reject') {
                    // Update the notification status to 'rejected'
                    await axios.patch(`/api/notifications/${notificationId}/status`, {
                        status: 'rejected',
                    }, {
                        headers: {
                            'x-auth-token': token,
                        },
                    });

                    // Remove the notification from the list
                    setNotifications(notifications.filter((n) => n.notificationId !== notificationId));
                }

                setSelectedNotification(null);
                setVisible(false);
                setError(null); // Clear any existing errors
            } catch (err) {
                console.error('Action Failed:', err.response ? err.response.data : err);
                // Display server-provided error message if available
                if (err.response && err.response.data && err.response.data.error) {
                    setError(err.response.data.error);
                } else {
                    setError('Failed to perform the action.');
                }
            }
        }
    };

    
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData, // Existing login animation
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  const welcomeOptions = {
    loop: true,
    autoplay: true,
    animationData: welcomeanimation, // New welcome animation
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

    // Custom scrollbar styles
    const renderThumb = ({ style, ...props }) => {
        const thumbStyle = {
            backgroundColor: '#F47D4B',
            borderRadius: '10px',
            opacity: 0,
            transition: 'opacity 0.3s',
        };
        return <div style={{ ...style, ...thumbStyle }} {...props} />;
    };

    const renderTrack = ({ style, ...props }) => {
        const trackStyle = {
            backgroundColor: '#191B30',
            borderRadius: '10px',
            opacity: 0,
            transition: 'opacity 0.3s',
        };
        return <div style={{ ...style, ...trackStyle }} {...props} />;
    };

   
  
    // Close modal when clicking outside the content
    const closeModal = (event) => {
        if (event.target.closest('.notification-modal-content')) {
            return;
        }
        setVisible(false);
    };

    return (
        <div className="container">
           <Header/>
            <div className='notification-second-container'>
                <div className="Notifications-container">
                    <div className="notification-animation-container-01">
                         {/* Removed Typography components and added Welcome Animation */}
                    <Lottie 
                        className="notification-animation-01"
                        options={welcomeOptions}
                         // Ensures responsiveness
                    />
                    </div>
                 

                    <div className='notification-content'>
                        <h1>Notifications</h1>
                        <div className="notification-content-part">
                        {/* Removed search input */}
                        
                        {loading ? (
                            <p>Loading notifications...</p>
                        ) : error ? (
                            <p className="error">{error}</p>
                        ) : (
                            <Scrollbars
                                renderThumbVertical={renderThumb}
                                renderTrackVertical={renderTrack}
                                onScrollStart={handleScrollStart}
                                onScrollStop={handleScrollStop}
                                style={{ height: '100%', overflowX: 'hidden' }}
                            >
                                <div className="notification-content-container">
                                    {notifications.length === 0 ? (
                                        <p>No notifications available.</p>
                                    ) : (
                                        <ul>
                                            {filteredNotifications.map((notification) => (
                                                <li key={notification.notificationId}>
                                                    <div className="notification-notification-item">
                                                        <div className="notification-notification-date">
                                                            {new Date(notification.createdAt).toLocaleDateString()}
                                                        </div>
                                                        <div className="notification-options">
                                                            <img
                                                                src={verticalOptionIcon}
                                                                alt="Options"
                                                                className="notification-vert-icon"
                                                                onClick={() => {
                                                                    setSelectedNotification(notification);
                                                                    setVisible(true);
                                                                }}
                                                            />
                                                        </div>
                                                        {/* Displaying 'notificationType' as title */}
                                                        <div className="notification-notification-title">
                                                            {notification.notificationType || 'Notification'}
                                                        </div>
                                                        <div className="notification-notification-description">
                                                            {notification.description}
                                                        </div>
                                                       
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </Scrollbars>
                        )}
                    </div>
                </div>
                <div className="notification-animation-container-02">
                {/* Removed Typography components and added Welcome Animation */}
                <Lottie 
                className="notification-animation-02"
                        options={defaultOptions}
                    />
                </div>
                </div>
            </div>

            {/* Modal for Notification Actions */}
            <Dialog
                open={visible}
                onClose={() => setVisible(false)}
                aria-labelledby="notification-dialog-title"
                aria-describedby="notification-dialog-description"
            >
                <DialogTitle id="notification-dialog-title" sx={{ m: 0, p: 2 }}>
                    Notification Actions
                    <IconButton
                        aria-label="close"
                        onClick={() => setVisible(false)}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    {selectedNotification?.notificationType === 'Invite' ? (
                        <Typography gutterBottom>
                            What would you like to do with this invite?
                        </Typography>
                    ) : (
                        <Typography gutterBottom>
                            Would you like to delete this notification?
                        </Typography>
                    )}
                    {error && (
                        <Typography color="error" variant="body2">
                            {error}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    {selectedNotification?.notificationType === 'Invite' ? (
                        <>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => handleNotificationAction('accept')}
                            >
                                Accept
                            </Button>
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={() => handleNotificationAction('reject')}
                            >
                                Reject
                            </Button>
                            <Button
                                variant="text"
                                color="error"
                                onClick={() => handleNotificationAction('delete')}
                            >
                                Delete
                            </Button>
                        </>
                    ) : (
                        <Button
                            variant="contained"
                            color="error"
                            onClick={() => handleNotificationAction('delete')}
                        >
                            Delete Notification
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

        </div>
    );
}

export default Notifications;
