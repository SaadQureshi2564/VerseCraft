import React, { useEffect, useState } from "react";
import './ManageNovelProject.css'; // Ensure the CSS is linked correctly
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Header from '../Header/header';
import Sidebar from '../Sidebar/sidebar';


const ManageNovelProject = () => {
  const { projectId } = useParams(); // Assuming projectId refers to Novel ID

  // State variables
  const [novel, setNovel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [editing, setEditing] = useState(false);
  const [editedNovel, setEditedNovel] = useState({});
  
  const [chapters, setChapters] = useState([]);
  const [chapterLoading, setChapterLoading] = useState(true);
  const [chapterError, setChapterError] = useState("");
  
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [chapterForm, setChapterForm] = useState({});

  // Collaborators State
  const [collaborators, setCollaborators] = useState([]);
  const [collaboratorForm, setCollaboratorForm] = useState("");
  const [collaboratorLoading, setCollaboratorLoading] = useState(false);
  const [collaboratorError, setCollaboratorError] = useState("");

  // Fetch novel details
  useEffect(() => {
    const fetchNovel = async () => {
      try {
        const response = await axios.get(`/api/novels/${projectId}`);
        setNovel(response.data);
        setEditedNovel(response.data);
        setCollaborators(response.data.collaborators || []);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch novel details.");
        setLoading(false);
      }
    };

    fetchNovel();
  }, [projectId]);

  // Fetch chapters
  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const response = await axios.get(`/api/novels/${projectId}/chapters`);
        setChapters(response.data);
        setChapterLoading(false);
      } catch (err) {
        setChapterError("Failed to fetch chapters.");
        setChapterLoading(false);
      }
    };

    fetchChapters();
  }, [projectId]);

  // Handle input changes for novel edit form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedNovel(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle author input changes
  const handleAuthorChange = (e) => {
    const { name, value } = e.target;
    setEditedNovel(prevState => ({
      ...prevState,
      author: {
        ...prevState.author,
        [name]: value,
      }
    }));
  };

  // Submit edited novel details
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`/api/novels/${projectId}`, editedNovel);
      setNovel(response.data);
      setCollaborators(response.data.collaborators || []);
      setEditing(false);
      alert("Novel updated successfully!");
    } catch (err) {
      alert("Failed to update novel. Please check your inputs.");
    }
  };

  // Handle adding a new chapter
  const handleAddChapter = async (e) => {
    e.preventDefault();
    if (!newChapterTitle.trim()) {
      alert("Chapter title cannot be empty.");
      return;
    }
    try {
      const response = await axios.post(`/api/novels/${projectId}/chapters`, {
        title: newChapterTitle.trim(),
      });
      setChapters([...chapters, response.data]);
      setNewChapterTitle("");
      alert("Chapter added successfully!");
    } catch (err) {
      alert("Failed to add chapter.");
    }
  };

  // Handle deleting a chapter
  const handleDeleteChapter = async (chapterId) => {
    if (!window.confirm("Are you sure you want to delete this chapter?")) return;
    try {
      await axios.delete(`/api/novels/${projectId}/chapters/${chapterId}`);
      setChapters(chapters.filter(chap => chap._id !== chapterId));
      alert("Chapter deleted successfully!");
    } catch (err) {
      alert("Failed to delete chapter.");
    }
  };

  // Handle editing a chapter
  const handleEditChapter = (chapter) => {
    setChapterForm({
      ...chapterForm,
      [chapter._id]: { title: chapter.title, content: chapter.content, summary: chapter.summary },
    });
  };

  // Handle chapter form input changes
  const handleChapterInputChange = (e, chapterId) => {
    const { name, value } = e.target;
    setChapterForm(prevState => ({
      ...prevState,
      [chapterId]: {
        ...prevState[chapterId],
        [name]: value,
      }
    }));
  };

  // Submit edited chapter
  const handleSubmitChapterEdit = async (e, chapterId) => {
    e.preventDefault();
    const updatedChapter = chapterForm[chapterId];
    try {
      const response = await axios.put(`/api/novels/${projectId}/chapters/${chapterId}`, updatedChapter);
      setChapters(chapters.map(chap => chap._id === chapterId ? response.data : chap));
      setChapterForm(prevState => {
        const newState = { ...prevState };
        delete newState[chapterId];
        return newState;
      });
      alert("Chapter updated successfully!");
    } catch (err) {
      alert("Failed to update chapter.");
    }
  };

  // Handle adding a collaborator
  const handleAddCollaborator = async (e) => {
    e.preventDefault();
    const email = collaboratorForm.trim().toLowerCase();
    if (!email) {
      setCollaboratorError("Email cannot be empty.");
      return;
    }
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      setCollaboratorError("Invalid email format.");
      return;
    }
    if (collaborators.some(collab => collab.email === email)) {
      setCollaboratorError("Collaborator already exists.");
      return;
    }

    setCollaboratorLoading(true);
    setCollaboratorError("");

    try {
      const updatedCollaborators = [...collaborators, { email }];
      const updatedNovel = { ...editedNovel, collaborators: updatedCollaborators };
      const response = await axios.put(`/api/novels/${projectId}`, updatedNovel);
      setNovel(response.data);
      setCollaborators(response.data.collaborators || []);
      setCollaboratorForm("");
      alert("Collaborator added successfully!");
    } catch (err) {
      setCollaboratorError("Failed to add collaborator.");
    } finally {
      setCollaboratorLoading(false);
    }
  };

  // Handle removing a collaborator
  const handleRemoveCollaborator = async (email) => {
    if (!window.confirm(`Are you sure you want to remove collaborator: ${email}?`)) return;

    setCollaboratorLoading(true);
    setCollaboratorError("");

    try {
      const updatedCollaborators = collaborators.filter(collab => collab.email !== email);
      const updatedNovel = { ...editedNovel, collaborators: updatedCollaborators };
      const response = await axios.put(`/api/novels/${projectId}`, updatedNovel);
      setNovel(response.data);
      setCollaborators(response.data.collaborators || []);
      alert("Collaborator removed successfully!");
    } catch (err) {
      setCollaboratorError("Failed to remove collaborator.");
    } finally {
      setCollaboratorLoading(false);
    }
  };



  if (loading) return <div className="ManageNovel-loader">Loading novel details...</div>;
  if (error) return <div className="ManageNovel-error">{error}</div>;

  return (
    <div className="progress-container">
      <Header/>
      <Sidebar projectId={projectId} />

      <div className="ManageDashboard-dashboard">
        {/* Novel Edit Section */}
        <div className="ManageNovel-edit-section">
          <h2>Manage Novel Project</h2>
          {editing ? (
            <form onSubmit={handleEditSubmit} className="ManageNovel-edit-form">
              <div className="ManageNovel-form-group">
                <label htmlFor="title">Title:</label>
                <input 
                  type="text" 
                  id="title" 
                  name="title" 
                  value={editedNovel.title || ''} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              
              <div className="ManageNovel-form-group">
                <label htmlFor="authorName">Author Name:</label>
                <input 
                  type="text" 
                  id="authorName" 
                  name="name" 
                  value={editedNovel.author.name || ''} 
                  onChange={handleAuthorChange} 
                  required 
                />
              </div>

              <div className="ManageNovel-form-group">
                <label htmlFor="authorEmail">Author Email:</label>
                <input 
                  type="email" 
                  id="authorEmail" 
                  name="email" 
                  value={editedNovel.author.email || ''} 
                  onChange={handleAuthorChange} 
                  required 
                />
              </div>

              <div className="ManageNovel-form-group">
                <label htmlFor="description">Description:</label>
                <textarea 
                  id="description" 
                  name="description" 
                  value={editedNovel.description || ''} 
                  onChange={handleInputChange} 
                  required 
                ></textarea>
              </div>

              <div className="ManageNovel-form-group">
                <label htmlFor="genres">Genres (comma separated):</label>
                <input 
                  type="text" 
                  id="genres" 
                  name="genres" 
                  value={editedNovel.genres ? editedNovel.genres.join(', ') : ''} 
                  onChange={(e) => setEditedNovel({
                    ...editedNovel,
                    genres: e.target.value.split(',').map(genre => genre.trim())
                  })}
                />
              </div>

              <div className="ManageNovel-form-group">
                <label htmlFor="chapters">Chapters:</label>
                <input 
                  type="number" 
                  id="chapters" 
                  name="chapters" 
                  value={editedNovel.chapters || 0} 
                  onChange={handleInputChange} 
                  min="0"
                />
              </div>

              <div className="ManageNovel-form-actions">
                <button type="submit" className="ManageNovel-save-button">Save</button>
                <button type="button" className="ManageNovel-cancel-button" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </form>
          ) : (
            <div className="ManageNovel-details">
              <h3>{novel.title}</h3>
              <p><strong>Author:</strong> {novel.author.name} ({novel.author.email})</p>
              <p><strong>Description:</strong> {novel.description}</p>
              <p><strong>Genres:</strong> {novel.genres.join(', ')}</p>
              <p><strong>Chapters:</strong> {chapters.length}</p>
              <button className="ManageNovel-edit-button" onClick={() => setEditing(true)}>Edit Novel</button>
            </div>
          )}
        </div>

        {/* Collaborators Management Section */}
        <div className="ManageNovel-collaborators-management-section">
          <h2>Collaborators</h2>
          <div className="ManageNovel-collaborators-list">
            {collaborators.length === 0 ? (
              <p>No collaborators added yet.</p>
            ) : (
              <ul>
                {collaborators.map((collab, index) => (
                  <li key={index} className="ManageNovel-collaborator-item">
                    {collab.email}
                    <button 
                      className="ManageNovel-remove-collaborator-button" 
                      onClick={() => handleRemoveCollaborator(collab.email)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Add Collaborator Form */}
          <div className="ManageNovel-add-collaborator-section">
            <h3>Add Collaborator</h3>
            <form onSubmit={handleAddCollaborator} className="ManageNovel-add-collaborator-form">
              <div className="ManageNovel-form-group">
                <label htmlFor="collaboratorEmail">Collaborator Email:</label>
                <input 
                  type="email" 
                  id="collaboratorEmail" 
                  value={collaboratorForm} 
                  onChange={(e) => setCollaboratorForm(e.target.value)} 
                  required 
                />
              </div>
              {collaboratorError && <p className="ManageNovel-error-message">{collaboratorError}</p>}
              <button type="submit" className="ManageNovel-add-collaborator-button" disabled={collaboratorLoading}>
                {collaboratorLoading ? 'Adding...' : 'Add Collaborator'}
              </button>
            </form>
          </div>
        </div>

        {/* Chapters Management Section */}
        <div className="ManageNovel-chapters-management-section">
          <h2>Chapters</h2>
          {chapterLoading ? (
            <div className="ManageNovel-loader">Loading chapters...</div>
          ) : chapterError ? (
            <div className="ManageNovel-error">{chapterError}</div>
          ) : (
            <div className="ManageNovel-chapters-list">
              {chapters.length === 0 ? (
                <p>No chapters available. Add a new chapter!</p>
              ) : (
                chapters.map(chapter => (
                  <div key={chapter._id} className="ManageNovel-chapter-item">
                    {chapterForm[chapter._id] ? (
                      <form onSubmit={(e) => handleSubmitChapterEdit(e, chapter._id)} className="ManageNovel-chapter-edit-form">
                        <div className="ManageNovel-form-group">
                          <label>Title:</label>
                          <input 
                            type="text" 
                            name="title" 
                            value={chapterForm[chapter._id].title} 
                            onChange={(e) => handleChapterInputChange(e, chapter._id)} 
                            required 
                          />
                        </div>
                        <div className="ManageNovel-form-group">
                          <label>Content:</label>
                          <textarea 
                            name="content" 
                            value={chapterForm[chapter._id].content} 
                            onChange={(e) => handleChapterInputChange(e, chapter._id)} 
                          ></textarea>
                        </div>
                        <div className="ManageNovel-form-group">
                          <label>Summary:</label>
                          <textarea 
                            name="summary" 
                            value={chapterForm[chapter._id].summary} 
                            onChange={(e) => handleChapterInputChange(e, chapter._id)} 
                          ></textarea>
                        </div>
                        <div className="ManageNovel-form-actions">
                          <button type="submit" className="ManageNovel-save-button">Save</button>
                          <button type="button" className="ManageNovel-cancel-button" onClick={() => {
                            setChapterForm(prevState => {
                              const newState = { ...prevState };
                              delete newState[chapter._id];
                              return newState;
                            });
                          }}>Cancel</button>
                        </div>
                      </form>
                    ) : (
                      <div className="ManageNovel-chapter-details">
                        <h4>Chapter {chapter.number}: {chapter.title}</h4>
                        <p><strong>Summary:</strong> {chapter.summary}</p>
                        <div className="ManageNovel-chapter-actions">
                          <button className="ManageNovel-edit-button" onClick={() => handleEditChapter(chapter)}>Edit</button>
                          <button className="ManageNovel-delete-button" onClick={() => handleDeleteChapter(chapter._id)}>Delete</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Add New Chapter Form */}
          <div className="ManageNovel-add-chapter-section">
            <h3>Add New Chapter</h3>
            <form onSubmit={handleAddChapter} className="ManageNovel-add-chapter-form">
              <div className="ManageNovel-form-group">
                <label htmlFor="newChapterTitle">Chapter Title:</label>
                <input 
                  type="text" 
                  id="newChapterTitle" 
                  value={newChapterTitle} 
                  onChange={(e) => setNewChapterTitle(e.target.value)} 
                  required 
                />
              </div>
              <button type="submit" className="ManageNovel-add-button">Add Chapter</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageNovelProject;
