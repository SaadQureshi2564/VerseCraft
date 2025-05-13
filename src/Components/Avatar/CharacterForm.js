// src/CharacterForm.js
import React, { useState } from 'react';

const CharacterForm = ({ setCharacterHistory }) => {
  const [characterData, setCharacterData] = useState({
    name: '',
    appearance: '',
    backstory: '',
    role: '',
    genre: '',
    theme: '',
  });
  const [avatars, setAvatars] = useState([]); // Store all generated avatars
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Replace with your actual Hugging Face API key
  const HF_API_KEY = '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';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCharacterData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Function to query Flux API
  const queryFluxAPI = async (prompt) => {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev',
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({ inputs: prompt }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to generate image');
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Construct a descriptive prompt based on character data
    const prompt = `${characterData.name}, ${characterData.appearance}, ${characterData.role}, ${characterData.genre}, ${characterData.theme}`;

    try {
      const avatarURL = await queryFluxAPI(prompt);
      setAvatars((prevAvatars) => [...prevAvatars, avatarURL]);
      setCharacterHistory((prevHistory) => [
        ...prevHistory,
        { ...characterData, avatar: avatarURL },
      ]);
      setCharacterData({
        name: '',
        appearance: '',
        backstory: '',
        role: '',
        genre: '',
        theme: '',
      });
    } catch (err) {
      console.error(err);
      setError('Failed to generate avatar. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Export functionality logic here
    console.log('Exporting character data...');
  };

  const handleSave = () => {
    // Save functionality logic here
    console.log('Saving character data...');
  };

  return (
    <div className="avatar-character-form">
      <h2>Create Your Character</h2>
      <div className="avatar-avatar-preview">
        {avatars.map((avatar, index) => (
          <img key={index} src={avatar} alt="Character Avatar" />
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={characterData.name}
          onChange={handleChange}
          placeholder="Character Name"
          required
        />
        <textarea
          name="appearance"
          value={characterData.appearance}
          onChange={handleChange}
          placeholder="Appearance Description"
          required
        />
        <textarea
          name="backstory"
          value={characterData.backstory}
          onChange={handleChange}
          placeholder="Backstory"
          required
        />
        <input
          type="text"
          name="role"
          value={characterData.role}
          onChange={handleChange}
          placeholder="Role"
          required
        />
        <input
          type="text"
          name="genre"
          value={characterData.genre}
          onChange={handleChange}
          placeholder="Genre"
          required
        />
        <select
          name="theme"
          value={characterData.theme}
          onChange={handleChange}
          required
        >
          <option value="">Select a Theme</option>
          <option value="Heroic">Heroic</option>
          <option value="Dark">Dark</option>
          <option value="Mystical">Mystical</option>
        </select>
        <div className="avatar-button-group">
          <button type="submit" className="avatar-generate-btn" disabled={loading}>
            {loading ? 'Generating...' : 'Generate Character'}
          </button>
          <button type="button" onClick={handleExport} className="avatar-export-btn">
            Export
          </button>
          <button type="button" onClick={handleSave} className="avatar-save-btn">
            Save
          </button>
        </div>
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
};

export default CharacterForm;
