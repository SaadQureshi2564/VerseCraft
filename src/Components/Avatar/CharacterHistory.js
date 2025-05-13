// src/components/CharacterHistory.js
import React from 'react';

const CharacterHistory = ({ history }) => {
  return (
    <div className="character-history">
      <h2>Character History</h2>
      <ul>
        {history.map((character, index) => (
          <li key={index}>
            <strong>{character.characterData.name}</strong>: {character.characterData.appearance}, {character.characterData.backstory}, {character.characterData.role}, {character.characterData.genre}, {character.characterData.theme}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CharacterHistory;
