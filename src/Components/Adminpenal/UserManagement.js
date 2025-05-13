// src/components/UserManagement.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaTrash, FaEdit, FaSave, FaTimes } from 'react-icons/fa';

const UserManagement = ({ globalSearchTerm }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editUserId, setEditUserId] = useState(null);
  const [editUserData, setEditUserData] = useState({});

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;
      const usersRes = await axios.get('http://localhost:5001/api/admin/users', {
        headers: { 'x-auth-token': token },
      });
      setUsers(usersRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch data. Please try again later.');
      setLoading(false);
    }
  };

  // Fuzzy-ish or partial matching logic
  const filterBySearchTerm = (user) => {
    if (!globalSearchTerm) return true;
    const lowerSearch = globalSearchTerm.toLowerCase();
    const fullNameMatch = user.fullname?.toLowerCase().includes(lowerSearch);
    const emailMatch = user.email?.toLowerCase().includes(lowerSearch);
    const genderMatch = user.gender?.toLowerCase().includes(lowerSearch);
    return (fullNameMatch || emailMatch || genderMatch);
  };

  const filteredUsers = users.filter(filterBySearchTerm);

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      await axios.delete(`http://localhost:5001/api/admin/users/${id}`, {
        headers: { 'x-auth-token': token },
      });
      setUsers(users.filter((u) => u._id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete user. Please try again.');
    }
  };

  const handleEditUser = (user) => {
    setEditUserId(user._id);
    setEditUserData({ ...user });
  };

  const handleCancelEditUser = () => {
    setEditUserId(null);
    setEditUserData({});
  };

  const handleSaveUser = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      await axios.put(
        `http://localhost:5001/api/admin/users/${id}`,
        editUserData,
        { headers: { 'x-auth-token': token } }
      );
      setUsers(users.map((u) => (u._id === id ? editUserData : u)));
      setEditUserId(null);
      setEditUserData({});
    } catch (err) {
      console.error(err);
      alert('Failed to update user. Please check the input and try again.');
    }
  };

  if (loading) {
    return <div className="adminusermange-loading">Loading...</div>;
  }
  if (error) {
    return <div className="adminusermange-error">{error}</div>;
  }

  return (
    <div className="adminusermange-container">
      <h2 className="adminusermange-title">Manage Users</h2>
      <div className="adminusermange-table-container">
        <table className="adminusermange-table">
          <thead>
            <tr>
              {[
                'Full Name',
                'Email',
                'Age',
                'Gender',
                'Phone',
                'Description',
                'Profile Image',
                'User Type',
                'Actions',
              ].map((header) => (
                <th key={header} className="adminusermange-table-header">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user._id} className="adminusermange-table-row">
                {/* Full Name */}
                <td className="adminusermange-table-cell">
                  {editUserId === user._id ? (
                    <div className="floating-label-group">
                      <input
                        type="text"
                        id={`fullname-${user._id}`}
                        value={editUserData.fullname || ''}
                        onChange={(e) =>
                          setEditUserData({ ...editUserData, fullname: e.target.value })
                        }
                        className="adminusermange-input floating-input"
                        placeholder=" "
                      />
                      <label htmlFor={`fullname-${user._id}`} className="floating-label">
                        Full Name
                      </label>
                    </div>
                  ) : (
                    user.fullname
                  )}
                </td>

                {/* Email */}
                <td className="adminusermange-table-cell">
                  {editUserId === user._id ? (
                    <div className="floating-label-group">
                      <input
                        type="email"
                        id={`email-${user._id}`}
                        value={editUserData.email || ''}
                        onChange={(e) =>
                          setEditUserData({ ...editUserData, email: e.target.value })
                        }
                        className="adminusermange-input floating-input"
                        placeholder=" "
                      />
                      <label htmlFor={`email-${user._id}`} className="floating-label">
                        Email
                      </label>
                    </div>
                  ) : (
                    user.email
                  )}
                </td>

                {/* Age */}
                <td className="adminusermange-table-cell">
                  {editUserId === user._id ? (
                    <div className="floating-label-group">
                      <input
                        type="number"
                        id={`age-${user._id}`}
                        value={editUserData.age || ''}
                        onChange={(e) =>
                          setEditUserData({ ...editUserData, age: e.target.value })
                        }
                        className="adminusermange-input floating-input"
                        placeholder=" "
                      />
                      <label htmlFor={`age-${user._id}`} className="floating-label">
                        Age
                      </label>
                    </div>
                  ) : (
                    user.age
                  )}
                </td>

                {/* Gender */}
                <td className="adminusermange-table-cell">
                  {editUserId === user._id ? (
                    <div className="floating-label-group select-wrapper">
                      <select
                        id={`gender-${user._id}`}
                        value={editUserData.gender || ''}
                        onChange={(e) =>
                          setEditUserData({ ...editUserData, gender: e.target.value })
                        }
                        className="adminusermange-select floating-input"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      <label className="floating-label">Gender</label>
                    </div>
                  ) : (
                    user.gender
                  )}
                </td>

                {/* Phone */}
                <td className="adminusermange-table-cell">
                  {editUserId === user._id ? (
                    <div className="floating-label-group">
                      <input
                        type="text"
                        id={`phone-${user._id}`}
                        value={editUserData.phone || ''}
                        onChange={(e) =>
                          setEditUserData({ ...editUserData, phone: e.target.value })
                        }
                        className="adminusermange-input floating-input"
                        placeholder=" "
                      />
                      <label htmlFor={`phone-${user._id}`} className="floating-label">
                        Phone
                      </label>
                    </div>
                  ) : (
                    user.phone
                  )}
                </td>

                {/* Description */}
                <td className="adminusermange-table-cell">
                  {editUserId === user._id ? (
                    <div className="floating-label-group">
                      <textarea
                        id={`desc-${user._id}`}
                        value={editUserData.description || ''}
                        onChange={(e) =>
                          setEditUserData({ ...editUserData, description: e.target.value })
                        }
                        className="adminusermange-textarea floating-input"
                        placeholder=" "
                      />
                      <label htmlFor={`desc-${user._id}`} className="floating-label">
                        Description
                      </label>
                    </div>
                  ) : (
                    user.description
                  )}
                </td>

                {/* Profile Image */}
                <td className="adminusermange-table-cell">
                  {editUserId === user._id ? (
                    <div className="floating-label-group">
                      <input
                        type="text"
                        id={`profileImage-${user._id}`}
                        value={editUserData.profileImage || ''}
                        onChange={(e) =>
                          setEditUserData({ ...editUserData, profileImage: e.target.value })
                        }
                        className="adminusermange-input floating-input"
                        placeholder=" "
                      />
                      <label htmlFor={`profileImage-${user._id}`} className="floating-label">
                        Profile Image (URL)
                      </label>
                    </div>
                  ) : user.profileImage ? (
                    <img
                      src={`http://localhost:5001/${user.profileImage}`}
                      alt="Profile"
                      className="adminusermange-profile-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/default-profile.png';
                      }}
                    />
                  ) : (
                    <span className="adminusermange-no-image">N/A</span>
                  )}
                </td>

                {/* User Type */}
                <td className="adminusermange-table-cell">
                  {editUserId === user._id ? (
                    <div className="floating-label-group select-wrapper">
                      <select
                        id={`userType-${user._id}`}
                        value={editUserData.userType || ''}
                        onChange={(e) =>
                          setEditUserData({ ...editUserData, userType: e.target.value })
                        }
                        className="adminusermange-select floating-input"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="moderator">Moderator</option>
                      </select>
                      <label className="floating-label">User Type</label>
                    </div>
                  ) : (
                    user.userType.charAt(0).toUpperCase() + user.userType.slice(1)
                  )}
                </td>

                {/* Actions */}
                <td className="adminusermange-table-cell adminusermange-actions">
                  {editUserId === user._id ? (
                    <>
                      <button
                        onClick={() => handleSaveUser(user._id)}
                        className="adminusermange-button save"
                        aria-label="Save"
                        title="Save"
                      >
                        <FaSave />
                      </button>
                      <button
                        onClick={handleCancelEditUser}
                        className="adminusermange-button cancel"
                        aria-label="Cancel"
                        title="Cancel"
                      >
                        <FaTimes />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEditUser(user)}
                        className="adminusermange-button edit"
                        aria-label="Edit"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="adminusermange-button delete"
                        aria-label="Delete"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
