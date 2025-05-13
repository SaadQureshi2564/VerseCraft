import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import './styles/ChatbotApp.css';
import { useNavigate } from 'react-router-dom';
import Header from '../Header/header';

function ChatbotApp() {
  const [currentPrompt, setCurrentPrompt] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [newPrompt, setNewPrompt] = useState(''); // Define setNewPrompt here
  const navigate = useNavigate();

  const handleNewPrompt = (title) => {
    if (!selectedProjectId || !title.trim()) return;
    axios
      .post('http://localhost:5001/api/prompts/create', {
        title,
        messages: [],
        projectId: selectedProjectId, // Pass the selected project ID
      })
      .then((response) => {
        setPrompts([...prompts, response.data]);
        setNewPrompt('');
      })
      .catch((error) => {
        console.error('Error creating prompt:', error);
      });
  };

  const handleUpdateCurrentPrompt = (updatedPrompt) => {
    // Update the current prompt's messages and data
    setCurrentPrompt(updatedPrompt);
    setPrompts((prevPrompts) =>
      prevPrompts.map((prompt) =>
        prompt._id === updatedPrompt._id ? updatedPrompt : prompt
      )
    );
  };

  useEffect(() => {
    if (!selectedProjectId) return;

    axios
      .get(`http://localhost:5001/api/prompts/${selectedProjectId}`)
      .then((response) => {
        setPrompts(response.data);
      })
      .catch((error) => {
        console.error('Error fetching prompts:', error);
      });
  }, [selectedProjectId]);

  return (
    <div className="chatbot-app">
      <Header />
      <div className="chatbot-container">
        <Sidebar setSelectedProjectId={setSelectedProjectId} />
        <MainContent
          currentPrompt={currentPrompt}
          onNewPrompt={handleNewPrompt}
          prompts={prompts}
          selectedProjectId={selectedProjectId}
          onUpdateCurrentPrompt={handleUpdateCurrentPrompt}
        />
      </div>
    </div>
  );
}

export default ChatbotApp;
