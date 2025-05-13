import React, { useState } from 'react';
import newPrompt from '../styles/new-prompt.png';
function History({ onNewPrompt, selectPrompt ,prompts, onUpdateCurrentPrompt ,setChatStarted, chatVisibility, setChatVisibility  }) {
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [newPromptTitle, setNewPromptTitle] = useState('');

  // Toggle popup visibility
  const handlePopupToggle = () => {
    setIsPopupVisible(!isPopupVisible);
  };

  // Handle input change for new prompt title
  const handleInputChange = (e) => {
    setNewPromptTitle(e.target.value);
  };

  // Create new prompt and update state
  const handleCreateNewPrompt = () => {
    if (newPromptTitle.trim()) {
      onNewPrompt(newPromptTitle);
      setNewPromptTitle('');
      setIsPopupVisible(false); // Hide popup after creation
    } else {
      alert('Please enter a prompt name');
    }
    if (setChatStarted) {  // ✅ Ensure setChatStarted exists before calling
      setChatStarted(false);
    } else {
      console.error("setChatStarted is not a function");
    }
  };

  return (
    <div className="chatbot-history">
      <div className="chatbot-history-header">
        
      <div className="chatbot-new-prompt-button" onClick={handlePopupToggle}>
          
             
          <span className="chatbot-new-prompt-text">New Prompt</span>
       
       <img src={newPrompt} alt="New Prompt" className="chatbot-new-prompt-icon" />
     </div>
        <h3>History</h3>
      </div>

      <div className="chatbot-history-items">
        {prompts.map((prompt) => (
          <div
            className="chatbot-history-item"
            key={prompt._id}
            onClick={() => {
              console.log("Selected Prompt:", prompt._id);
              onUpdateCurrentPrompt(prompt._id);
            }}
          >
            {prompt.title}
          </div>
        ))}
      </div>

      {/* Popup Modal */}
      {isPopupVisible && (
        <div className="popup">
          <div className="popup-content">
            <h2>Enter Prompt Name</h2>
            <input
              type="text"
              value={newPromptTitle}
              onChange={handleInputChange}
              placeholder="Enter the name of your prompt"
            />
            <button className="popup-create-button" onClick={handleCreateNewPrompt}>
              Create Prompt
            </button>
            <button className="popup-cancel-button" onClick={handlePopupToggle}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default History;
