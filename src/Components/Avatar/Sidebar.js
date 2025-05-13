// src/Sidebar.js
import React, { useState } from 'react';

const Sidebar = ({ history, setCharacterHistory }) => {
  const [collapsed, setCollapsed] = useState(false);

  const deleteCharacter = (index) => {
    setCharacterHistory((prevHistory) => prevHistory.filter((_, i) => i !== index));
  };

  const editCharacter = (index) => {
    // Logic for editing a character
    // For example, you can open a modal or update the CharacterForm with existing data
    console.log(`Editing character at index ${index}`);
  };

  return (
    <div className={`avatar-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <button className="avatar-sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
        {collapsed ? 'Expand' : 'Collapse'}
      </button>
      <h2>Character History</h2>
      <ul>
        {history.map((character, index) => (
          <li key={index} className="avatar-history-item">
            <span>{character.name}</span>
            <div className="avatar-history-item-actions">
              <button onClick={() => deleteCharacter(index)}>Delete</button>
              <button onClick={() => editCharacter(index)}>Edit</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
