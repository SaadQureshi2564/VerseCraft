// src/components/NovelManagement.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash, FaEdit, FaSave, FaTimes } from 'react-icons/fa';

const NovelManagement = () => {
  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editNovelId, setEditNovelId] = useState(null);
  const [editNovelData, setEditNovelData] = useState({});
  const [newNovel, setNewNovel] = useState({
    shortId: '',
    title: '',
    description: '',
    genres: [],
    tags: [],
    authorEmail: '',
    textfileId: '',
    collaborators: [],
  });

  useEffect(() => {
    fetchNovels();
  }, []);

  const fetchNovels = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/admin/novels');
      setNovels(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch novels. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNovel = async (id) => {
    if (!window.confirm('Are you sure you want to delete this novel?')) return;
    try {
      await axios.delete(`http://localhost:5001/api/admin/novels/${id}`);
      setNovels(novels.filter((n) => n._id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete novel. Please try again.');
    }
  };

  const handleEditNovel = (novel) => {
    setEditNovelId(novel._id);
    setEditNovelData({
      ...novel,
      genres: novel.genres || [],
      tags: novel.tags || [],
      collaborators: novel.collaborators || [],
    });
  };

  const handleCancelEditNovel = () => {
    setEditNovelId(null);
    setEditNovelData({});
  };

  const handleSaveNovel = async (id) => {
    try {
      const response = await axios.put(
        `http://localhost:5001/api/admin/novels/${id}`,
        editNovelData
      );
      setNovels(novels.map((novel) => (novel._id === id ? response.data : novel)));
      setEditNovelId(null);
      setEditNovelData({});
    } catch (err) {
      console.error(err);
      alert('Failed to update novel. Please check the input and try again.');
    }
  };

  const handleChange = (e, field) => {
    setEditNovelData({
      ...editNovelData,
      [field]: e.target.value,
    });
  };

  const handleAddNovel = async () => {
    try {
      const { shortId, title, description, authorEmail } = newNovel;
      if (!shortId || !title || !description || !authorEmail) {
        setError('Please fill all required fields before adding a new novel.');
        return;
      }

      const response = await axios.post('http://localhost:5001/api/admin/novels', newNovel);
      setNovels([...novels, response.data]);
      setNewNovel({
        shortId: '',
        title: '',
        description: '',
        genres: [],
        tags: [],
        authorEmail: '',
        textfileId: '',
        collaborators: [],
      });
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to add new novel.');
    }
  };

  if (loading) {
    return <div className="adminNovelManagement-loading">Loading...</div>;
  }

  return (
    <div className="adminNovelManagement-container">
      <h2 className="adminNovelManagement-title">Manage Novels</h2>

      {error && <div className="adminNovelManagement-error">{error}</div>}

      {/* Form for creating a new novel */}
      <div className="adminNovelManagement-form-section">
        <h3 className="adminNovelManagement-subtitle">Create a New Novel</h3>
        <div className="adminNovelManagement-form-group">
          <label htmlFor="shortId">Short ID (required):</label>
          <input
            type="text"
            id="shortId"
            value={newNovel.shortId}
            onChange={(e) => setNewNovel({ ...newNovel, shortId: e.target.value })}
            className="adminNovelManagement-input"
            placeholder="Enter Short ID"
          />
        </div>
        <div className="adminNovelManagement-form-group">
          <label htmlFor="title">Title (required):</label>
          <input
            type="text"
            id="title"
            value={newNovel.title}
            onChange={(e) => setNewNovel({ ...newNovel, title: e.target.value })}
            className="adminNovelManagement-input"
            placeholder="Enter Title"
          />
        </div>
        <div className="adminNovelManagement-form-group">
          <label htmlFor="description">Description (required):</label>
          <textarea
            id="description"
            value={newNovel.description}
            onChange={(e) => setNewNovel({ ...newNovel, description: e.target.value })}
            className="adminNovelManagement-textarea"
            placeholder="Enter Description"
          />
        </div>
        <div className="adminNovelManagement-form-group">
          <label htmlFor="genres">Genres (comma-separated):</label>
          <input
            type="text"
            id="genres"
            value={newNovel.genres.join(', ')}
            onChange={(e) =>
              setNewNovel({
                ...newNovel,
                genres: e.target.value ? e.target.value.split(',').map((g) => g.trim()) : [],
              })
            }
            className="adminNovelManagement-input"
            placeholder="e.g., Fantasy, Adventure"
          />
        </div>
        <div className="adminNovelManagement-form-group">
          <label htmlFor="tags">Tags (comma-separated):</label>
          <input
            type="text"
            id="tags"
            value={newNovel.tags.join(', ')}
            onChange={(e) =>
              setNewNovel({
                ...newNovel,
                tags: e.target.value ? e.target.value.split(',').map((t) => t.trim()) : [],
              })
            }
            className="adminNovelManagement-input"
            placeholder="e.g., Epic, Bestseller"
          />
        </div>
        <div className="adminNovelManagement-form-group">
          <label htmlFor="authorEmail">Author Email (required):</label>
          <input
            type="email"
            id="authorEmail"
            value={newNovel.authorEmail}
            onChange={(e) => setNewNovel({ ...newNovel, authorEmail: e.target.value })}
            className="adminNovelManagement-input"
            placeholder="Enter Author Email"
          />
        </div>
        <div className="adminNovelManagement-form-group">
          <label htmlFor="textfileId">Textfile ID:</label>
          <input
            type="text"
            id="textfileId"
            value={newNovel.textfileId}
            onChange={(e) => setNewNovel({ ...newNovel, textfileId: e.target.value })}
            className="adminNovelManagement-input"
            placeholder="Enter Textfile ID"
          />
        </div>
        <div className="adminNovelManagement-form-group">
          <label htmlFor="collaborators">Collaborators' Emails (comma-separated):</label>
          <input
            type="text"
            id="collaborators"
            value={newNovel.collaborators.map((c) => c.email).join(', ')}
            onChange={(e) =>
              setNewNovel({
                ...newNovel,
                collaborators: e.target.value
                  ? e.target.value.split(',').map((email) => ({ email: email.trim() }))
                  : [],
              })
            }
            className="adminNovelManagement-input"
            placeholder="e.g., collaborator1@example.com, collaborator2@example.com"
          />
        </div>

        <button onClick={handleAddNovel} className="adminNovelManagement-button add">
          Add Novel
        </button>
      </div>

      <div className="adminNovelManagement-list">
        {novels.map((novel) => (
          <div className="adminNovelManagement-novel-card" key={novel._id}>
            {editNovelId === novel._id ? (
              <div className="adminNovelManagement-edit-mode">
                <div className="adminNovelManagement-form-group">
                  <label htmlFor={`shortId-${novel._id}`}>Short ID:</label>
                  <input
                    type="text"
                    id={`shortId-${novel._id}`}
                    value={editNovelData.shortId || ''}
                    onChange={(e) => handleChange(e, 'shortId')}
                    className="adminNovelManagement-input"
                  />
                </div>
                <div className="adminNovelManagement-form-group">
                  <label htmlFor={`title-${novel._id}`}>Title:</label>
                  <input
                    type="text"
                    id={`title-${novel._id}`}
                    value={editNovelData.title || ''}
                    onChange={(e) => handleChange(e, 'title')}
                    className="adminNovelManagement-input"
                  />
                </div>
                <div className="adminNovelManagement-form-group">
                  <label htmlFor={`description-${novel._id}`}>Description:</label>
                  <textarea
                    id={`description-${novel._id}`}
                    value={editNovelData.description || ''}
                    onChange={(e) => handleChange(e, 'description')}
                    className="adminNovelManagement-textarea"
                  />
                </div>
                <div className="adminNovelManagement-form-group">
                  <label htmlFor={`genres-${novel._id}`}>Genres (comma-separated):</label>
                  <input
                    type="text"
                    id={`genres-${novel._id}`}
                    value={(editNovelData.genres || []).join(', ')}
                    onChange={(e) =>
                      setEditNovelData({
                        ...editNovelData,
                        genres: e.target.value
                          ? e.target.value.split(',').map((g) => g.trim())
                          : [],
                      })
                    }
                    className="adminNovelManagement-input"
                  />
                </div>
                <div className="adminNovelManagement-form-group">
                  <label htmlFor={`tags-${novel._id}`}>Tags (comma-separated):</label>
                  <input
                    type="text"
                    id={`tags-${novel._id}`}
                    value={(editNovelData.tags || []).join(', ')}
                    onChange={(e) =>
                      setEditNovelData({
                        ...editNovelData,
                        tags: e.target.value
                          ? e.target.value.split(',').map((t) => t.trim())
                          : [],
                      })
                    }
                    className="adminNovelManagement-input"
                  />
                </div>
                <div className="adminNovelManagement-form-group">
                  <label htmlFor={`authorEmail-${novel._id}`}>Author Email:</label>
                  <input
                    type="email"
                    id={`authorEmail-${novel._id}`}
                    value={editNovelData.authorEmail || ''}
                    onChange={(e) => handleChange(e, 'authorEmail')}
                    className="adminNovelManagement-input"
                  />
                </div>
                <div className="adminNovelManagement-form-group">
                  <label htmlFor={`textfileId-${novel._id}`}>Textfile ID:</label>
                  <input
                    type="text"
                    id={`textfileId-${novel._id}`}
                    value={editNovelData.textfileId || ''}
                    onChange={(e) => handleChange(e, 'textfileId')}
                    className="adminNovelManagement-input"
                  />
                </div>
                <div className="adminNovelManagement-form-group">
                  <label htmlFor={`collaborators-${novel._id}`}>
                    Collaborators' Emails (comma-separated):
                  </label>
                  <input
                    type="text"
                    id={`collaborators-${novel._id}`}
                    value={(editNovelData.collaborators || []).map((c) => c.email).join(', ')}
                    onChange={(e) =>
                      setEditNovelData({
                        ...editNovelData,
                        collaborators: e.target.value
                          ? e.target.value.split(',').map((email) => ({ email: email.trim() }))
                          : [],
                      })
                    }
                    className="adminNovelManagement-input"
                  />
                </div>

                <div className="adminNovelManagement-actions">
                  <button
                    onClick={() => handleSaveNovel(novel._id)}
                    className="adminNovelManagement-button save"
                  >
                    <FaSave /> Save
                  </button>
                  <button
                    onClick={handleCancelEditNovel}
                    className="adminNovelManagement-button cancel"
                  >
                    <FaTimes /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="adminNovelManagement-novel-content">
                <h3 className="adminNovelManagement-novel-title">{novel.title}</h3>
                <p className="adminNovelManagement-novel-shortId">
                  <strong>Short ID:</strong> {novel.shortId}
                </p>
                <p className="adminNovelManagement-novel-description">{novel.description}</p>
                <p className="adminNovelManagement-novel-genres">
                  <strong>Genres:</strong> {(novel.genres || []).join(', ') || 'N/A'}
                </p>
                <p className="adminNovelManagement-novel-tags">
                  <strong>Tags:</strong> {(novel.tags || []).join(', ') || 'N/A'}
                </p>
                <p className="adminNovelManagement-novel-authorEmail">
                  <strong>Author Email:</strong> {novel.authorEmail}
                </p>
                <p className="adminNovelManagement-novel-textfileId">
                  <strong>Textfile ID:</strong> {novel.textfileId || 'N/A'}
                </p>
                <p className="adminNovelManagement-novel-collaborators">
                  <strong>Collaborators:</strong>{' '}
                  {novel.collaborators?.length
                    ? novel.collaborators.map((c) => c.email).join(', ')
                    : 'N/A'}
                </p>

                <div className="adminNovelManagement-actions">
                  <button
                    onClick={() => handleEditNovel(novel)}
                    className="adminNovelManagement-button edit"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteNovel(novel._id)}
                    className="adminNovelManagement-button delete"
                  >
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

export default NovelManagement;
