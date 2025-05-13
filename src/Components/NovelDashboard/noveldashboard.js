import React, { useState, useEffect, useRef } from 'react';
import './noveldashboard.css';
import plusIcon from "../Images/Plus.png";
import Modal from 'react-modal';
import closeIcon from '../Images/Close.png';
import { Scrollbars } from 'react-custom-scrollbars-2';
import 'react-quill/dist/quill.snow.css';
import { useNavigate, useParams } from 'react-router-dom';
import AddCollaborators from './AddCollaborators';
import Editor from './Editor';
import Sidebar from './Sidebar';
import socket from './socket'; 
import axios from 'axios';
import { debounce } from 'lodash';
import Header from '../Header/header';
import Sidebars from '../Sidebar/sidebar';

// For accessibility with Modal
Modal.setAppElement('#root');

function NovelDashboard() {
  const { projectId } = useParams(); 
  const navigate = useNavigate();

  // State for chapters, current chapter, notes, user, etc.
  const [chapters, setChapters] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [visible, setVisible] = useState(false);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [user, setUser] = useState(null);
  const [usersInChapter, setUsersInChapter] = useState([]);
  const [loading, setLoading] = useState(false); // Loading state

  const [isAddCollaboratorsOpen, setIsAddCollaboratorsOpen] = useState(false);

  // Ref to track the current chapter ID
  const currentChapterIdRef = useRef(null);

  // Debounced handler to reduce socket emissions
  const debouncedHandleTextChange = useRef(
    debounce((chapterId, value) => {
      if (chapterId) {
        socket.emit('novelsendChanges', { chapterId, content: value });
      }
    }, 300)
  ).current;

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        const response = await axios.get('http://localhost:5001/api/users/profile', {
          headers: { 'x-auth-token': token },
        });
        setUser(response.data);
      } catch (err) {
        console.error('Failed to load user data', err);
      }
    };
    fetchUserData();
  }, [navigate]);

  // Fetch chapters when component mounts or projectId changes
  useEffect(() => {
    if (projectId) {
      setLoading(true);
      fetch(`/api/novels/${projectId}/chapters`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch chapters');
          return res.json();
        })
        .then((data) => {
          setChapters(data);
          // Auto-load first chapter if available
          if (data.length > 0) {
            selectChapterByIndex(0, data);
          } else {
            setLoading(false);
          }
        })
        .catch((error) => {
          console.error(error);
          setLoading(false);
        });
    }
    // Cleanup on projectId change
    return () => {
      if (currentChapterIdRef.current) {
        leaveChapterRoom(currentChapterIdRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // Socket event listeners for collaborative editing
  useEffect(() => {
    // Listen for updated user list
    socket.on('novelupdateUserList', (userList) => {
      setUsersInChapter(userList);
    });

    // Listen for incoming content changes from other users
    socket.on('novelreceiveChanges', ({ chapterId, newContent }) => {
      if (currentChapter && chapterId === currentChapter._id) {
        setCurrentChapter((prev) => ({ ...prev, content: newContent }));
      }
    });

    return () => {
      socket.off('novelupdateUserList');
      socket.off('novelreceiveChanges');
    };
  }, [currentChapter]);

  // Fetch notes when the current chapter changes
  useEffect(() => {
    if (currentChapter && projectId) {
      fetchNotesForChapter(currentChapter._id);
    }
  }, [currentChapter, projectId]);

  const fetchNotesForChapter = (chapterId) => {
    fetch(`/api/novels/${projectId}/chapters/${chapterId}/notes`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch notes');
        return res.json();
      })
      .then((data) => {
        setNotes(data);
      })
      .catch((error) => console.error(error));
  };

  
  const handleCloseCollaborators = () => {
    setIsAddCollaboratorsOpen(false);
  };

  const selectChapterByIndex = (index, chapterArray = chapters) => {
    const chapter = chapterArray[index];
    if (!chapter) return;

    setLoading(true);

    // If currently in another chapter, leave it first
    if (currentChapter && currentChapter._id !== chapter._id) {
      leaveChapterRoom(currentChapter._id);
    }

    fetch(`/api/novels/${projectId}/chapters/${chapter._id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch chapter');
        return res.json();
      })
      .then((data) => {
        setCurrentChapter(data);
        setCurrentPage(index);
        // Update the ref with the new chapter ID
        currentChapterIdRef.current = data._id;
        // Join this new chapter room for collaboration
        joinChapterRoom(data._id);
        fetchNotesForChapter(data._id);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Function to handle chapter click from sidebar
  const handleChapterClick = (index) => {
    selectChapterByIndex(index);
  };

  const joinChapterRoom = (chapterId) => {
    if (user && chapterId) {
      socket.emit('noveljoinProject', { chapterId, username: user.fullname, profileImage: user.profileImage });
    }
  };

  const leaveChapterRoom = (chapterId) => {
    if (user && chapterId) {
      socket.emit('novelleaveProject', { chapterId, username: user.fullname });
      // No need to call socket.leave(chapterId)
      // The server will handle removing the socket from the room
      if (currentChapterIdRef.current === chapterId) {
        currentChapterIdRef.current = null;
      }
    }
  };

  // Handle component unmount to leave the current room
  useEffect(() => {
    return () => {
      if (currentChapterIdRef.current) {
        leaveChapterRoom(currentChapterIdRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTextChange = (value) => {
    if (currentChapter) {
      setCurrentChapter((prevChapter) => ({ ...prevChapter, content: value }));
      // Emit changes to other collaborators via debounced function
      debouncedHandleTextChange(currentChapter._id, value);
    }
  };

  const handleSaveChapter = () => {
    if (currentChapter) {
      fetch(`/api/novels/${projectId}/chapters/${currentChapter._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentChapter),
      })
        .then((res) => {
          if (!res.ok) throw new Error('Failed to save chapter');
          return res.json();
        })
        .then((data) => {
          const updatedChapters = [...chapters];
          updatedChapters[currentPage] = data;
          setChapters(updatedChapters);
          setCurrentChapter(data);
          alert('Chapter saved successfully!');
        })
        .catch((error) => console.error(error));
    }
  };

  const addChapter = (title) => {
    fetch(`/api/novels/${projectId}/chapters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to create chapter');
        return res.json();
      })
      .then((data) => {
        // If currently in another chapter, leave it first
        if (currentChapter) {
          leaveChapterRoom(currentChapter._id);
        }

        const newChapters = [...chapters, data];
        setChapters(newChapters);
        setCurrentPage(newChapters.length - 1);
        setCurrentChapter(data);
        // Update the ref with the new chapter ID
        currentChapterIdRef.current = data._id;
        joinChapterRoom(data._id);
        fetchNotesForChapter(data._id);
      })
      .catch((error) => console.error(error));
  };

 

  const stripHtmlTags = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  const handleSaveNote = () => {
    const plainTextNote = stripHtmlTags(newNote);
    if (plainTextNote.trim() && currentChapter) {
      fetch(`/api/novels/${projectId}/chapters/${currentChapter._id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: plainTextNote }),
      })
        .then((res) => {
          if (!res.ok) throw new Error('Failed to add note');
          return res.json();
        })
        .then((data) => {
          setNotes([...notes, data]);
          setNewNote(''); 
          setVisible(false); 
        })
        .catch((error) => console.error(error));
    } else {
      alert("Note cannot be empty.");
    }
  };

  const handleDeleteNote = (noteId) => {
    if (currentChapter) {
      fetch(`/api/novels/${projectId}/chapters/${currentChapter._id}/notes/${noteId}`, {
        method: 'DELETE',
      })
        .then((res) => {
          if (!res.ok) throw new Error('Failed to delete note');
          const updatedNotes = notes.filter((note) => note._id !== noteId);
          setNotes(updatedNotes);
        })
        .catch((error) => console.error(error));
    }
  };

 


  return (
    <div className="noveldashboard-container">
           <Header/>
           <Sidebars projectId={projectId} />
           
      <div className="noveldashboard-dashboard">
        {/* Sidebar Component */}
        <div className="noveldashboard-sidebar">
          <Sidebar
            className="noveldashboard-sidebar-content"
            chapters={chapters}
            addChapter={addChapter}
            handleChapterClick={handleChapterClick}
          />
        </div>
       

        {/* Editor Component */}
        <div className="noveldashboard-editor">
          <Editor
            text={currentChapter ? currentChapter.content : ''}
            setText={handleTextChange}
          />
        </div>

       

        <div className="noveldashboard-notes">
          <aside className="noveldashboard-notes-section">
            <div className="noveldashboard-notes-header">
              <button className="noveldashboard-add-note" onClick={() => setVisible(true)}>
                <img src={plusIcon} alt="Add Note" className="noveldashboard-plus-icon" />
              </button>

              <Modal
                className="noveldashboard-modal"
                isOpen={visible}
                onRequestClose={() => setVisible(false)}
              >
                <h2>Add Note</h2>
                <button className="noveldashboard-close-button" onClick={() => setVisible(false)}>
                  <img src={closeIcon} alt="Close Note" className="noveldashboard-close-icon" />
                </button>
                <div className="noveldashboard-modal-content">
                <textarea
                    className="noveldashboard-note-text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Write your note here..."
                  />
                </div>
                <button className="novelboard-notes-save-button" onClick={handleSaveNote}>Save</button>
              </Modal>
              <h2>Notes</h2>
            </div>
            <Scrollbars style={{ height: '570px' }}>
              <ul className="noveldashboard-notes-list">
                {notes.map((note) => (
                  <li key={note._id}>
                    {note.content}
                    <button
                      className="noveldashboard-close-note"
                      onClick={() => handleDeleteNote(note._id)}
                    >
                      <img src={closeIcon} alt="Delete Note" className="noveldashboard-close-icon" />
                    </button>
                  </li>
                ))}
              </ul>
            </Scrollbars>

            <div>
              <h3 style={{ textAlign: "center", color: "#333", marginBottom: "5px" }}>Users in this chapter:</h3>
              <div
                style={{
                  maxHeight: "200px",
                  overflowY: "auto",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  backgroundColor: "#fff",
                }}
              >
                <ul
                  style={{
                    listStyleType: "none",
                    padding: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {usersInChapter.map((u, index) => (
                    <li
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "10px",
                        border: "1px solid #eee",
                        borderRadius: "8px",
                        backgroundColor: "#f9f9f9",
                        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      <img
                        src={`http://localhost:5001/${u.profileImage}`}
                        alt={u.username}
                        width="30"
                        height="30"
                        style={{ borderRadius: "50%", marginRight: "10px" }}
                      />
                      <span style={{ fontSize: "14px", color: "#555" }}>{u.username}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>


          </aside>

          <div className="noveldashboard-buttons">
            <button className="noveldashboard-button" onClick={handleSaveChapter}>
              Save
            </button>
            
            {/* Add functionality for Save As and Preview if needed */}
          </div>

          
        </div>
      </div>


{/* AddCollaborators Modal */}
<AddCollaborators 
        isOpen={isAddCollaboratorsOpen} 
        onClose={handleCloseCollaborators} 
        projectId={projectId} 
      />
      
    </div>
  );
}

export default NovelDashboard;



