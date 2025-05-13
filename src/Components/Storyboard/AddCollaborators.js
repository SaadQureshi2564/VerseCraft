import React, { useState, useEffect } from 'react';
import './AddCollaborators.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import closeIcon from '../Images/Close.png';
import profileIcon from '../Images/generic-user-profile-picture.png';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AddCollaborators({ isOpen, onClose, projectId }) {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ProjectTypee, setProjectType] = useState();


  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      fetchUserData();
      handleDetectProject();
      const handleEsc = (event) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleEsc);
      return () => {
        window.removeEventListener('keydown', handleEsc);
      };
    }
  }, [isOpen]);


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



  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await axios.get('/api/users/profile', {
        headers: { 'x-auth-token': token },
      });
      setCurrentUser(response.data);
      setLoading(false);
      fetchCollaborators(token, response.data._id);
    } catch (err) {
      setError('Failed to load user data');
      setLoading(false);
      toast.error('Failed to load user data. Please try again.');
    }
  };

  const fetchCollaborators = async (token, currentUserId) => {
    try {
      const response = await axios.get('/api/users/get-collaborators', {
        headers: { 'x-auth-token': token },
      });
      const collaborators = response.data.filter(user => user._id !== currentUserId);
      setUsers(collaborators);
      setFilteredUsers(collaborators);
    } catch (err) {
      setError('Failed to fetch collaborators');
      toast.error('Failed to fetch collaborators. Please try again.');
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.trim() === '') {
      setFilteredUsers(users);
    } else {
      const regex = new RegExp(term, 'i');
      setFilteredUsers(users.filter(user => regex.test(user.fullname) || regex.test(user.email)));
    }
  };

  const handleSendInvitation = async (userId, userName) => {
    setSending(true);
    let projectT = ProjectTypee
console.log(projectT);
    try {
      const response = await axios.post('/api/notifications/send', {
        receiverId: userId,
        description: `You have been invited to collaborate on the project "${projectId}".`,
        projectId: projectId,
        notificationType: 'Invite',
        projectType:  projectT
      }, {
        headers: { 'x-auth-token': localStorage.getItem('token'), 'Content-Type': 'application/json' },
      });
      toast.success(`Invitation sent to ${userName}!`);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to send invitation';
      toast.error(`Error sending invitation: ${errorMessage}`);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;
  if (loading) return <div className="ac-modal-overlay"><div className="ac-modal-content"><p>Loading...</p></div></div>;
  if (error) return <div className="ac-modal-overlay"><div className="ac-modal-content"><p>{error}</p><button className="ac-close-button" onClick={onClose}><img src={closeIcon} alt="Close" style={{ width: '20px', height: '20px' }}/></button></div></div>;

  return (
    <div className="ac-modal-overlay">
      <div className="ac-modal-content">
        <button className="ac-close-button" onClick={onClose}><img src={closeIcon} alt="Close" style={{ width: '20px', height: '20px' }}/></button>
        <h2 className="ac-title">Add Collaborators</h2>
        <input type="text" placeholder="Search users..." value={searchTerm} onChange={handleSearch} className="ac-search-input"/>
        <div className="ac-users-list">
          {filteredUsers.length > 0 ? filteredUsers.map(user => (
            <div key={user._id} className="ac-user-item">
              <div className="ac-user-info">
                <img src={user?.profileImage ? `${user.profileImage.startsWith('/') ? '' : '/'}${user.profileImage}` : profileIcon} alt={user.fullname} className="ac-user-avatar"/>
                <div className="ac-user-details">
                  <p className="ac-user-name">{user.fullname}</p>
                  <p className="ac-user-email">{user.email}</p>
                </div>
              </div>
              <button className={`ac-invite-button ${sending ? 'ac-button-disabled' : ''}`} onClick={() => handleSendInvitation(user._id, user.fullname)} disabled={sending}>{sending ? 'Sending...' : 'Invite'}</button>
            </div>
          )) : <p className="ac-no-users">No users found.</p>}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default AddCollaborators;
