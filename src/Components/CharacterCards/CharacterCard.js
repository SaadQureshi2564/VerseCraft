import React, { useState } from 'react';
import styled, { css } from 'styled-components';

// Styled-components for the card
const Card = styled.div`
  background-color: #f9f6f2; /* Dark indigo */
  color: black;
  border: 1px solid black; /* Warm orange border */
  border-radius: 5px;
  overflow:hidden;
  width: 100%;
  
  max-width: 400px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2); /* Subtle shadow */
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  ${({ isExpanded }) =>
    isExpanded &&
    css`
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
      
    `}
`;

const Header = styled.div`
  background-color: #e1dbd6; /* Warm orange */
  color: #1F2247; /* Dark indigo text */
  padding: 20px;
  text-align: center;
  font-size: 1.2rem;
  font-weight: bold;
  border-bottom: 2px solidrgb(171, 149, 119); /* Warm orange border */
`;

const ProfilePicture = styled.div`
  width: 120px;
  height: 120px;
  JUSTIFY-CONTENT: CENTER;
  margin-left: 22%;
  align-self: center;
  marginTop :55%;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  border: 4px solid #F9FAFB; /* Light background */
`;

const ProfileImage = styled.img`
marginTop: 5%;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Name = styled.h2`
  font-size: 1.8rem;
  margin: 10px 0;
  text-align: center;
  color: black; /* Light background text */
`;

const SubDetails = styled.div`
  text-align: center;
  margin: 10px 0;
  color: black; /* Light gray text */
  font-size: 1rem;
`;

const Content = styled.div`
  padding: 16px;
  color: black; /* Light background text */
`;

const DetailRow = styled.div`
  font-size: 1rem;
  margin: 10px 0;
  color:black; 
  border-bottom: 1px solid rgba(244, 125, 75, 0.4); /* Orange border */
  padding-bottom: 10px;

  &:last-child {
    border-bottom: none;
  }
`;

const ExpandableSection = styled.div`
  margin-top: 20px;
  background-color:white; /* Slightly darker indigo */
  border-radius: 8px;
  padding: 16px;
  color:black;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Trait = styled.div`
  margin-bottom: 10px;
  font-size: 1rem;
  color: black; /* Warm orange */
`;

const ToggleButton = styled.button`
  background-color:white; /* Warm orange */
  color: black; /* Dark indigo */
  border: none;
  border-radius: 20px;
  padding: 10px 20px;
  font-size: 1rem;
  cursor: pointer;
  display: block;
  margin: 20px auto 10px;
  transition: background-color 0.3s ease;
  &:hover {
    background-color:#1F2247; /* Slightly darker orange */
    color:white;
  }
`;

const CharacterCard = ({ character }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    image,
    name,
    age,
    gender,
    ethnicity,
    summary,
    backstory,
    physicalTraits,
    personalityTraits,
    characterArcs,
    relationships,
    skills,
    weaknesses,
    roles,
  } = character;

  return (
    <Card isExpanded={isExpanded}>
      <Header>
        
        <ProfilePicture>
          <ProfileImage src={image || 'https://via.placeholder.com/120'} alt={`${name}'s profile`} />
        </ProfilePicture>
      </Header>
      <Content>
        <Name>{name}</Name>
        <SubDetails>{age} | {gender} | {ethnicity}</SubDetails>

        {isExpanded ? (
          <>
            <DetailRow><strong>Summary:</strong> {summary}</DetailRow>
            <DetailRow><strong>Backstory:</strong> {backstory}</DetailRow>

            <ExpandableSection>
              <h3 style={{ color: 'black',borderBottom:'1px solid black' }}>Physical Traits</h3>
              {physicalTraits.map((trait, index) => (
                <Trait key={index}>
                  <strong>{trait.name}:</strong> {trait.description}
                </Trait>
              ))}

              <h3 style={{ color: 'BLACK' ,borderBottom:'1px solid black'}}>Personality Traits</h3>
              {personalityTraits.map((trait, index) => (
                <Trait key={index}>
                  <strong>{trait.name}:</strong> {trait.description}
                </Trait>
              ))}

              <h3 style={{ color: 'BLACK' ,borderBottom:'1px solid black'}}>Character Arcs</h3>
              {characterArcs.map((arc, index) => (
                <Trait key={index}>
                  <strong>{arc.name}:</strong> {arc.description}
                </Trait>
              ))}

              <h3 style={{ color: 'BLACK' ,borderBottom:'1px solid black'}}>Relationships</h3>
              {relationships.map((relationship, index) => (
                <Trait key={index}>
                  <strong>{relationship.name}:</strong> {relationship.description}
                </Trait>
              ))}

              <h3 style={{ color: 'BLACK' ,borderBottom:'1px solid black'}}>Skills</h3>
              {skills.map((skill, index) => (
                <Trait key={index}>
                  <strong>{skill.name}:</strong> {skill.description}
                </Trait>
              ))}

              <h3 style={{ color: 'BLACK',borderBottom:'1px solid black' }}>Weaknesses</h3>
              {weaknesses.map((weakness, index) => (
                <Trait key={index}>
                  <strong>{weakness.name}:</strong> {weakness.description}
                </Trait>
              ))}

              <h3 style={{ color: 'BLACK',borderBottom:'1px solid black' }}>Roles</h3>
              {roles.map((role, index) => (
                <Trait key={index}>
                  <strong>{role.name}:</strong> {role.description}
                </Trait>
              ))}
            </ExpandableSection>
          </>
        ) : null}

        <ToggleButton onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? '▲ Collapse' : '▼ Expand'}
        </ToggleButton>
      </Content>
    </Card>
  );
};

export default CharacterCard;
