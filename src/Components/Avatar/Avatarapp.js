// src/App.js
import React, { useState } from 'react';
import CharacterForm from './CharacterForm'; 
import './styles/Avatar.css';

function App() {
  const [characterHistory, setCharacterHistory] = useState([]);

  return (
    <div className="avatar-app-body">
      <div className="avatar-app-container">
        <header className="avatar-app-header">
          <div className="avatar-avatar-generator-title">
            <h1>Character Avatar Generator</h1> 
          </div>
          <div className="avatar-character-profiles">
            <h2>Character Profiles</h2>
            <div className="avatar-profiles-container">
              {characterHistory.length > 0 ? (
                characterHistory.map((character, index) => (
                  <div key={index} className="avatar-character-profile">
                    <div className="avatar-profile-image">
                      <img src={character.avatar} alt={`${character.name} Avatar`} />
                    </div>
                    <table>
                      <tbody>
                        <tr>
                          <td>Name:</td>
                          <td>{character.name}</td>
                        </tr>
                        <tr>
                          <td>Appearance:</td>
                          <td>{character.appearance}</td>
                        </tr>
                        <tr>
                          <td>Backstory:</td>
                          <td>{character.backstory}</td>
                        </tr>
                        <tr>
                          <td>Role:</td>
                          <td>{character.role}</td>
                        </tr>
                        <tr>
                          <td>Genre:</td>
                          <td>{character.genre}</td>
                        </tr>
                        <tr>
                          <td>Theme:</td>
                          <td>{character.theme}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ))
              ) : (
                <div className="avatar-character-profile placeholder">
                  <p>No characters created yet.</p>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="avatar-main-content">
          <CharacterForm setCharacterHistory={setCharacterHistory} />
        </main>
      </div>
    </div>
  );
}

export default App;
