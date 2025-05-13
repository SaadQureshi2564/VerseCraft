import React, { useState } from 'react';
import './noveldashboard.css';

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, isUser: true }]);
      setMessages([...messages, { text: input, isUser: true }, { text: 'This is a hardcoded reply.', isUser: false }]);
      setInput('');
    }
  };

  return (
    <div className="chatbot">
      <div className="chatbox">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.isUser ? 'user-message' : 'bot-message'}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input 
          className="chat-text-box"
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Type a message..." 
        />
        <button className="novelchat-button" onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default Chatbot;
