// src/components/AccountInfo.js

import React, { useState } from 'react';
import './settings.css';
import axios from 'axios';
import profileIcon from "../Images/generic-user-profile-picture.png";
import backgroundIcon from "../Images/user-background-image.png";
import {
    Typography,
    TextField,
    Button,
    Stack,
    Box,
    Avatar,
    List,
  ListItem,
  Divider,
  Modal,
  } from '@mui/material';
  

function AccountInfo({ user, setUser }){

    // Profile Information State
    const [fullname, setFullName] = useState(user.fullname || '');
    const [bio, setBio] = useState(user.description || '');
    const [age, setAge] = useState(user.age || '');
    const [gender, setGender] = useState(user.gender || '');
    const [phoneNumber, setPhoneNumber] = useState(user.phone || '');
    const [email, setEmail] = useState(user.email || '');
    const [profileImage, setProfileImage] = useState(user.profileImage ? `http://localhost:5001/${user.profileImage}` : profileIcon);
    const [backgroundImage, setBackgroundImage] = useState(user.coverImage ? `http://localhost:5001/${user.coverImage}` : backgroundIcon);

    // Password Change State
    const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordErrorMessage, setPasswordErrorMessage] = useState('');

    // Notification Preferences State
    const [generalUpdates, setGeneralUpdates] = useState(true);
    const [securityAlerts, setSecurityAlerts] = useState(true);
    const [featureAnnouncements, setFeatureAnnouncements] = useState(false);
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [notificationFrequency, setNotificationFrequency] = useState('immediately');

    const token = localStorage.getItem('token');

    // Function to verify the email address
    const handleVerifyEmail = () => {
        alert('A verification link has been sent to your email address. Please check your inbox.');
    };

    // Function to unsubscribe from all non-essential emails
    const handleUnsubscribeAll = () => {
        setGeneralUpdates(false);
        setFeatureAnnouncements(false);
        alert('You have been unsubscribed from all non-essential emails.');
    };

    // Function to save changes made to email and notification settings
    const handleSaveChanges = () => {
        // Example logic to save settings (in a real application, you'd send this data to your backend)
        alert('Your email and notification preferences have been saved.');
        console.log({
            email,
            generalUpdates,
            securityAlerts,
            featureAnnouncements,
            emailNotifications,
            notificationFrequency,
        });
        // Implement API call here to save notification preferences if needed
    };

    // Function to open the password change modal
    const handleOpenModal = () => {
        setPasswordModalOpen(true);
    };

    // Function to handle profile image change
    const handleProfileImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setProfileImage(imageUrl);
        }
    };

    // Function to handle background image change
    const handleBackgroundImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setBackgroundImage(imageUrl);
        }
    };

    // Function to close the password modal
    const handleCloseModal = () => {
        setPasswordModalOpen(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordErrorMessage('');
    };

    // Function to validate password and change it
    const handlePasswordChange = async () => {
        // Example validation logic for password
        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordErrorMessage('Please fill in all fields.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordErrorMessage('New password and confirm password do not match.');
            return;
        }

        try {
            // Make API call to change password
            const response = await axios.put('http://localhost:5001/api/users/change-password', {
                currentPassword,
                newPassword,
            }, {
                headers: {
                    'x-auth-token': token,
                },
            });

            alert(response.data.message);
            handleCloseModal();
        } catch (error) {
            console.error(error);
            setPasswordErrorMessage(error.response?.data?.error || 'Failed to change password.');
        }
    };

    // Function to save profile changes
    const handleSaveProfile = async () => {
        try {
            const formData = new FormData();
            formData.append('fullname', fullname);
            formData.append('email', email);
            formData.append('age', age);
            formData.append('gender', gender);
            formData.append('phone', phoneNumber);
            formData.append('description', bio);

            // Get the selected files
            const profileImageFile = document.getElementById('profileImageInput').files[0];
            const coverImageFile = document.getElementById('backgroundImageInput').files[0];

            if (profileImageFile) {
                formData.append('profileImage', profileImageFile);
            }

            if (coverImageFile) {
                formData.append('coverImage', coverImageFile);
            }

            // Make API call to update profile
            const response = await axios.put('http://localhost:5001/api/users/profile', formData, {
                headers: {
                    'x-auth-token': token,
                    'Content-Type': 'multipart/form-data',
                },
            });

            alert('Profile updated successfully.');
            setUser(response.data); // Update user data in parent component
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.error || 'Failed to update profile.');
        }
    };

    return(

        <div className="setting-account-page" >
    <Box id="profile-settings" sx={{ padding: 4 }} >
      {/* Profile Header */}
      <Typography  variant="h5" sx={{ color:"black" , fontWeight: 'bold', marginBottom: 1 , marginTop:2}}>
        Profile
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ marginBottom: 3 }}
      >
        Manage your profile details
      </Typography>

      {/* Divider */}
      <Box
        sx={{
          height: '2px',
          backgroundColor: 'divider',
          marginBottom: 4,
        }}
      ></Box>

      {/* Profile Picture and Background Image */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 4,
          flexWrap: 'wrap',
        }}
      >
        {/* Profile Picture Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: { xs: 2, sm: 0 } }}>
          <Avatar
            src={profileImage}
            alt="Profile"
            sx={{
              width: 100,
              height: 100,
              border: '2px solid',
              borderColor: 'primary.main',
              marginRight: 2,
            }}
          />
          <input
            type="file"
            id="profileImageInput"
            style={{ display: 'none' }}
            accept="image/*"
            onChange={handleProfileImageChange}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() =>
              document.getElementById('profileImageInput').click()
            }
          >
            Edit Image
          </Button>
        </Box>

        {/* Background Image Section */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            src={backgroundImage}
            alt="Background"
            variant="square"
            sx={{
              width: 150,
              height: 80,
              border: '2px solid',
              borderColor: 'primary.main',
              marginRight: 2,
            }}
          />
          <input
            type="file"
            id="backgroundImageInput"
            style={{ display: 'none' }}
            accept="image/*"
            onChange={handleBackgroundImageChange}
          />
          <Button
            variant="outlined"
            color="primary"
            onClick={() =>
              document.getElementById('backgroundImageInput').click()
            }
          >
            Change Background
          </Button>
        </Box>
      </Box>

      {/* Input Fields Section */}
      <Stack spacing={2}>
        {/* Username Input Field */}
        <TextField
          id="username"
          label="Username"
          variant="outlined"
          fullWidth
          value={fullname}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Enter your username"
          size="small"
        />

        {/* Biography Textarea */}
        <TextField
          id="bio"
          label="Biography"
          multiline
          rows={4}
          fullWidth
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell people something about yourself"
          variant="outlined"
          size="small"
        />
      </Stack>
    </Box>
            
    <Box sx={{ padding: 4 }}>
      {/* Header */}
      <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: 1 ,marginTop:4 }} id="login-security">
        Security Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ marginBottom: 3 }}>
        Manage your security preferences
      </Typography>

      <Divider sx={{ marginBottom: 4 }} />

      {/* Change Password Section */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 4,
        }}
      >
        <Typography variant="body1">Change Password:</Typography>
        <Button variant="contained" color="primary" onClick={handleOpenModal}>
          Change Password
        </Button>
      </Box>

      <Divider sx={{ marginBottom: 4 }} />

      {/* Login Activity Section */}
      <Box sx={{ marginBottom: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
          Login Activity
        </Typography>
        <List>
          <ListItem>2024-10-01 14:32</ListItem>
          <ListItem>2024-09-28 10:22</ListItem>
          <ListItem>2024-09-25 08:11</ListItem>
          <ListItem>2024-09-20 19:45</ListItem>
        </List>
      </Box>

      {/* Password Change Modal */}
      <Modal
        open={isPasswordModalOpen}
        onClose={handleCloseModal}
        aria-labelledby="change-password-modal-title"
        aria-describedby="change-password-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            borderRadius: 2,
            p: 4,
          }}
        >
          <Typography id="change-password-modal-title" variant="h6" sx={{ marginBottom: 2 }}>
            Change Password
          </Typography>
          <TextField
            label="Current Password"
            type="password"
            fullWidth
            variant="outlined"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="New Password"
            type="password"
            fullWidth
            variant="outlined"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Confirm Password"
            type="password"
            fullWidth
            variant="outlined"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          {passwordErrorMessage && (
            <Typography color="error" sx={{ marginBottom: 2 }}>
              {passwordErrorMessage}
            </Typography>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handlePasswordChange}
            >
              Confirm Change
            </Button>
            <Button variant="outlined" color="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>

            <h1 className="setting-email-header" id="notifications" >Email and Notifications</h1>
            <h2 className="setting-email-header-description">View your email and notification preferences</h2>
            <div className="setting-email-header-line01"></div>

            <div className="setting-email-address">
                <label htmlFor="email">Email Address</label>
                <input
                    type="email"
                    id="email"
                    className="email-input-field"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                />
            </div>
            <button className="verify-email-button" onClick={handleVerifyEmail}>Verify Email</button>
            <div className="setting-email-header-line02"></div>

            <div className="setting-notification-preferences">
                <h3>Notification Preferences</h3>
                
                <div className="setting-notification-option">
                    <input
                        type="checkbox"
                        id="generalUpdates"
                        checked={generalUpdates}
                        onChange={(e) => setGeneralUpdates(e.target.checked)}
                    />
                    <label htmlFor="generalUpdates">Receive general updates and news</label>
                </div>

                <div className="setting-notification-option">
                    <input
                        type="checkbox"
                        id="securityAlerts"
                        checked={securityAlerts}
                        onChange={(e) => setSecurityAlerts(e.target.checked)}
                    />
                    <label htmlFor="securityAlerts">Receive login alerts and password change notifications</label>
                </div>

                <div className="setting-notification-option">
                    <input
                        type="checkbox"
                        id="featureAnnouncements"
                        checked={featureAnnouncements}
                        onChange={(e) => setFeatureAnnouncements(e.target.checked)}
                    />
                    <label htmlFor="featureAnnouncements">Receive new feature announcements</label>
                </div>

                <div className="setting-notification-option">
                    <input
                        type="checkbox"
                        id="emailNotifications"
                        checked={emailNotifications}
                        onChange={(e) => setEmailNotifications(e.target.checked)}
                    />
                    <label htmlFor="emailNotifications">Enable email notifications</label>
                </div>
                <div className="setting-notification-frequency">
                    <h3>Notification Frequency</h3>
                    <select
                        id="notificationFrequency"
                        className="notification-frequency-select"
                        value={notificationFrequency}
                        onChange={(e) => setNotificationFrequency(e.target.value)}
                    >
                        <option value="immediately">Immediately</option>
                        <option value="daily">Daily Summary</option>
                        <option value="weekly">Weekly Summary</option>
                    </select>
                </div>
                <div className="setting-unsubscribe">
                    <button className="unsubscribe-button" onClick={handleUnsubscribeAll}>
                        Unsubscribe from All Non-Essential Emails
                    </button>
                </div>
                <div className="setting-save-changes">
                    <button className="save-changes-button" onClick={handleSaveChanges}>
                        Save Changes
                    </button>
                </div>
            </div>

            <h1 className="setting-personal-info" id="account-settings">Personal Information</h1>
            <h2 className="setting-email-personal-description">Edit your personal details</h2>
            <div className="setting-personal-header-line01"></div>
            <div className="setting-full-name">
                <label htmlFor="fullName">Full Name</label>
                <input
                    type="text"
                    id="fullName"
                    className="name-input-field"
                    value={fullname}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                />
            </div>

            {/* Input field for Date of Birth */}
            <div className="setting-dob">
                <label htmlFor="dob">Date of Birth</label>
                <input
                    type="date"
                    id="dob"
                    className="dob-input-field"
                    value={user.dob || ''} // Assuming dob is stored
                    onChange={(e) => { /* Implement if dob is stored in user */ }}
                />
            </div>

            {/* Input field for Phone Number */}
            <div className="setting-phone-number">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                    type="tel"
                    id="phoneNumber"
                    className="phone-input-field"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter your phone number"
                />
            </div>

            {/* Input field for Gender */}
            <div className="setting-gender">
                <label htmlFor="gender">Gender</label>
                <select
                    id="gender"
                    className="gender-input-field"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                >
                    <option value="">Select your gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                </select>
            </div>

            <div className="setting-save-profile">
                <button className="save-profile-button" onClick={handleSaveProfile}>
                    Save Profile
                </button>
            </div>
        </div>
    );
}

export default AccountInfo;
