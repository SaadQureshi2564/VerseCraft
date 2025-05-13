// src/components/UrduManagement.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash, FaEdit, FaSave, FaTimes } from 'react-icons/fa';

const UrduManagement = () => {
  const [urdus, setUrdus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editUrdusId, setEditUrdusId] = useState(null);
  const [editUrdusData, setEditUrdusData] = useState({});
  const [newUrdu, setNewUrdu] = useState({
    title: '',
    author: { name: '', email: '' },
    description: '',
    genres: [],
    collaborators: [],
  });

  useEffect(() => {
    fetchUrdus();
  }, []);

  const fetchUrdus = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/urdu');
      setUrdus(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch Urdu projects. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUrdu = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Urdu project?')) return;
    try {
      await axios.delete(`http://localhost:5001/api/urdu/${id}`);
      setUrdus(urdus.filter((u) => u._id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete Urdu project. Please try again.');
    }
  };

  const handleEditUrdu = (urdu) => {
    setEditUrdusId(urdu._id);
    setEditUrdusData({
      ...urdu,
      genres: urdu.genres || [],
      collaborators: urdu.collaborators || [],
      author: urdu.author || { name: '', email: '' },
    });
  };

  const handleCancelEditUrdu = () => {
    setEditUrdusId(null);
    setEditUrdusData({});
  };

  const handleSaveUrdu = async (id) => {
    try {
      const response = await axios.put(`http://localhost:5001/api/urdu/${id}`, editUrdusData);
      setUrdus(urdus.map((u) => (u._id === id ? response.data : u)));
      setEditUrdusId(null);
      setEditUrdusData({});
    } catch (err) {
      console.error(err);
      alert('Failed to update Urdu project. Please check the input and try again.');
    }
  };

  const handleChange = (e, field) => {
    setEditUrdusData({
      ...editUrdusData,
      [field]: e.target.value,
    });
  };

  const handleAddUrdu = async () => {
    try {
      const { title, author, description } = newUrdu;
      if (!title || !author.name || !author.email || !description) {
        setError('Please fill all required fields before adding a new Urdu project.');
        return;
      }

      const response = await axios.post('http://localhost:5001/api/urdu', newUrdu);
      setUrdus([...urdus, response.data]);
      setNewUrdu({
        title: '',
        author: { name: '', email: '' },
        description: '',
        genres: [],
        collaborators: [],
      });
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to add new Urdu project.');
    }
  };

  if (loading) {
    return <div className="adminUrduManagement-loading">Loading...</div>;
  }

  return (
    <div className="adminUrduManagement-container">
      <h2 className="adminUrduManagement-title">Manage Urdu Projects</h2>

      {error && <div className="adminUrduManagement-error">{error}</div>}

      {/* Form for creating a new Urdu project */}
      <div className="adminUrduManagement-form-section">
        <h3 className="adminUrduManagement-subtitle">Create a New Urdu Project</h3>
        <div className="adminUrduManagement-form-group">
          <label htmlFor="title">Title (required):</label>
          <input
            type="text"
            id="title"
            value={newUrdu.title}
            onChange={(e) => setNewUrdu({ ...newUrdu, title: e.target.value })}
            className="adminUrduManagement-input"
            placeholder="Enter Title"
          />
        </div>
        <div className="adminUrduManagement-form-group">
          <label htmlFor="authorName">Author Name (required):</label>
          <input
            type="text"
            id="authorName"
            value={newUrdu.author.name}
            onChange={(e) =>
              setNewUrdu({ ...newUrdu, author: { ...newUrdu.author, name: e.target.value } })
            }
            className="adminUrduManagement-input"
            placeholder="Enter Author Name"
          />
        </div>
        <div className="adminUrduManagement-form-group">
          <label htmlFor="authorEmail">Author Email (required):</label>
          <input
            type="email"
            id="authorEmail"
            value={newUrdu.author.email}
            onChange={(e) =>
              setNewUrdu({ ...newUrdu, author: { ...newUrdu.author, email: e.target.value } })
            }
            className="adminUrduManagement-input"
            placeholder="Enter Author Email"
          />
        </div>
        <div className="adminUrduManagement-form-group">
          <label htmlFor="description">Description (required):</label>
          <textarea
            id="description"
            value={newUrdu.description}
            onChange={(e) => setNewUrdu({ ...newUrdu, description: e.target.value })}
            className="adminUrduManagement-textarea"
            placeholder="Enter Description"
          />
        </div>
        <div className="adminUrduManagement-form-group">
          <label htmlFor="genres">Genres (comma-separated):</label>
          <input
            type="text"
            id="genres"
            value={newUrdu.genres.join(', ')}
            onChange={(e) =>
              setNewUrdu({
                ...newUrdu,
                genres: e.target.value ? e.target.value.split(',').map((g) => g.trim()) : [],
              })
            }
            className="adminUrduManagement-input"
            placeholder="e.g., Poetry, Literature"
          />
        </div>
        <div className="adminUrduManagement-form-group">
          <label htmlFor="collaborators">Collaborators' Emails (comma-separated):</label>
          <input
            type="text"
            id="collaborators"
            value={newUrdu.collaborators.map((c) => c.email).join(', ')}
            onChange={(e) =>
              setNewUrdu({
                ...newUrdu,
                collaborators: e.target.value
                  ? e.target.value.split(',').map((email) => ({ email: email.trim() }))
                  : [],
              })
            }
            className="adminUrduManagement-input"
            placeholder="e.g., collaborator1@example.com, collaborator2@example.com"
          />
        </div>

        <button onClick={handleAddUrdu} className="adminUrduManagement-button add">
          Add Urdu Project
        </button>
      </div>

      <div className="adminUrduManagement-list">
        {urdus.map((urdu) => (
          <div className="adminUrduManagement-item" key={urdu._id}>
            {editUrdusId === urdu._id ? (
              <div className="adminUrduManagement-edit-form">
                <h3>Edit Urdu Project</h3>
                <div className="adminUrduManagement-form-group">
                  <label htmlFor={`title-${urdu._id}`}>Title:</label>
                  <input
                    type="text"
                    id={`title-${urdu._id}`}
                    value={editUrdusData.title || ''}
                    onChange={(e) => handleChange(e, 'title')}
                    className="adminUrduManagement-input"
                  />
                </div>
                <div className="adminUrduManagement-form-group">
                  <label htmlFor={`authorName-${urdu._id}`}>Author Name:</label>
                  <input
                    type="text"
                    id={`authorName-${urdu._id}`}
                    value={editUrdusData.author?.name || ''}
                    onChange={(e) =>
                      setEditUrdusData({
                        ...editUrdusData,
                        author: { ...editUrdusData.author, name: e.target.value },
                      })
                    }
                    className="adminUrduManagement-input"
                  />
                </div>
                <div className="adminUrduManagement-form-group">
                  <label htmlFor={`authorEmail-${urdu._id}`}>Author Email:</label>
                  <input
                    type="email"
                    id={`authorEmail-${urdu._id}`}
                    value={editUrdusData.author?.email || ''}
                    onChange={(e) =>
                      setEditUrdusData({
                        ...editUrdusData,
                        author: { ...editUrdusData.author, email: e.target.value },
                      })
                    }
                    className="adminUrduManagement-input"
                  />
                </div>
                <div className="adminUrduManagement-form-group">
                  <label htmlFor={`description-${urdu._id}`}>Description:</label>
                  <textarea
                    id={`description-${urdu._id}`}
                    value={editUrdusData.description || ''}
                    onChange={(e) => handleChange(e, 'description')}
                    className="adminUrduManagement-textarea"
                  />
                </div>
                <div className="adminUrduManagement-form-group">
                  <label htmlFor={`genres-${urdu._id}`}>Genres (comma-separated):</label>
                  <input
                    type="text"
                    id={`genres-${urdu._id}`}
                    value={(editUrdusData.genres || []).join(', ')}
                    onChange={(e) =>
                      setEditUrdusData({
                        ...editUrdusData,
                        genres: e.target.value
                          ? e.target.value.split(',').map((g) => g.trim())
                          : [],
                      })
                    }
                    className="adminUrduManagement-input"
                  />
                </div>
                <div className="adminUrduManagement-form-group">
                  <label htmlFor={`collaborators-${urdu._id}`}>
                    Collaborators' Emails (comma-separated):
                  </label>
                  <input
                    type="text"
                    id={`collaborators-${urdu._id}`}
                    value={(editUrdusData.collaborators || []).map((c) => c.email).join(', ')}
                    onChange={(e) =>
                      setEditUrdusData({
                        ...editUrdusData,
                        collaborators: e.target.value
                          ? e.target.value.split(',').map((email) => ({ email: email.trim() }))
                          : [],
                      })
                    }
                    className="adminUrduManagement-input"
                  />
                </div>

                <div className="adminUrduManagement-edit-actions">
                  <button onClick={() => handleSaveUrdu(urdu._id)} className="adminUrduManagement-button save">
                    <FaSave /> Save
                  </button>
                  <button onClick={handleCancelEditUrdu} className="adminUrduManagement-button cancel">
                    <FaTimes /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="adminUrduManagement-content">
                <h3 className="adminUrduManagement-item-title">{urdu.title}</h3>
                <p className="adminUrduManagement-item-description">{urdu.description}</p>
                <p className="adminUrduManagement-item-genres">
                  <strong>Genres:</strong> {(urdu.genres || []).join(', ') || 'N/A'}
                </p>
                <p className="adminUrduManagement-item-author">
                  <strong>Author:</strong> {urdu.author?.name} ({urdu.author?.email})
                </p>
                <p className="adminUrduManagement-item-collaborators">
                  <strong>Collaborators:</strong>{' '}
                  {urdu.collaborators?.length
                    ? urdu.collaborators.map((c) => c.email).join(', ')
                    : 'N/A'}
                </p>

                <div className="adminUrduManagement-actions">
                  <button onClick={() => handleEditUrdu(urdu)} className="adminUrduManagement-button edit">
                    <FaEdit /> Edit
                  </button>
                  <button onClick={() => handleDeleteUrdu(urdu._id)} className="adminUrduManagement-button delete">
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UrduManagement;
