import React, { useState } from 'react';
import Chat from './Chat';
import History from './History';

function MainContent({ currentPrompt, onNewPrompt, prompts, selectedProjectId, onUpdateCurrentPrompt ,selectedPrompt,  chatStarted, setChatStarted, chatVisibility, setChatVisibility}) {
  return (
    <div className="chatbot-main">
      <Chat
        currentPrompt={currentPrompt} 
        onUpdateCurrentPrompt={onUpdateCurrentPrompt}
        selectedPrompt={selectedPrompt}
        chatStarted={chatStarted}  // Pass chatStarted
        setChatStarted={setChatStarted}  // Pass setChatStarted
        chatVisibility={chatVisibility}
        setChatVisibility={setChatVisibility}

      />
      <History
        onNewPrompt={onNewPrompt} 
        prompts={prompts} 
        selectedProjectId={selectedProjectId}
        onUpdateCurrentPrompt={onUpdateCurrentPrompt}
        selectedPrompt={selectedPrompt}
        setChatStarted={setChatStarted}
        chatVisibility={chatVisibility}
        setChatVisibility={setChatVisibility}

      />
    </div>
  );
}

export default MainContent;
