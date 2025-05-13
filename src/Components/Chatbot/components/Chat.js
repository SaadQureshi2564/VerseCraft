import React, { useState, useEffect, useRef } from 'react';
import sendBtn from '../styles/send-prompt.png';
import copyIcon from '../styles/chat-message-copy-icon.png';
import redoIcon from '../styles/chat-message-refresh-icon.png';
import speakIcon from '../styles/chat-message-speak-icon.png';

function Chat({ currentPrompt, onUpdateCurrentPrompt }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const outputAreaRef = useRef(null); // Ref for the output area to scroll to the bottom
 

  // Fetch and display messages when currentPrompt changes
  useEffect(() => {
    if (!currentPrompt) {
      setMessages([]);
      return;
    }
  
    console.log("Current Prompt:", currentPrompt);
    setMessages(currentPrompt.messages || []);
  
    if (currentPrompt) {  // Ensure currentPrompt.id exists before calling fetchChatMessages
      fetchChatMessages(currentPrompt);
    }
  }, [currentPrompt]);

  // Function to fetch chat messages for the given promptId
  const fetchChatMessages = async (promptId) => {
    
    try {
      const response = await fetch(`http://localhost:5001/api/chatMessages/${promptId}`);
      if (response.ok) {
        const fetchedMessages = await response.json();
        console.log("Fetched Messages:", fetchedMessages);
        setMessages(fetchedMessages);
      } else  {
        console.error("Error fetching messages");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

    // Scroll to bottom of chat output when messages update
    useEffect(() => {
      if (outputAreaRef.current) {
        outputAreaRef.current.scrollTop = outputAreaRef.current.scrollHeight;
      }
    }, [messages]);
  
    
  // Function to send messages
  const sendMessage = async () => {
    if (!currentPrompt) {
      alert('Please create or select a prompt first.');
      return;
    }

    if (input.trim() !== '') {
      const userMessage = { role: 'user', content: input };
      

      // Optimistically update messages locally to show user message immediately
      const tempMessages = [...messages, userMessage];
      setMessages(tempMessages);
      setInput(''); // Clear input immediately
      setIsLoading(true); // Set loading state to true

      // Update currentPrompt with user message
      const updatedPromptWithUserMsg = {
        ...currentPrompt,
        messages: tempMessages,
      };
      onUpdateCurrentPrompt(updatedPromptWithUserMsg);

      try {
        // Save user message to the database
        await saveChatMessage(currentPrompt, 'user', input);

        // Call the Flask API to get the model response
        const modelResponse = await queryLocalModelWithRetry(tempMessages);

        const llmMessage = { role: 'llm', content: modelResponse };

        // Update messages with LLM response
        const updatedMessages = [...tempMessages, llmMessage];
        setMessages(updatedMessages);

        // Save LLM response to the database
        await saveChatMessage(currentPrompt, 'llm', modelResponse);

        // Update currentPrompt with LLM response
        const updatedPromptWithLLM = {
          ...currentPrompt,
          messages: updatedMessages,
        };
        onUpdateCurrentPrompt(updatedPromptWithLLM);

      } catch (error) {
        console.error('Error processing message:', error);
        const errorMessage = { role: 'llm', content: 'Failed to get response from the model. Please try again.' };
        setMessages([...tempMessages, errorMessage]);
        const updatedPromptWithError = {
          ...currentPrompt,
          messages: [...tempMessages, errorMessage],
        };
        onUpdateCurrentPrompt(updatedPromptWithError);

      } finally {
        setIsLoading(false); // Set loading state to false regardless of success or failure
      }
    }
  };

  // Save chat message to the database
  const saveChatMessage = async (promptId, role, content) => {
    if (!promptId) {
      console.error("saveChatMessage called with undefined promptId");
      return;
    }
    try {
      await fetch('http://localhost:5001/api/chatMessages/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ promptId, role, content }), // Ensure promptId is passed correctly
      });
    } catch (error) {
      console.error('Error saving chat message:', error);
    }
  };


/// Query local model with retry logic
const queryLocalModelWithRetry = async (conversation, retries = 3, delay = 2000) => {
  const messagesForAPI = conversation.map((msg) => msg.content).join('\n'); // Combine all message contents for the API prompt

  let attempt = 0;
  while (attempt < retries) {
    try {
      const response = await fetch('http://127.0.0.1:8000/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: messagesForAPI }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      return data.story; // Return the generated story/response from the model
    } catch (error) {
      console.error(`Attempt ${attempt + 1}: Error during API call: ${error.message}`);
      attempt++;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delay)); // Delay between retries
      } else {
        console.warn('Model is unresponsive. Returning default story.');
        return "Once upon a time, in a quiet village nestled between rolling green hills, a young inventor named Elara discovered a hidden cave. Inside, she found an ancient machine, humming with energy. As she touched its surface, a holographic map appeared, revealing a long-lost civilization waiting to be rediscovered.";
      }
    }
  }
};

  // Automatically rerun the last user message, overwriting the response
  const rerunMessage = async () => {
    setIsLoading(true);
    const lastUserMessage = messages.findLast((msg) => msg.role === 'user');
    if (lastUserMessage) {
      const tempMessages = [...messages]; // Include entire conversation
      const updatedPromptWithUserMsg = {
        ...currentPrompt,
        messages: tempMessages,
      };
      onUpdateCurrentPrompt(updatedPromptWithUserMsg); // Update current prompt

      try {
        // Call the Flask API to get the model response
        const modelResponse = await queryLocalModelWithRetry(tempMessages);

        const llmMessage = { role: 'llm', content: modelResponse };

        // Overwrite the previous responses and update messages with the new LLM response
        setMessages([...tempMessages, llmMessage]);

        // Save LLM response to the database
        await saveChatMessage(currentPrompt, 'llm', modelResponse);

        // Update currentPrompt with LLM response
        const updatedPromptWithLLM = {
          ...currentPrompt,
          messages: [...tempMessages, llmMessage],
        };
        onUpdateCurrentPrompt(updatedPromptWithLLM);

      } catch (error) {
        console.error('Error processing message:', error);
        const errorMessage = { role: 'llm', content: 'Failed to get response from the model. Please try again.' };
        setMessages([...tempMessages, errorMessage]);
        const updatedPromptWithError = {
          ...currentPrompt,
          messages: [...tempMessages, errorMessage],
        };
        onUpdateCurrentPrompt(updatedPromptWithError);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Copy message to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    }).catch(err => {
      console.error("Failed to copy text: ", err);
      alert('Failed to copy to clipboard.');
    });
  };

  // Read aloud the message
  const readAloud = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="chatbot-content-area">
      {/* Output Area */}
      <div className="chatbot-output-area" ref={outputAreaRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`chatbot-message chatbot-${msg.role}-message`}>
            {msg.role === 'llm' && (
              <div className="chatbot-message-actions">
                <div className="chatbot-message-actions-copy" onClick={() => copyToClipboard(msg.content)} title="Copy to Clipboard">
                  <img src={copyIcon} alt="Copy" className="chat-message-copy-icon" />
                  copy
                </div>
                <div className="chatbot-message-actions-redo" onClick={rerunMessage} title="Rerun Message">
                <img src={redoIcon} alt="redo" className="chat-message-refresh-icon" />
                  redo
                </div>
                <div  className="chatbot-message-actions-speak" onClick={() => readAloud(msg.content)} title="Read Aloud">
                <img src={speakIcon} alt="speak" className="chat-message-speak-icon" />
                  speak
                </div>
              </div>
            )}
            <div className="chatbot-message-text">{msg.content}</div>
          </div>
        ))}
        {isLoading && (
          <div className="chatbot-message chatbot-llm-message">
            <div className="buffering-animation">
              <span className="chatbot-dot dot-1"></span>
              <span className="chatbot-dot dot-2"></span>
              <span className="chatbot-dot dot-3"></span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      
      <div className="chatbot-input-area">
  <textarea
    className="chatbot-input-textarea"
    value={input}
    onChange={(e) => setInput(e.target.value)}
    placeholder="Ask Anything"
    disabled={!currentPrompt || isLoading}
    onKeyDown={(e) => { 
      if (e.key === 'Enter' && !e.shiftKey) { // Prevents shift+enter from sending
        e.preventDefault(); // Prevents new line
        sendMessage();
      }
    }}
  />
  
  <div 
    className="chatbot-input-prompt-send-button" 
    onClick={sendMessage} // Sends message when clicked
    style={{ cursor: input.trim() ? 'pointer' : 'not-allowed', opacity: input.trim() ? 1 : 0.5 }}
  >
    <img src={sendBtn} alt="Send" className="chatbot-send-icon" />
  </div>
</div>
      
    </div>
  );
}

export default Chat;
