import React, { useEffect, useState } from "react";
import './ManageStoryProject.css'; // Ensure the CSS is linked correctly
import {  useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Header from '../Header/header';
import Sidebar from '../Sidebar/sidebar';

const ManageStoryProject = () => {
  const { projectId } = useParams(); // Assuming projectId refers to Story ID

  const navigate = useNavigate();

  const [project, setProject] = useState(null); // State to hold project data
  const [chapters, setChapters] = useState([]); // State to hold chapters data
  const [editingProject, setEditingProject] = useState(false);
  const [newChapterData, setNewChapterData] = useState({
    title: '',
    number: '',
    content: '',
    language: 'en',
  });
  const [editingChapterId, setEditingChapterId] = useState(null);
  const [editingChapterData, setEditingChapterData] = useState({
    title: '',
    number: '',
    content: '',
    language: 'en',
  });


  // Fetch project and chapters data when component mounts
  useEffect(() => {
    fetchProject();
    fetchChapters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await axios.get(`/api/stories/${projectId}`);
      setProject(response.data);
    } catch (error) {
      console.error('Error fetching project:', error);
    }
  };

  const fetchChapters = async () => {
    try {
      const response = await axios.get(`/api/stories/${projectId}/chapters`);
      setChapters(response.data);
    } catch (error) {
      console.error('Error fetching chapters:', error);
    }
  };

  const handleEditProjectToggle = () => {
    setEditingProject(!editingProject);
  };

  const handleProjectChange = (e) => {
    const { name, value } = e.target;
    setProject((prevProject) => ({
      ...prevProject,
      [name]: value,
    }));
  };

  const handleSaveProject = async () => {
    try {
      const response = await axios.put(`/api/stories/${projectId}`, project);
      setProject(response.data);
      setEditingProject(false);
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleAddChapter = async () => {
    try {
      const response = await axios.post(`/api/stories/${projectId}/chapters`, newChapterData);
      setChapters([...chapters, response.data]);
      setNewChapterData({
        title: '',
        number: '',
        content: '',
        language: 'en',
      });
    } catch (error) {
      console.error('Error adding chapter:', error);
    }
  };

  const handleDeleteChapter = async (chapterId) => {
    try {
      await axios.delete(`/api/chapters/${chapterId}`);
      setChapters(chapters.filter((chapter) => chapter._id !== chapterId));
    } catch (error) {
      console.error('Error deleting chapter:', error);
    }
  };

  const handleEditChapter = (chapter) => {
    setEditingChapterId(chapter._id);
    setEditingChapterData(chapter);
  };

  const handleCancelEditChapter = () => {
    setEditingChapterId(null);
    setEditingChapterData({
      title: '',
      number: '',
      content: '',
      language: 'en',
    });
  };

  const handleSaveChapter = async () => {
    try {
      const response = await axios.put(`/api/chapters/${editingChapterId}`, editingChapterData);
      setChapters(chapters.map((chapter) => (chapter._id === editingChapterId ? response.data : chapter)));
      setEditingChapterId(null);
      setEditingChapterData({
        title: '',
        number: '',
        content: '',
        language: 'en',
      });
    } catch (error) {
      console.error('Error updating chapter:', error);
    }
  };

  const handleChapterChange = (e) => {
    const { name, value } = e.target;
    setEditingChapterData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleNewChapterChange = (e) => {
    const { name, value } = e.target;
    setNewChapterData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <div className="progress-container">
      
        <Header />

        <Sidebar projectId={projectId} />

      <div className="ManageDashboard-dashboard">
        {project ? (
          <div className="ManageStory-project-details">
            {editingProject ? (
              <div className="ManageStory-project-edit-form">
                <h2>Edit Project Details</h2>
                <label>
                  Title:
                  <input
                    type="text"
                    name="title"
                    value={project.title}
                    onChange={handleProjectChange}
                  />
                </label>
                <label>
                  Description:
                  <textarea
                    name="description"
                    value={project.description}
                    onChange={handleProjectChange}
                  />
                </label>
                <label>
                  Genres (comma separated):
                  <input
                    type="text"
                    name="genres"
                    value={project.genres.join(', ')}
                    onChange={(e) =>
                      setProject((prevProject) => ({
                        ...prevProject,
                        genres: e.target.value.split(',').map((genre) => genre.trim()),
                      }))
                    }
                  />
                </label>
                <label>
                  Collaborators (emails, comma separated):
                  <input
                    type="text"
                    name="collaborators"
                    value={project.collaborators.map((col) => col.email).join(', ')}
                    onChange={(e) =>
                      setProject((prevProject) => ({
                        ...prevProject,
                        collaborators: e.target.value.split(',').map((email) => ({ email: email.trim() })),
                      }))
                    }
                  />
                </label>
                <button onClick={handleSaveProject}>Save</button>
                <button onClick={handleEditProjectToggle}>Cancel</button>
              </div>
            ) : (
              <div className="ManageStory-project-info">
                <h2>{project.title}</h2>
                <p><strong>Description:</strong> {project.description}</p>
                <p><strong>Genres:</strong> {project.genres.join(', ')}</p>
                <p><strong>Collaborators:</strong> {project.collaborators.map((col) => col.email).join(', ')}</p>
                <button onClick={handleEditProjectToggle}>Edit Project Details</button>
              </div>
            )}
          </div>
        ) : (
          <p>Loading project...</p>
        )}
        <div className="ManageStory-chapters">
          <h2>Chapters</h2>
          <table className="ManageStory-chapters-table">
            <thead>
              <tr>
                <th>Number</th>
                <th>Title</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {chapters.map((chapter) => (
                <tr key={chapter._id}>
                  <td>{chapter.number}</td>
                  <td>{chapter.title}</td>
                  <td>
                    <button onClick={() => handleEditChapter(chapter)}>Edit</button>
                    <button onClick={() => handleDeleteChapter(chapter._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {editingChapterId ? (
            <div className="ManageStory-edit-chapter-form">
              <h3>Edit Chapter</h3>
              <label>
                Number:
                <input
                  type="number"
                  name="number"
                  value={editingChapterData.number}
                  onChange={handleChapterChange}
                />
              </label>
              <label>
                Title:
                <input
                  type="text"
                  name="title"
                  value={editingChapterData.title}
                  onChange={handleChapterChange}
                />
              </label>
              <label>
                Content:
                <textarea
                  name="content"
                  value={editingChapterData.content}
                  onChange={handleChapterChange}
                />
              </label>
              <label>
                Language:
                <select
                  name="language"
                  value={editingChapterData.language}
                  onChange={handleChapterChange}
                >
                  <option value="en">English</option>
                  <option value="ur">Urdu</option>
                  {/* Add more languages as needed */}
                </select>
              </label>
              <button onClick={handleSaveChapter}>Save</button>
              <button onClick={handleCancelEditChapter}>Cancel</button>
            </div>
          ) : (
            <div className="ManageStory-add-chapter-form">
              <h3>Add New Chapter</h3>
              <label>
                Number:
                <input
                  type="number"
                  name="number"
                  value={newChapterData.number}
                  onChange={handleNewChapterChange}
                />
              </label>
              <label>
                Title:
                <input
                  type="text"
                  name="title"
                  value={newChapterData.title}
                  onChange={handleNewChapterChange}
                />
              </label>
             
             
              <button onClick={handleAddChapter}>Add Chapter</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageStoryProject;
