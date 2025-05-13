// src/components/StoryManagement.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash, FaEdit, FaSave, FaTimes } from 'react-icons/fa';

const StoryManagement = () => {
  const [stories, setStories] = useState([]);
  const [editStory, setEditStory] = useState(null);
  const [newStory, setNewStory] = useState({
    title: '',
    author: { name: '', email: '' },
    description: '',
    genres: [],
    collaborators: [],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/stories');
        setStories(response.data);
      } catch (err) {
        setError('Failed to load stories');
      } finally {
        setLoading(false);
      }
    };
    fetchStories();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this story?')) return;
    try {
      await axios.delete(`http://localhost:5001/api/stories/${id}`);
      setStories(stories.filter((story) => story._id !== id));
    } catch (err) {
      setError('Failed to delete story');
    }
  };

  const handleSave = async () => {
    try {
      const response = await axios.put(
        `http://localhost:5001/api/stories/${editStory._id}`,
        editStory
      );
      setStories(stories.map((s) => (s._id === editStory._id ? response.data : s)));
      setEditStory(null);
    } catch (err) {
      setError('Failed to save story');
      console.error(err.response ? err.response.data : err.message);
    }
  };

  const handleCancel = () => {
    setEditStory(null);
  };

  const handleChange = (e, field) => {
    if (field.startsWith('author.')) {
      const [, subField] = field.split('.');
      setEditStory({
        ...editStory,
        author: {
          ...editStory.author,
          [subField]: e.target.value,
        },
      });
    } else {
      setEditStory({
        ...editStory,
        [field]: e.target.value,
      });
    }
  };

  const handleAddStory = async () => {
    try {
      if (
        !newStory.title ||
        !newStory.author.name ||
        !newStory.author.email ||
        !newStory.description
      ) {
        setError('Please fill all required fields before adding a new story.');
        return;
      }

      const response = await axios.post('http://localhost:5001/api/stories', newStory);
      setStories([...stories, response.data]);
      setNewStory({
        title: '',
        author: { name: '', email: '' },
        description: '',
        genres: [],
        collaborators: [],
      });
      setError('');
    } catch (err) {
      setError('Failed to add new story');
    }
  };

  return (
    <div className="adminStoryManagemente-container">
      <h2 className="adminStoryManagemente-title">Story Management</h2>

      {error && <div className="adminStoryManagemente-error">{error}</div>}

      {/* Form for creating a new story */}
      <div className="adminStoryManagemente-form-section">
        <h3 className="adminStoryManagemente-subtitle">Create a New Story</h3>
        <div className="adminStoryManagemente-form-group">
          <label>Title (required):</label>
          <input
            type="text"
            value={newStory.title}
            onChange={(e) => setNewStory({ ...newStory, title: e.target.value })}
            className="adminStoryManagemente-input"
          />
        </div>
        <div className="adminStoryManagemente-form-group">
          <label>Author Name (required):</label>
          <input
            type="text"
            value={newStory.author.name}
            onChange={(e) =>
              setNewStory({ ...newStory, author: { ...newStory.author, name: e.target.value } })
            }
            className="adminStoryManagemente-input"
          />
        </div>
        <div className="adminStoryManagemente-form-group">
          <label>Author Email (required):</label>
          <input
            type="email"
            value={newStory.author.email}
            onChange={(e) =>
              setNewStory({ ...newStory, author: { ...newStory.author, email: e.target.value } })
            }
            className="adminStoryManagemente-input"
          />
        </div>
        <div className="adminStoryManagemente-form-group">
          <label>Description (required):</label>
          <textarea
            value={newStory.description}
            onChange={(e) => setNewStory({ ...newStory, description: e.target.value })}
            className="adminStoryManagemente-textarea"
          />
        </div>

        <button onClick={handleAddStory} className="adminStoryManagemente-button add">
          Add Story
        </button>
      </div>

      {loading && <div className="adminStoryManagemente-loading">Loading stories...</div>}

      <div className="adminStoryManagemente-list">
        {stories.map((story) => (
          <div className="adminStoryManagemente-story-card" key={story._id}>
            {editStory && editStory._id === story._id ? (
              <div className="adminStoryManagemente-edit-mode">
                <div className="adminStoryManagemente-form-group">
                  <label>Title:</label>
                  <input
                    type="text"
                    value={editStory.title}
                    onChange={(e) => handleChange(e, 'title')}
                    className="adminStoryManagemente-input"
                  />
                </div>
                <div className="adminStoryManagemente-form-group">
                  <label>Author Name:</label>
                  <input
                    type="text"
                    value={editStory.author.name}
                    onChange={(e) => handleChange(e, 'author.name')}
                    className="adminStoryManagemente-input"
                  />
                </div>
                <div className="adminStoryManagemente-form-group">
                  <label>Author Email:</label>
                  <input
                    type="email"
                    value={editStory.author.email}
                    onChange={(e) => handleChange(e, 'author.email')}
                    className="adminStoryManagemente-input"
                  />
                </div>
                <div className="adminStoryManagemente-form-group">
                  <label>Description:</label>
                  <textarea
                    value={editStory.description}
                    onChange={(e) => handleChange(e, 'description')}
                    className="adminStoryManagemente-textarea"
                  />
                </div>

                <div className="adminStoryManagemente-actions">
                  <button onClick={handleSave} className="adminStoryManagemente-button save">
                    <FaSave /> Save
                  </button>
                  <button onClick={handleCancel} className="adminStoryManagemente-button cancel">
                    <FaTimes /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="adminStoryManagemente-story-content">
                <h3 className="adminStoryManagemente-story-title">{story.title}</h3>
                <p className="adminStoryManagemente-story-author">
                  Author: {story.author.name} ({story.author.email})
                </p>
                <p className="adminStoryManagemente-story-description">{story.description}</p>

                <div className="adminStoryManagemente-actions">
                  <button
                    onClick={() => setEditStory(story)}
                    className="adminStoryManagemente-button edit"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(story._id)}
                    className="adminStoryManagemente-button delete"
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

export default StoryManagement;
