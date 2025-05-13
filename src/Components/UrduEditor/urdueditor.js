// src/components/UrduEditor.jsx

import React, { useState, useEffect, useRef } from "react";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./urdueditor.css";
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaListOl,
  FaListUl,
  FaTimes,
  FaUndo,
  FaRedo,
  FaChevronLeft,
  FaChevronRight,
  FaCamera,
  FaDownload,
  FaMicrophone,
  FaEye,
  FaEyeSlash,
  FaMagic,
  FaChartBar
} from "react-icons/fa";
import AddCollaborators from "./AddCollaborators";
import Header from "../Header/header";
import Sidebar from "../Sidebar/sidebar";
import Tesseract from "tesseract.js";
import { Create } from "@mui/icons-material";
import { Select } from "@mui/material";

const UrduEditor = () => {
  const { projectId } = useParams();
  const [editorContent, setEditorContent] = useState("");
  const [keyboardInput, setKeyboardInput] = useState("");
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [user, setUser] = useState(null);
  const [goal, setGoal] = useState(500);
  const [progress, setProgress] = useState(0);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoal, setNewGoal] = useState(goal);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [newChapter, setNewChapter] = useState("");
  const [theme, setTheme] = useState("theme-light");
  const [leftPanelVisible, setLeftPanelVisible] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAddCollaboratorsOpen, setIsAddCollaboratorsOpen] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  // New states for spell check and statistics:
  const [grammarSuggestions, setGrammarSuggestions] = useState([]);
  const [showSpellCheckModal, setShowSpellCheckModal] = useState(false);
  const [showStatisticsDashboard, setShowStatisticsDashboard] = useState(false);
  const [writingStartTime, setWritingStartTime] = useState(null);
  const [wordCountHistory, setWordCountHistory] = useState([]);

  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const keyboardRef = useRef();
  const editorRef = useRef(null);

  // List of themes
  const themes = [
    { label: "Light Theme", value: "theme-light" },
    { label: "Dark Theme", value: "theme-dark" },
    { label: "Blue Theme", value: "theme-blue" },
    { label: "Green Theme", value: "theme-green" },
    { label: "Red Theme", value: "theme-red" },
    { label: "Purple Theme", value: "theme-purple" },
    { label: "Pink Theme", value: "theme-pink" },
    { label: "Yellow Theme", value: "theme-yellow" },
    { label: "Orange Theme", value: "theme-orange" },
    { label: "Teal Theme", value: "theme-teal" }
  ];

  // Modal handlers
  const handleNoteModal = () => setShowNoteModal((prev) => !prev);
  const handleGoalModal = () => setShowGoalModal(!showGoalModal);
  const handleChapterModal = () => setShowChapterModal(!showChapterModal);

  // Toggle left panel visibility
  const toggleLeftPanel = () => setLeftPanelVisible((prev) => !prev);

  const [showVersionModal, setShowVersionModal] = useState(false); // For managing versions
  const [versions, setVersions] = useState([]); // Store all versions of the current chapter
  // Fetch chapters when component mounts or projectId changes
  useEffect(() => {
    if (projectId) {
      fetchChapters();
    }
    // eslint-disable-next-line
  }, [projectId]);

  const fetchChapters = async () => {
    try {
      const res = await axios.get(`/api/urduchapters/${projectId}`);
      setChapters(res.data);
      if (res.data.length > 0) {
        selectChapter(res.data[0]._id);
      }
    } catch (err) {
      console.error("Error fetching chapters:", err);
    }
  };

  // Fetch notes when selectedChapter changes
  useEffect(() => {
    if (selectedChapter) {
      fetchVersions(selectedChapter);
      fetchNotes(selectedChapter);
    } else {
      setNotes([]);
      setEditorContent("");
      setProgress(0);
      setVersions([]);
    }
    // eslint-disable-next-line
  }, [selectedChapter, projectId]);

  const fetchNotes = async (chapterId) => {
    try {
      const res = await axios.get(`/api/chapter-notes/${projectId}/${chapterId}`);
      setNotes(res.data);
    } catch (err) {
      console.error("Error fetching notes:", err);
    }
  };

  const fetchVersions = async (chapterId) => {
    try {
      const res = await axios.get(`/api/urduchapterversions/${projectId}/${chapterId}`);
      setVersions(res.data);
    } catch (err) {
      console.error("Error fetching versions:", err);
    }
  };

  // Handle changes in the editor content (from text area)
  const handleChange = (event) => {
    const value = event.target.value;
    setEditorContent(value);
    updateProgress(value.length);
    // Start the writing timer if this is the first keystroke
    if (!writingStartTime && value.trim() !== "") {
      setWritingStartTime(Date.now());
    }
    if (keyboardRef.current) {
      keyboardRef.current.setInput(value);
    }
  };

  // Handle keyboard input changes (from the virtual keyboard)
  const onChangeKeyboard = (input) => {
    setKeyboardInput(input);
    setEditorContent(input);
    updateProgress(input.length);
  };

  // Update progress based on content length
  const updateProgress = (length) => {
    const percentage = (length / goal) * 100;
    setProgress(Math.min(percentage, 100));
  };

  // NEW: Apply formatting to selected text in the textarea
  const applyFormat = (tag) => {
    if (editorRef.current) {
      const textarea = editorRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = editorContent.substring(start, end);
      const before = editorContent.substring(0, start);
      const after = editorContent.substring(end);
      const openTag = `<${tag}>`;
      const closeTag = `</${tag}>`;
      const newText = before + openTag + selectedText + closeTag + after;
      setEditorContent(newText);
      updateProgress(newText.length);
      if (keyboardRef.current) {
        keyboardRef.current.setInput(newText);
      }
    }
  };

  const handleBold = () => {
    applyFormat("b");
  };

  const handleItalic = () => {
    applyFormat("i");
  };

  const handleUnderline = () => {
    applyFormat("u");
  };

  // Add a new chapter (clear editor for new chapter)
  const addChapter = async () => {
    if (newChapter.trim() !== "") {
      try {
        const newChapterData = {
          projectId,
          title: newChapter,
          number: chapters.length + 1,
          content: "",
          summary: ""
        };
        const res = await axios.post(`/api/urduchapters`, newChapterData);
        setChapters([...chapters, res.data]);
        setNewChapter("");
        setShowChapterModal(false);
        setSelectedChapter(res.data._id);
        setEditorContent("");
        if (keyboardRef.current) {
          keyboardRef.current.setInput("");
        }
      } catch (err) {
        console.error("Error adding chapter:", err);
      }
    }
  };

  // Delete a chapter
  const deleteChapter = async (chapterId) => {
    if (window.confirm("Are you sure you want to delete this chapter?")) {
      try {
        await axios.delete(`/api/urduchapters/${projectId}/${chapterId}`);
        setChapters(chapters.filter((chapter) => chapter._id !== chapterId));
        if (selectedChapter === chapterId) {
          setSelectedChapter(null);
        }
      } catch (err) {
        console.error("Error deleting chapter:", err);
      }
    }
  };

  // Select a chapter (load its content)
  const selectChapter = async (chapterId) => {
    setSelectedChapter(chapterId);
    fetchNotes(chapterId);
    fetchVersions(chapterId);
    try {
      const res = await axios.get(`/api/urduchapters/${projectId}/${chapterId}`);
      setEditorContent(res.data.content);
      updateProgress(res.data.content.length);
      if (keyboardRef.current) {
        keyboardRef.current.setInput(res.data.content);
      }
    } catch (err) {
      console.error("Error selecting chapter:", err);
    }
  };

  // Save chapter content (NEW: accepts a silent flag for auto-save)
  const saveChapter = async (silent = false) => {
    if (!selectedChapter) return;
    try {
      const updatedData = { content: editorContent };
      await axios.put(`/api/urduchapters/${projectId}/${selectedChapter}`, updatedData);
      if (!silent) {
        alert("Chapter saved successfully!");
      }
    } catch (err) {
      console.error("Error saving chapter:", err);
      if (!silent) {
        alert("Failed to save chapter.");
      }
    }
  };


  const CreateVersion = async () => {
    if (!selectedChapter || !editorContent.trim()) {
      alert("Please select a chapter and enter content before creating a version.");
      return;
    }
    try {
      const userName = user?.name || "Saad ";
      const versionName = prompt("Enter version name (e.g., Draft 1):") || `Version ${versions.length + 1}`;
      const newVersionData = {
        projectId,
        chapterId: selectedChapter,
        createrName: userName,
        content: editorContent,
        versionName,
      };
      const res = await axios.post('/api/urduchapterversions', newVersionData);
      setVersions([res.data, ...versions]);
      alert("Version created successfully!");
    } catch (err) {
      console.error("Error creating version:", err);
      alert("Failed to create version. Please try again.");
    }
  };

  const handleSeeVersions = () => {
    if (!selectedChapter) {
      alert("Please select a chapter first.");
      return;
    }
    setShowVersionModal(true);
  };



  const SelectVersion = async (versionId) => {
    try {
      const version = versions.find(v => v.versionId === versionId);
      if (!version) {
        alert("Version not found.");
        return;
      }

      // Update editor content with the selected version's content
      setEditorContent(version.content);
      updateProgress(version.content.length);
      if (keyboardRef.current) {
        keyboardRef.current.setInput(version.content);
      }

      // Save the selected version as the current chapter content
      await saveChapter(true); // Silent save

      alert("Version applied successfully!");
      setShowVersionModal(false);
    } catch (err) {
      console.error("Error applying version:", err);
      alert("Failed to apply version. Please try again.");
    }
  };

  // Auto-save every minute (NEW)
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (selectedChapter && editorContent) {
        saveChapter(true);
      }
    }, 60000);
    return () => clearInterval(autoSaveInterval);
  }, [selectedChapter, editorContent]);

  // Add a note
  const addNote = async () => {
    if (newNote.trim() !== "" && selectedChapter) {
      try {
        const newNoteData = {
          projectId,
          chapterId: selectedChapter,
          content: newNote
        };
        const res = await axios.post(`/api/chapter-notes`, newNoteData);
        setNotes([res.data, ...notes]);
        setNewNote("");
        setShowNoteModal(false);
      } catch (err) {
        console.error("Error adding note:", err);
        alert("Failed to add note. Please try again.");
      }
    } else {
      alert("Please enter a note and ensure a chapter is selected.");
    }
  };

  // Delete a note
  const deleteNote = async (noteId) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      try {
        await axios.delete(`/api/chapter-notes/${noteId}`);
        setNotes(notes.filter((note) => note._id !== noteId));
      } catch (err) {
        console.error("Error deleting note:", err);
        alert("Failed to delete note. Please try again.");
      }
    }
  };

  // Change writing goal
  const changeGoal = () => {
    if (newGoal > 0) {
      setGoal(newGoal);
      updateProgress(editorContent.length);
      setShowGoalModal(false);
    } else {
      alert("Goal must be a positive number.");
    }
  };

  // Handle theme change
  const handleThemeChange = (selectedTheme) => {
    setTheme(selectedTheme);
    setIsDropdownOpen(false);
  };

  // --- OCR Functionality using Tesseract.recognize ---
  const handleOCRButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      console.log("Starting OCR process using Tesseract.recognize...");
      const {
        data: { text }
      } = await Tesseract.recognize(file, "urd", {
        logger: (m) => console.log("Tesseract log:", m)
      });
      console.log("OCR recognition complete. Extracted text:", text);
      const newContent = editorContent + "\n" + text;
      setEditorContent(newContent);
      updateProgress(newContent.length);
      if (keyboardRef.current) {
        keyboardRef.current.setInput(newContent);
      }
      console.log("OCR process finished and text appended to editor content.");
    } catch (err) {
      console.error("Error during OCR processing:", err);
      alert("Failed to extract text from the image. Please try again.");
    }
  };

  // NEW: Toggle preview mode (renders formatted HTML)
  const togglePreview = () => {
    setIsPreview(!isPreview);
  };

  // NEW: Download the current chapter as a text file
  const handleDownload = () => {
    const blob = new Blob([editorContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (selectedChapter ? selectedChapter : "chapter") + ".txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // NEW: Handle speech-to-text input using the Web Speech API
  const handleSpeechInput = () => {
    if (!("SpeechRecognition" in window) && !("webkitSpeechRecognition" in window)) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }
    if (isRecording) {
      setIsRecording(false);
    } else {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = "ur-PK";
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const newContent = editorContent + " " + transcript;
        setEditorContent(newContent);
        updateProgress(newContent.length);
        if (keyboardRef.current) {
          keyboardRef.current.setInput(newContent);
        }
        setIsRecording(false);
      };
      recognition.onerror = (error) => {
        console.error("Speech recognition error", error);
        setIsRecording(false);
      };
      recognition.start();
      setIsRecording(true);
    }
  };

  // NEW: Spell Check & Grammar Suggestions using LanguageTool API
  const handleSpellCheck = async () => {
    if (!editorContent.trim()) {
      alert("Editor is empty");
      return;
    }
    try {
      const params = new URLSearchParams();
      params.append("text", editorContent);
      params.append("language", "ur");
      const res = await axios.post(
        "https://api.languagetool.org/v2/check",
        params,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
      setGrammarSuggestions(res.data.matches);
      setShowSpellCheckModal(true);
    } catch (err) {
      console.error("Error during spell check:", err);
      alert("Failed to perform spell check. Please try again.");
    }
  };

  // NEW: Compute word frequency for statistics
  const computeWordFrequency = (text) => {
    const words = text.trim().split(/\s+/).filter(Boolean);
    const freq = {};
    words.forEach((word) => {
      freq[word] = (freq[word] || 0) + 1;
    });
    return freq;
  };

  // NEW: Record word count history every minute
  useEffect(() => {
    let interval;
    if (writingStartTime) {
      interval = setInterval(() => {
        const currentWords = editorContent.trim().split(/\s+/).filter(Boolean).length;
        setWordCountHistory((prev) => [...prev, { time: new Date(), count: currentWords }]);
      }, 60000);
    }
    return () => clearInterval(interval);
  }, [writingStartTime]);

  // Urdu Keyboard Layout
  const urduLayout = {
    default: [
      "ذ ١ ٢ ٣ ٤ ٥ ٦ ٧ ٨ ٩ ٠ - = {bksp}",
      "{tab} ق و ع ر ت ے ء ی ا پ ] [ \\",
      "{capslock} ا س د ف گ ح ج ک ل ؛ ' {enter}",
      "{shift} ز ش چ ط ب ن م ، ۔ / {shift}",
      ".com @ {space}"
    ],
    shift: [
      "~ ! @ # $ % ^ & * ( ) _ + {bksp}",
      "{tab} ق و ع ر ت ے ء ی ا پ { } |",
      '{capslock} ا س د ف گ ح ج ک ل : " {enter}',
      "{shift} ز ش چ ط ب ن م < > ? {shift}",
      ".com @ {space}"
    ]
  };

  // Inline styles for modals (same as before)
  const modalOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  };

  const modalContentStyle = {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    width: "90%",
    maxWidth: "400px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
    position: "relative"
  };

  const modalHeaderStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  };

  const modalTitleStyle = {
    margin: 0,
    fontSize: "1.5em"
  };

  const modalCloseButtonStyle = {
    background: "none",
    border: "none",
    fontSize: "1.2em",
    cursor: "pointer"
  };

  const modalBodyStyle = {
    margin: "15px 0"
  };

  const modalInputStyle = {
    width: "100%",
    padding: "10px",
    fontSize: "1em",
    border: "1px solid #ccc",
    borderRadius: "4px"
  };

  const modalFooterStyle = {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px"
  };

  const modalButtonStyle = {
    padding: "10px 20px",
    fontSize: "1em",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer"
  };

  const modalPrimaryButtonStyle = {
    ...modalButtonStyle,
    backgroundColor: "#007bff",
    color: "#fff"
  };

  const modalSecondaryButtonStyle = {
    ...modalButtonStyle,
    backgroundColor: "#6c757d",
    color: "#fff"
  };

  return (
    <div className={`urdu-editor-container ${theme}`}>
      <Header />
      <Sidebar projectId={projectId} />

      {/* Toolbar */}
      <div
        className="urdu-toolbar"
        style={{
          display: "flex",
          alignItems: "center",
          padding: "10px",
          backgroundColor: "#f0f0f0"
        }}
      >
        {/* Custom Dropdown for Themes */}
        <div
          className="custom-dropdown"
          style={{ position: "relative", marginRight: "20px" }}
        >
          <button
            className="urdu-theme"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{ padding: "8px 12px", cursor: "pointer" }}
          >
            Themes
          </button>
          {isDropdownOpen && (
            <ul
              className="urdu-theme-dropdown-menu"
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                backgroundColor: "#fff",
                listStyle: "none",
                padding: "10px",
                margin: 0,
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                zIndex: 1001
              }}
            >
              {themes.map((item, index) => (
                <li
                  key={index}
                  onClick={() => handleThemeChange(item.value)}
                  style={{ padding: "5px 10px", cursor: "pointer" }}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = "#f5f5f5")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = "#fff")
                  }
                >
                  {item.label}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Toolbar Buttons */}
        <div
          className="urdu-toolbar-container"
          style={{ display: "flex", gap: "10px" }}
        >
          <button
            className="urdu-toolbar-btn"
            title="Bold"
            onClick={handleBold}
          >
            <FaBold />
          </button>
          <button
            className="urdu-toolbar-btn"
            title="Italic"
            onClick={handleItalic}
          >
            <FaItalic />
          </button>
          <button
            className="urdu-toolbar-btn"
            title="Underline"
            onClick={handleUnderline}
          >
            <FaUnderline />
          </button>
          <button
            className="urdu-toolbar-btn"
            title="Ordered List"
            style={{
              cursor: "pointer",
              padding: "8px",
              background: "none",
              border: "none"
            }}
          >
            <FaListOl />
          </button>
          <button
            className="urdu-toolbar-btn"
            title="Unordered List"
            style={{
              cursor: "pointer",
              padding: "8px",
              background: "none",
              border: "none"
            }}
          >
            <FaListUl />
          </button>
          <button
            className="urdu-toolbar-btn"
            title="Undo"
            style={{
              cursor: "pointer",
              padding: "8px",
              background: "none",
              border: "none"
            }}
          >
            <FaUndo />
          </button>
          <button
            className="urdu-toolbar-btn"
            title="Redo"
            style={{
              cursor: "pointer",
              padding: "8px",
              background: "none",
              border: "none"
            }}
          >
            <FaRedo />
          </button>
          {/* OCR Button */}
          <button
            className="urdu-toolbar-btn"
            title="Upload Urdu OCR"
            onClick={handleOCRButtonClick}
            style={{
              cursor: "pointer",
              padding: "8px",
              background: "none",
              border: "none"
            }}
          >
            <FaCamera />
          </button>
          {/* Speech-to-Text Button */}
          <button
            className="urdu-toolbar-btn"
            title="Voice Input"
            onClick={handleSpeechInput}
            style={{
              cursor: "pointer",
              padding: "8px",
              background: isRecording ? "#ff7043" : "none",
              border: "none"
            }}
          >
            <FaMicrophone />
          </button>
          {/* Download Button */}
          <button
            className="urdu-toolbar-btn"
            title="Download Chapter"
            onClick={handleDownload}
            style={{
              cursor: "pointer",
              padding: "8px",
              background: "none",
              border: "none"
            }}
          >
            <FaDownload />
          </button>
          {/* Preview Toggle Button */}
          <button
            className="urdu-toolbar-btn"
            title="Toggle Preview Mode"
            onClick={togglePreview}
            style={{
              cursor: "pointer",
              padding: "8px",
              background: "none",
              border: "none"
            }}
          >
            {isPreview ? <FaEyeSlash /> : <FaEye />}
          </button>
          {/* Spell Check & Grammar Suggestions Button */}
          <button
            className="urdu-toolbar-btn"
            title="Spell Check & Grammar Suggestions"
            onClick={handleSpellCheck}
            style={{
              cursor: "pointer",
              padding: "8px",
              background: "none",
              border: "none"
            }}
          >
            <FaMagic />
          </button>
          {/* Statistics Dashboard Button */}
          <button
            className="urdu-toolbar-btn"
            title="Writing Statistics Dashboard"
            onClick={() => setShowStatisticsDashboard(true)}
            style={{
              cursor: "pointer",
              padding: "8px",
              background: "none",
              border: "none"
            }}
          >
            <FaChartBar />
          </button>
        </div>

        {/* Set Goal Button */}
        <button
          className="urdu-goal-set"
          onClick={handleGoalModal}
          style={{ marginLeft: "auto", padding: "8px 12px", cursor: "pointer" }}
        >
          Set Goal
        </button>

        {/* Word Count */}
        <h5 className="word-count" style={{ marginLeft: "10px" }}>
          Words: {editorContent.trim().split(/\s+/).filter(Boolean).length}
        </h5>
      </div>

      {/* Main Content */}
      <div className="urdu-main-content" style={{ display: "flex" }}>
        {/* Left Panel */}
        {leftPanelVisible && (
          <div
            className="urdu-left-panel"
            style={{ width: "20%", paddingRight: "20px" }}
          >
            <h4>Project Outline</h4>
            <button
              className="urdu-chapter-btn"
              onClick={handleChapterModal}
              style={{
                padding: "8px 12px",
                cursor: "pointer",
                marginBottom: "10px"
              }}
            >
              چپٹر شامل کریں
            </button>
            <div className="urdu-section-management">
              {chapters.map((chapter) => (
                <div
                  key={chapter._id}
                  className={`urdu-chapter-box ${
                    selectedChapter === chapter._id ? "selected" : ""
                  }`}
                  onClick={() => selectChapter(chapter._id)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px",
                    marginBottom: "5px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    cursor: "pointer",
                    backgroundColor:
                      selectedChapter === chapter._id ? "#e6f7ff" : "#fff"
                  }}
                >
                  <p style={{ margin: 0 }}>{chapter.title}</p>
                  <button
                    className="urdu-note-close-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChapter(chapter._id);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#ff4d4f"
                    }}
                    title="Delete Chapter"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Toggle Left Panel */}
        <button
          className="urdu-toggle-left-panel"
          onClick={toggleLeftPanel}
          style={{
            cursor: "pointer",
            background: "none",
            border: "none",
            fontSize: "1.5em",
            height: "40px",
            color: "black",
            borderRight: "1px solid #a18e75",
            borderBottom: "1px solid #a18e75",
            backgroundColor: "#e1dbd6"
          }}
        >
          {leftPanelVisible ? <FaChevronLeft /> : <FaChevronRight />}
        </button>

        {/* Editor Panel */}
        <div
          className="urdu-editor-panel flex-grow-1"
          style={{ flexGrow: 1, paddingRight: "20px" }}
        >
          {/* Conditionally render the editing textarea or the preview */}
          {!isPreview ? (
            <div className="urdu-editor-area" style={{ marginBottom: "10px" }}>
              <textarea
                ref={editorRef}
                value={editorContent}
                onChange={handleChange}
                placeholder="لکھنا شروع کریں..."
                style={{
                  width: "90%",
                  height: "300px",
                  fontFamily: "Noto Nastaliq Urdu, serif",
                  fontSize: "18px",
                  direction: "rtl",
                  border: "2px solid #333",
                  padding: "15px",
                  borderRadius: "8px",
                  boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                  overflowY: "auto",
                  resize: "vertical"
                }}
              />
            </div>
          ) : (
            <div
              className="urdu-preview-area"
              dangerouslySetInnerHTML={{ __html: editorContent }}
            ></div>
          )}

          {/* Save Chapter Button */}
          {!isPreview && (
            <button
              className="save-chapter-btn"
              onClick={saveChapter}
              style={{
                color: "white",
                padding: "8px 12px",
                cursor: "pointer",
                marginBottom: "10px",
                borderRadius: "2px",
                backgroundColor: "#191B30"
              }}
            >
              Save Chapter
            </button>
          )}

          {/* Virtual Keyboard (only show in edit mode) */}
          {!isPreview && (
            <Keyboard
              ref={keyboardRef}
              layout={urduLayout}
              layoutName="default"
              onChange={onChangeKeyboard}
              theme={"hg-theme-default hg-layout-default keyboard"}
              input={editorContent}
            />
          )}
        </div>

        {/* Right Panel */}
        <div className="urdu-right-panel">
          <h4>Goals & Streaks</h4>
          <div className="urdu-goal-tracker" style={{ marginBottom: "20px" }}>
            <h5>Goal: {goal} Words</h5>
            <div
              className="urdu-progress-bar"
              style={{
                border: "1px solid #191B30",
                width: "100%",
                backgroundColor: "white",
                borderRadius: "8px",
                overflow: "hidden"
              }}
            >
              <div
                className="urdu-progress-fill"
                style={{
                  width: `${progress}%`,
                  backgroundColor: "#191B30",
                  height: "20px",
                  textAlign: "center",
                  marginleft: "10px",
                  color: "orange",
                  lineHeight: "20px",
                  transition: "width 0.3s ease",
                  border: "1px solid #191B30"
                }}
              >
                {progress.toFixed(0)}%
              </div>
            </div>
          </div>

          {/* Add Note Button */}
          <button
            className="urdu-btn"
            onClick={handleNoteModal}
            style={{ padding: "8px 12px", cursor: "pointer", marginBottom: "10px" }}
          >
            Add Note
          </button>
          <div
            className="urdu-notes-section"
            style={{ maxHeight: "300px", overflowY: "auto" }}
          >
            {notes.length > 0 ? (
              notes.map((note) => (
                <div
                  key={note._id}
                  className="urdu-note-box"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px",
                    marginBottom: "5px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    backgroundColor: "#fff"
                  }}
                >
                  <p style={{ margin: 0 }}>{note.content}</p>
                  <button
                    className="urdu-note-close-btn"
                    onClick={() => deleteNote(note._id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#ff4d4f"
                    }}
                    title="Delete Note"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))
            ) : (
              <p>No notes available for this chapter.</p>
            )}
          </div>

          {/* Action Buttons */}
          <div
            className="urdu-save-note-buttons"
            style={{
              marginTop: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "10px"
            }}
          >
            <button
              className="urdu-save-note-button"
              onClick={saveChapter}
              style={{ padding: "8px 12px", cursor: "pointer" }}
            >
              Save
            </button>
            <button
              className="urdu-save-note-button"
              onClick={() => navigate("/AddCollaborators")}
              style={{ padding: "8px 12px", cursor: "pointer" }}
            >
              Add Collaborators
            </button>
            <button
              className="urdu-save-note-button"
              onClick={CreateVersion}
              style={{ padding: "8px 12px", cursor: "pointer" }}
            >
              Create Version
            </button>            
            <button
              className="urdu-save-note-button"
              onClick={handleSeeVersions}
              style={{ padding: "8px 12px", cursor: "pointer" }}
            >
              See Version
            </button>
          </div>
        </div>
      </div>

      {/* Note Modal */}
      {showNoteModal && (
        <div style={modalOverlayStyle} onClick={handleNoteModal}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h4 style={modalTitleStyle}>Add Note</h4>
              <button
                style={modalCloseButtonStyle}
                onClick={handleNoteModal}
                title="Close Modal"
              >
                <FaTimes />
              </button>
            </div>
            <div style={modalBodyStyle}>
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Enter your note"
                style={modalInputStyle}
              />
            </div>
            <div style={modalFooterStyle}>
              <button
                style={modalPrimaryButtonStyle}
                onClick={addNote}
                disabled={!newNote.trim()}
              >
                Add Note
              </button>
              <button style={modalSecondaryButtonStyle} onClick={handleNoteModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Goal Modal */}
      {showGoalModal && (
        <div style={modalOverlayStyle} onClick={handleGoalModal}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h4 style={modalTitleStyle}>Set Writing Goal</h4>
              <button
                style={modalCloseButtonStyle}
                onClick={handleGoalModal}
                title="Close Modal"
              >
                <FaTimes />
              </button>
            </div>
            <div style={modalBodyStyle}>
              <input
                type="number"
                value={newGoal}
                onChange={(e) => setNewGoal(Number(e.target.value))}
                placeholder="Enter your goal in words"
                style={modalInputStyle}
              />
            </div>
            <div style={modalFooterStyle}>
              <button
                style={modalPrimaryButtonStyle}
                onClick={changeGoal}
                disabled={newGoal <= 0}
              >
                Set Goal
              </button>
              <button style={modalSecondaryButtonStyle} onClick={handleGoalModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chapter Modal */}
      {showChapterModal && (
        <div style={modalOverlayStyle} onClick={handleChapterModal}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h4 style={modalTitleStyle}>چپٹر شامل کریں</h4>
              <button
                style={modalCloseButtonStyle}
                onClick={handleChapterModal}
                title="بند کریں"
              >
                <FaTimes />
              </button>
            </div>
            <div style={modalBodyStyle}>
              <input
                type="text"
                value={newChapter}
                onChange={(e) => setNewChapter(e.target.value)}
                placeholder="چپٹر کا نام درج کریں"
                style={modalInputStyle}
              />
              {/* Embedded Urdu Keyboard for Chapter Name Input */}
              <Keyboard
                layout={urduLayout}
                layoutName="default"
                onChange={(input) => setNewChapter(input)}
                theme={"hg-theme-default hg-layout-default keyboard"}
                input={newChapter}
              />
            </div>
            <div style={modalFooterStyle}>
              <button
                style={modalPrimaryButtonStyle}
                onClick={addChapter}
                disabled={!newChapter.trim()}
              >
                چپٹر شامل کریں
              </button>
              <button
                style={modalSecondaryButtonStyle}
                onClick={handleChapterModal}
              >
                بند کریں
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spell Check & Grammar Suggestions Modal */}
      {showSpellCheckModal && (
        <div style={modalOverlayStyle} onClick={() => setShowSpellCheckModal(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h4 style={modalTitleStyle}>Spell Check & Grammar Suggestions</h4>
              <button
                style={modalCloseButtonStyle}
                onClick={() => setShowSpellCheckModal(false)}
                title="Close Modal"
              >
                <FaTimes />
              </button>
            </div>
            <div style={modalBodyStyle}>
              {grammarSuggestions.length === 0 ? (
                <p>No issues found.</p>
              ) : (
                grammarSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: "10px",
                      borderBottom: "1px solid #ccc",
                      paddingBottom: "5px"
                    }}
                  >
                    <p style={{ margin: 0, fontWeight: "bold" }}>
                      {suggestion.message}
                    </p>
                    <p style={{ margin: 0 }}>
                      Context:{" "}
                      {editorContent.substring(
                        suggestion.offset,
                        suggestion.offset + suggestion.length
                      )}
                    </p>
                    {suggestion.replacements &&
                      suggestion.replacements.length > 0 && (
                        <p style={{ margin: 0 }}>
                          Suggestions:{" "}
                          {suggestion.replacements
                            .map((rep) => rep.value)
                            .join(", ")}
                        </p>
                      )}
                  </div>
                ))
              )}
            </div>
            <div style={modalFooterStyle}>
              <button
                style={modalSecondaryButtonStyle}
                onClick={() => setShowSpellCheckModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Dashboard Modal */}
      {showStatisticsDashboard && (
        <div style={modalOverlayStyle} onClick={() => setShowStatisticsDashboard(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h4 style={modalTitleStyle}>Writing Statistics Dashboard</h4>
              <button
                style={modalCloseButtonStyle}
                onClick={() => setShowStatisticsDashboard(false)}
                title="Close Modal"
              >
                <FaTimes />
              </button>
            </div>
            <div style={modalBodyStyle}>
              <p>
                Total Words:{" "}
                {editorContent.trim().split(/\s+/).filter(Boolean).length}
              </p>
              {writingStartTime ? (
                <p>
                  Writing Speed:{" "}
                  {(
                    editorContent.trim().split(/\s+/).filter(Boolean).length /
                    ((Date.now() - writingStartTime) / 60000)
                  ).toFixed(2)}{" "}
                  words per minute
                </p>
              ) : (
                <p>Writing Speed: 0 words per minute</p>
              )}
              <h5>Word Frequency Analysis:</h5>
              <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ border: "1px solid #ccc", padding: "4px" }}>
                        Word
                      </th>
                      <th style={{ border: "1px solid #ccc", padding: "4px" }}>
                        Count
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(computeWordFrequency(editorContent))
                      .sort((a, b) => b[1] - a[1])
                      .map(([word, count], index) => (
                        <tr key={index}>
                          <td style={{ border: "1px solid #ccc", padding: "4px" }}>
                            {word}
                          </td>
                          <td style={{ border: "1px solid #ccc", padding: "4px" }}>
                            {count}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <h5>Word Count History (per minute):</h5>
              <ul style={{ listStyleType: "none", padding: 0 }}>
                {wordCountHistory.map((entry, index) => (
                  <li key={index}>
                    {entry.time.toLocaleTimeString()}: {entry.count} words
                  </li>
                ))}
              </ul>
            </div>
            <div style={modalFooterStyle}>
              <button
                style={modalSecondaryButtonStyle}
                onClick={() => setShowStatisticsDashboard(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

{showVersionModal && (
        <div style={modalOverlayStyle} onClick={() => setShowVersionModal(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h4 style={modalTitleStyle}>View Versions</h4>
              <button style={modalCloseButtonStyle} onClick={() => setShowVersionModal(false)} title="Close Modal"><FaTimes /></button>
            </div>
            <div style={{ ...modalBodyStyle, overflowY: "auto", maxHeight: "400px" }}>
            {versions.length === 0 ? (
                <p>No versions available for this chapter.</p>
              ) : (
                versions.map((version) => (
                  <div key={version.versionId} style={{display:"flex", flexDirection:"column", alignContent:"center", justifyContent:"center",textAlign:"center", marginBottom: "10px", padding: "10px", border: "1px solid #ccc", borderRadius: "4px", cursor: "pointer" }} onClick={() => SelectVersion(version.versionId)}>
                    <p><strong>Version Name:</strong> {version.versionName}</p>
                    <p><strong>Created By:</strong> {version.createrName}</p>
                    <p style={{margin:"auto",textAlign:"center",maxWidth:150, textOverflow:"ellipsis", overflow:"hidden"}} ><strong>Content Preview:</strong> {version.content.substring(0, 50) + (version.content.length > 50 ? "..." : "")}</p>
                    <p><strong>Date:</strong> {new Date(version.createdAt).toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>
            <div style={modalFooterStyle}>
              <button style={modalSecondaryButtonStyle} onClick={() => setShowVersionModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* AddCollaborators Modal */}
      <AddCollaborators
        isOpen={isAddCollaboratorsOpen}
        onClose={() => setIsAddCollaboratorsOpen(false)}
        projectId={projectId}
      />

      {/* Hidden file input for OCR */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
    </div>
  );
};

export default UrduEditor;
