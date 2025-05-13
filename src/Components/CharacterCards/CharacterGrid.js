import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import CharacterCard from './CharacterCard';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const PageContainer = styled.div`
  background-color: #fefefe; /* Dark indigo */
 height: 100vh;
  padding: 10px;
  overflow:auto;
`;

const Header = styled.h1`
  text-align: center;
  color:black;
  margin: 10px 0;
  font-size: 2rem;
  font-weight: 500;
  text-transform: uppercase;
  border-bottom: 2px solid black; /* Warm orange */
 
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-left: 10px;
  overflow-x: auto;
  justify-items: center;
`;

const Loader = styled.div`
  text-align: center;
  font-size: 1.2rem;
  color:black; /* Warm orange */
`;

const ErrorMessage = styled.div`
  text-align: center;
  color: black; /* Warm orange */
  font-size: 1.2rem;
  padding: 20px;
  margin: 20px auto;
  max-width: 600px;
`;

const CharacterGrid = () => {
  const { projectId } = useParams();
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCharacters();
  }, [projectId]);

  const fetchCharacters = async () => {
    try {
      const response = await axios.get(`http://localhost:5001/api/characters`, {
        params: { projectId },
      });
      setCharacters(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch characters. Please try again.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <Loader>Loading characters...</Loader>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <ErrorMessage>{error}</ErrorMessage>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="character-card-back" style={{position:'Absolute' ,cursor:'pointer'
        ,top:'25px',left:'20px',backgroundColor:'#1F2247',borderRadius:'5px',padding:"5px",paddingRight:'10px',paddingLeft:'10px'
        ,color: 'white' ,border:'1px solid black'}} onClick={() => window.history.back()}>
        Go Back
      </div>
      <Header>Character Cards</Header>
      {characters.length === 0 ? (
        <Loader>No characters found for this project.</Loader>
      ) : (
        <Grid>
          {characters.map((character) => (
            <CharacterCard
              key={character._id}
              character={{
                image: character.backgroundImage ? `http://localhost:5001/${character.backgroundImage}` : null,
                name: character.fullName,
                age: character.age,
                gender: character.gender,
                ethnicity: character.ethnicity,
                summary: character.summary,
                backstory: character.backstory,
                physicalTraits: character.physicalTraits,
                personalityTraits: character.personalityTraits,
                characterArcs: character.characterArcs,
                relationships: character.relationships,
                skills: character.skills,
                weaknesses: character.weaknesses,
                roles: character.roles,
              }}
            />
          ))}
        </Grid>
      )}
    </PageContainer>
  );
};

export default CharacterGrid;
