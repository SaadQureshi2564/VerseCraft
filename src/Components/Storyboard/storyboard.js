import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './storyboard.css';
import closeIcon from '../Images/Close.png';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Scrollbars } from 'react-custom-scrollbars-2';
import Modal from 'react-modal';
import plusIcon from "../Images/Plus.png";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddCollaborators from './AddCollaborators';
import axios from 'axios';
import socket from './socket';
import crosshover from "../Images/cross-hover.png";
import crossNohover from "../Images/cross-no-hover.png";
import Header from '../Header/header';
import Sidebar from '../Sidebar/sidebar';

Modal.setAppElement('#root');

function Storyboard() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const [value, setValue] = useState('');
    const [language, setLanguage] = useState('en');

    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState('');
    const [isNotesModalVisible, setIsNotesModalVisible] = useState(false);

    const [chapters, setChapters] = useState([]);
    const [isChapterModalVisible, setIsChapterModalVisible] = useState(false);
    const [newChapter, setNewChapter] = useState({ number: "", title: "" });
    const [selectedChapterId, setSelectedChapterId] = useState(null);

    const [projectData, setProjectData] = useState(null);

    const [isAddCollaboratorsOpen, setIsAddCollaboratorsOpen] = useState(false);
    const [usersInChapter, setUsersInChapter] = useState([]);

    const [isVersionsModalVisible, setIsVersionsModalVisible] = useState(false);
    const [versions, setVersions] = useState([]);

    const quillRef = useRef(null);

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
                console.error(err);
                setError('Failed to load user data');
            } finally {
                setLoading(false);
            }
        };

        const fetchProjectData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`/api/stories/${projectId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('Story not found.');
                    } else {
                        throw new Error('Network response was not ok');
                    }
                }
                const data = await response.json();
                setProjectData(data);
            } catch (error) {
                console.error("Failed to fetch project data:", error);
               // toast.error(`Failed to fetch project data: ${error.message}`);
            }
        };

        if (projectId) {
            fetchUserData();
            fetchProjectData();
        }
    }, [projectId]);

    useEffect(() => {
        const fetchChapters = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`/api/stories/${projectId}/chapters`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('Chapters not found.');
                    } else {
                        throw new Error('Failed to fetch chapters');
                    }
                }
                const data = await response.json();
                setChapters(data);
            } catch (error) {
                console.error("Error fetching chapters:", error);
               // toast.error(`Error fetching chapters: ${error.message}`);
            }
        };

        if (projectId) {
            fetchChapters();
        }
    }, [projectId]);

    useEffect(() => {
        socket.on('updateUserList', (userList) => {
            setUsersInChapter(userList);
        });

        socket.on('receiveChanges', ({ chapterId, newContent }) => {
            if (chapterId === selectedChapterId) {
                setValue(newContent);
            }
        });

        return () => {
            socket.off('updateUserList');
            socket.off('receiveChanges');
        };
    }, [selectedChapterId]);

    const handleSelectChapter = async (chapterId) => {
        try {
            setSelectedChapterId(chapterId);

            const token = localStorage.getItem('token');
            const response = await fetch(`/api/chapters/${chapterId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch chapter content');
            }

            const chapterData = await response.json();
            setValue(chapterData.content);
            setLanguage(chapterData.language || 'en');
            fetchNotes(chapterId);   
            socket.emit('joinProject', { chapterId, username: user.fullname, profileImage: user.profileImage });
        } catch (error) {
            console.error('Error fetching chapter content:', error);
          //  toast.error(`Error fetching chapter content: ${error.message}`);
        }
    };

    const handleContentChange = (newContent) => {
        setValue(newContent);
        if (selectedChapterId) {
            socket.emit('sendChanges', { chapterId: selectedChapterId, content: newContent });
        } else {
            console.error('No chapter selected for emitting changes');
        }
    };

    const handleLeaveChapter = () => {
        if (selectedChapterId) {
            socket.emit('leaveProject', { chapterId: selectedChapterId, username: user.fullname });
            setSelectedChapterId(null);
            setValue('');
            setUsersInChapter([]);
           // toast.info('You have left the chapter');
        }
    };

    const fetchNotes = async (chapterId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/stories/${projectId}/chapters/${chapterId}/notes`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch notes');
            }
            const data = await response.json();
            setNotes(data);
        } catch (error) {
            console.error("Error fetching notes:", error);
          //  toast.error(`Error fetching notes: ${error.message}`);
        }
    };

    const renderThumb = ({ style, ...props }) => {
        const thumbStyle = {
            backgroundColor: '#F47D4B',
            borderRadius: '10px',
            opacity: 0,
            transition: 'opacity 0.3s'
        };
        return <div style={{ ...style, ...thumbStyle }} {...props} className="custom-thumb" />;
    };

    const renderTrack = ({ style, ...props }) => {
        const trackStyle = {
            backgroundColor: '#191B30',
            borderRadius: '10px',
            opacity: 0,
            transition: 'opacity 0.3s'
        };
        return <div style={{ ...style, ...trackStyle }} {...props} className="custom-track" />;
    };

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

    const toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video', 'formula'],
        [{ 'header': 1 }, { 'header': 2 }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
        [{ 'script': 'sub' }, { 'script': 'super' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
        [{ 'direction': 'rtl' }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'font': [] }],
        [{ 'align': [] }],
        ['clean']
    ];

    const modules = {
        toolbar: toolbarOptions,
    };

    const placeholderText = language === 'en' ? "Write your content here..." : "اپنا مواد یہاں لکھیں";

    const handleSaveNote = async () => {
        if (newNote.trim()) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`/api/stories/${projectId}/chapters/${selectedChapterId}/notes`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ content: newNote }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to add note');
                }

                const createdNote = await response.json();
                setNotes([createdNote, ...notes]);
                setNewNote('');
                setIsNotesModalVisible(false);
                //toast.success("Note added successfully!");
            } catch (error) {
                console.error("Error adding note:", error);
                //toast.error(`Error adding note: ${error.message}`);
            }
        } else {
            //toast.warn("Note cannot be empty.");
        }
    };

    const handleDeleteNote = async (noteId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/notes/${noteId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete note');
            }

            setNotes(notes.filter(note => note._id !== noteId));
           // toast.info("Note deleted.");
        } catch (error) {
            console.error("Error deleting note:", error);
            //toast.error(`Error deleting note: ${error.message}`);
        }
    };

    const handleAddChapter = () => {
        setIsChapterModalVisible(true);
    };

    const handleChapterSubmit = async () => {
        const { number, title } = newChapter;
        if (number.trim() === "" || title.trim() === "") {
          //  toast.warn("Please provide both chapter number and title.");
            return;
        }

        const isDuplicate = chapters.some(chapter => chapter.number === Number(number.trim()));
        if (isDuplicate) {
          //  toast.error("Chapter number already exists. Please choose a different number.");
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/stories/${projectId}/chapters`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    number: Number(number.trim()),
                    title: title.trim(),
                    content: '',
                    language: language,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create chapter');
            }

            const createdChapter = await response.json();
            setChapters([...chapters, createdChapter]);
            setNewChapter({ number: "", title: "" });
            setIsChapterModalVisible(false);
           // toast.success("Chapter added successfully!");
        } catch (error) {
            console.error("Error creating chapter:", error);
           // toast.error(`Error creating chapter: ${error.message}`);
        }
    };

    const handleCancelChapter = () => {
        setNewChapter({ number: "", title: "" });
        setIsChapterModalVisible(false);
    };

    const handleSaveChapter = async () => {
        if (!selectedChapterId) {
          //  toast.warn("Please select a chapter to save.");
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/chapters/${selectedChapterId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    content: value,
                    language: language,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save chapter');
            }

            const updatedChapter = await response.json();
            setChapters(chapters.map(chapter => chapter._id === selectedChapterId ? updatedChapter : chapter));
           // toast.success("Chapter saved successfully!");

            socket.emit('editChapter', {
                chapterId: selectedChapterId,
                content: updatedChapter.content,
                language: updatedChapter.language
            });
        } catch (error) {
            console.error("Error saving chapter:", error);
          //  toast.error(`Error saving chapter: ${error.message}`);
        }
    };

    const handleCreateNewChapterVersion = async () => {
        if (!selectedChapterId) {
          //  toast.warn("Please select a chapter to create a new version.");
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/chapters/${selectedChapterId}/versions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    content: value,
                    language: language,
                    summary: 'New version',
                    createdBy: user._id,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create new version');
            }

            const newVersion = await response.json();
           // toast.success("New version created successfully!");
            fetchVersions(selectedChapterId);
        } catch (error) {
            console.error("Error creating new version:", error);
          //  toast.error(`Error creating new version: ${error.message}`);
        }
    };

    const fetchVersions = async (chapterId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/chapters/${chapterId}/versions`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch versions');
            }

            const data = await response.json();
            setVersions(data);
        } catch (error) {
            console.error("Error fetching versions:", error);
           // toast.error(`Error fetching versions: ${error.message}`);
        }
    };

    const handleRevertVersion = async (versionId,versioncontent) => {

        setValue(versioncontent);
        if (selectedChapterId) {
            socket.emit('sendChanges', { chapterId: selectedChapterId, content: versioncontent });
           // toast.success("Chapter reverted successfully!");

        } else {
            console.error('No chapter selected for emitting changes');
        }

        // try {
        //     const token = localStorage.getItem('token');
        //     const response = await fetch(`/api/chapters/${selectedChapterId}/revert/${versionId}`, {
        //         method: 'POST',
        //         headers: {
        //             'Authorization': `Bearer ${token}`,
        //         },
        //     });

        //     if (!response.ok) {
        //         throw new Error('Failed to revert version');
        //     }

        //     const data = await response.json();
        //     setValue(data.chapter.content);
        //     toast.success("Chapter reverted successfully!");
        //     setIsVersionsModalVisible(false);
        // } catch (error) {
        //     console.error("Error reverting version:", error);
        //     toast.error(`Error reverting version: ${error.message}`);
        // }
    };

    const [isHovered, setIsHovered] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [corrections, setCorrections] = useState([]);
    const [selectedCorrections, setSelectedCorrections] = useState({});
    const [history, setHistory] = useState([]); // Undo/Redo history stack
    const [currentStep, setCurrentStep] = useState(-1);

    // Handle grammar correction logic
    const handleGrammar = async () => {
        if (!value) return;

        const stripTags = (html) => html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
        const plainText = stripTags(value);
        const sentences = plainText.split(/(?<=[.!?])\s+/);

        const correctedSentences = [];

        try {
            for (const sentence of sentences) {
                const response = await axios.post("http://127.0.0.1:5001/correct", { text: sentence });
                correctedSentences.push({
                    original: sentence,
                    corrected: response.data.corrected_text,
                });
            }

            setCorrections(correctedSentences);
            setSelectedCorrections(Object.fromEntries(correctedSentences.map((_, i) => [i, true]))); // Default to all selected
            setShowModal(true);
        } catch (error) {
            console.error("Error during grammar check:", error);
        }
    };

    // Apply only selected corrections
    const applyChanges = () => {
        const newContent = corrections
            .map(({ original, corrected }, index) => (selectedCorrections[index] ? corrected : original))
            .join(" ");

        setValue(newContent);

        // Add to history for undo/redo
        const newHistory = [...history.slice(0, currentStep + 1), { original: value, corrected: newContent }];
        setHistory(newHistory);
        setCurrentStep(newHistory.length - 1);

        setShowModal(false);
    };

    // Undo functionality
    const undo = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
            setValue(history[currentStep - 1].original);
        }
    };

    // Redo functionality
    const redo = () => {
        if (currentStep < history.length - 1) {
            setCurrentStep(currentStep + 1);
            setValue(history[currentStep + 1].corrected);
        }
    }; 

    return (
        <div className="story-Container">
            <Header />
            <Sidebar projectId={projectId} />

            <div className="story-main-content">
                <div className="story-outline">
                    <aside className="story-outline2">
                        <h2>Outline</h2>
                        <Scrollbars
                            renderThumbVertical={renderThumb}
                            renderTrackVertical={renderTrack}
                            onScrollStart={handleScrollStart}
                            onScrollStop={handleScrollStop}
                            autoHide
                        >
                            <div className="story-Content">
                                <ul className="story-chapter-list">
                                    {chapters.sort((a, b) => a.number - b.number).map((chapter) => (
                                        <li
                                            key={chapter._id}
                                            className={`chapter-item ${selectedChapterId === chapter._id ? 'selected' : ''}`}
                                            onClick={() => handleSelectChapter(chapter._id)}
                                        >
                                            <strong>Chapter {chapter.number}:</strong> {chapter.title}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </Scrollbars>
                        <button onClick={handleAddChapter} className="add-chapter-button">
                            Add Chapter
                        </button>
                    </aside>
                </div>

                <div className="story-editor">
                    <ReactQuill
                        theme="snow"
                        ref={quillRef}
                        modules={modules}
                        value={value}
                        onChange={handleContentChange}
                        placeholder={placeholderText}
                        className={language === 'ur' ? 'rtl' : ''}
                        style={{ direction: language === 'ur' ? 'rtl' : 'ltr' }}
                    />
                </div>

                <aside className="story-notes-section">
                    <div className="story-notes-container">
                        <div className="story-notes-header">
                            <button className="story-add-note" onClick={() => {
                                if (!selectedChapterId) {
                                  //  toast.warn("Please select a chapter to add notes.");
                                    return;
                                }
                                setIsNotesModalVisible(true);
                            }}>
                                <img src={plusIcon} alt="Add Note" className="story-plus-icon" />
                            </button>
                            <h2>Notes</h2>
                        </div>
                        <Scrollbars
                            renderThumbVertical={renderThumb}
                            renderTrackVertical={renderTrack}
                            onScrollStart={handleScrollStart}
                            onScrollStop={handleScrollStop}
                            style={{ height: '570px' }}
                        >
                            <ul className="story-notes-list">
                                {notes.map((note) => (
                                    <li key={note._id}>
                                        <div dangerouslySetInnerHTML={{ __html: note.content }} />
                                        <button
                                            className="story-close-note"
                                            onClick={() => handleDeleteNote(note._id)}
                                        >
                                            <img src={closeIcon} alt="Delete Note" className="story-close-icon" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </Scrollbars>
                    </div>

                    <div className="storyboard-users-self-and-collab">
                        <h3 className="storyboard-users-number">Users in this chapter</h3>
                        <ul className="storyboard-collaborators-container">
                            {usersInChapter.map((user, index) => (
                                <li className="storyboard-collaborators" key={index}>
                                    <img src={`http://localhost:5001/${user.profileImage}`} alt={user.username} width="16%" height="30" className="storyboard-users-profile-image" />
                                    <span className="storyboard-user-name-collaborator">{user.username} </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="story-action-buttons">
                        <button className="story-save-button" onClick={handleGrammar}>Check Grammar</button>
                        <button className="story-save-button" onClick={handleSaveChapter}>Save</button>
                        <button className="story-save-as-new-button" onClick={handleCreateNewChapterVersion}>Create New Version</button>
                        <button className="story-preview-button" onClick={() => {
                            if (!selectedChapterId) {
                                //toast.warn("Please select a chapter to view versions.");
                                return;
                            }
                            fetchVersions(selectedChapterId);
                            setIsVersionsModalVisible(true);
                        }}>See Project Versions</button>
                    </div>
                </aside>
            </div>

            <Modal
                className="story-modal"
                isOpen={isNotesModalVisible}
                onRequestClose={() => setIsNotesModalVisible(false)}
            >
                <h2>Add Note</h2>
                <div
                    className="story-close-button"
                    onMouseOver={(e) => (e.target.src = crosshover)}
                    onMouseOut={(e) => (e.target.src = crossNohover)}
                    onClick={() => setIsNotesModalVisible(false)}>
                    <img src={crossNohover} alt="Close Note" className="story-close-icon-chapter" />
                </div>
                <div className="story-modal-content">
                    <input
                        className="story-note-text"
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Write your note here..."
                    />
                </div>
                <div onClick={handleSaveNote} className="story-save-note-button">Save</div>
            </Modal>

            <Modal
                className="story-modal"
                isOpen={isChapterModalVisible}
                onRequestClose={handleCancelChapter}
            >
                <h3>Add New Chapter</h3>
                <div
                    className="story-close-button"
                    onMouseOver={(e) => (e.target.src = crosshover)}
                    onMouseOut={(e) => (e.target.src = crossNohover)}
                    onClick={handleCancelChapter}
                >
                    <img src={crossNohover} alt="Close Chapter" className="story-close-icon-chapter" />
                </div>
                <div className="story-modal-content">
                    <input
                        type="number"
                        placeholder="Chapter Number"
                        value={newChapter.number}
                        onChange={(e) => setNewChapter({ ...newChapter, number: e.target.value })}
                        className="chapter-input"
                        min="1"
                    />
                    <input
                        type="text"
                        placeholder="Chapter Title"
                        value={newChapter.title}
                        onChange={(e) => setNewChapter({ ...newChapter, title: e.target.value })}
                        className="chapter-input"
                    />
                </div>
                <div onClick={handleChapterSubmit} className="submit-chapter-button">Submit</div>
            </Modal>

            <Modal
      isOpen={isVersionsModalVisible}
      onRequestClose={() => setIsVersionsModalVisible(false)}
      style={{
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        },
        content: {
          position: 'relative',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: '32px',
          maxWidth: '600px',
          width: '90%',
          margin: '0 auto',
          top: 'auto',
          left: 'auto',
          right: 'auto',
          bottom: 'auto',
          border: 'none',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }
      }}
    >
      <h3 style={{
        fontSize: '20px',
        fontWeight: '600',
        color: '#2d3748',
        marginTop: '0',
        marginBottom: '24px'
      }}>
        Chapter Versions
      </h3>

      <div
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          cursor: 'pointer',
          padding: '8px',
          transition: 'opacity 0.2s ease'
        }}
        onMouseOver={(e) => (e.target.src = crosshover)}
        onMouseOut={(e) => (e.target.src = crossNohover)}
        onClick={() => setIsVersionsModalVisible(false)}
      >
        <img 
          src={crossNohover} 
          alt="Close Versions" 
          style={{
            width: '20px',
            height: '20px',
            display: 'block'
          }} 
        />
      </div>

      <div style={{
        maxHeight: '60vh',
        overflowY: 'auto',
        paddingRight: '12px'
      }}>
        <ul style={{
          listStyleType: 'none',
          padding: '0',
          margin: '0',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {versions.map((version) => (
            <li 
              key={version._id}
              style={{
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '20px',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '16px'
              }}
            >
              <div style={{
                flexGrow: 1,
                fontSize: '14px'
              }}>
                <strong style={{
                  display: 'block',
                  color: '#4a5568',
                  marginBottom: '8px'
                }}>
                  {new Date(version.createdAt).toLocaleString()}
                </strong>
                <p style={{
                  color: '#718096',
                  margin: '8px 0',
                  fontSize: '13px',
                  lineHeight: '1.4'
                }}>
                  {version.summary || 'No summary provided'}
                </p>
                <div 
                  style={{
                    color: '#4a5568',
                    fontSize: '13px',
                    lineHeight: '1.5',
                    marginTop: '8px',
                    opacity: '0.8'
                  }}
                  dangerouslySetInnerHTML={{ __html: version.content.substring(0, 100) + '...' }}
                />
              </div>
              <button 
                style={{
                  backgroundColor: isHovered ? '#2b6cb0' : '#4299e1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500',
                  transition: 'background-color 0.2s ease',
                  flexShrink: 0
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={() => handleRevertVersion(version._id, version.content)}
              >
                Revert
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Modal>
            <AddCollaborators
                isOpen={isAddCollaboratorsOpen}
                onClose={() => setIsAddCollaboratorsOpen(false)}
                projectId={projectId}
            />

            <ToastContainer />

            {showModal && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        background: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 1000,
                    }}
                >
                    <div
                        style={{
                            background: "#fff",
                            padding: "20px",
                            borderRadius: "10px",
                            maxWidth: "600px",
                            width: "90%",
                            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                            display: "flex",
                            flexDirection: "column",
                            maxHeight: "80vh",
                            overflowY: "auto",
                        }}
                    >
                        <h3 style={{ textAlign: "center", marginBottom: "15px" }}>Compare and Select the Version</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {corrections.map(({ original, corrected }, index) => {
                                const hasChanges = original !== corrected;
                                return (
                                    <div key={index} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedCorrections[index]}
                                            onChange={(e) =>
                                                setSelectedCorrections({ ...selectedCorrections, [index]: e.target.checked })
                                            }
                                            style={{ alignSelf: "start" }}
                                        />
                                        <textarea
                                            value={original}
                                            readOnly
                                            style={{
                                                width: "50%",
                                                height: "80px",
                                                resize: "none",
                                                padding: "8px",
                                                border: hasChanges ? "2px solid #ffcc00" : "1px solid #ccc",
                                                borderRadius: "5px",
                                                backgroundColor: hasChanges ? "#fff3cd" : "#f8f9fa",
                                                fontWeight: hasChanges ? "bold" : "normal",
                                            }}
                                        />
                                        <textarea
                                            value={corrected}
                                            readOnly
                                            style={{
                                                width: "50%",
                                                height: "80px",
                                                resize: "none",
                                                padding: "8px",
                                                border: hasChanges ? "2px solid #007bff" : "1px solid #28a745",
                                                borderRadius: "5px",
                                                backgroundColor: hasChanges ? "#cce5ff" : "#e9f7ef",
                                                fontWeight: hasChanges ? "bold" : "normal",
                                            }}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                        <div style={{ display: "flex", justifyContent: "center", marginTop: "20px", gap: "10px" }}>
                            <button
                                onClick={applyChanges}
                                title="Apply selected corrections to the text"
                                style={{
                                    padding: "10px 15px",
                                    background: "#28a745",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                    fontWeight: "bold",
                                }}
                            >
                                Apply Corrections
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                title="Close the modal without making changes"
                                style={{
                                    padding: "10px 15px",
                                    background: "#dc3545",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                    fontWeight: "bold",
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

      


        </div>
    );
}

export default Storyboard;