// frontend/src/components/Character.js

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './character.css';
import characterIcon from '../Images/Character.png';
import uploadIcon from '../Images/upload.png';
import plusIcon from '../Images/Plus.png';
import closeIcon from '../Images/Close.png';
import verticalOptionIcon from '../Images/Close.png';
import ImageUploading from 'react-images-uploading';
import Modal from 'react-modal';
import AddCollaborators from '../NovelDashboard/AddCollaborators'; // Import AddCollaborators component
import Header from '../Header/header';
import Sidebar from '../Sidebar/sidebar';



Modal.setAppElement('#root');

function Character() {
    const { projectId } = useParams(); // Assuming projectId refers to Story ID
    const navigate = useNavigate();

    // State variables
    const [visible, setVisible] = useState(false);
    const [images, setImages] = useState([]);
    const [backgroundImage, setBackgroundImage] = useState(null);
    const [isTransparent, setIsTransparent] = useState(false);
    const [modalPage, setModalPage] = useState(1); // State to track modal pages
    const [newNote, setNewNote] = useState('');
    const [user, setUser] = useState(null);

    const [info, setInfo] = useState({
        fullName: '',
        age: '',
        gender: '',
        ethnicity: '',
    });

    const [summary, setSummary] = useState('');
    const [backstory, setBackstory] = useState('');

    const [physicalTraits, setPhysicalTraits] = useState([{ name: '', description: '' }]);
    const [personalityTraits, setPersonalityTraits] = useState([{ name: '', description: '' }]);
    const [characterArcs, setCharacterArcs] = useState([{ name: '', description: '' }]);
    const [relationships, setRelationships] = useState([{ name: '', description: '' }]);
    const [skills, setSkills] = useState([{ name: '', description: '' }]);
    const [weaknesses, setWeaknesses] = useState([{ name: '', description: '' }]);
    const [roles, setRoles] = useState([{ name: '', description: '' }]);

    const [characters, setCharacters] = useState([]); // To store fetched characters

 
    const [isAddCollaboratorsOpen, setIsAddCollaboratorsOpen] = useState(false);

    // New state variables for the description popup and image generation
    const [isDescriptionPopupVisible, setIsDescriptionPopupVisible] = useState(false);
    const [description, setDescription] = useState('');
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);

    // Image upload configurations
    const maxNumber = 1;
    const onChange = (imageList) => {
        setImages(imageList);
    };

    const handleSave = () => {
        if (images.length > 0) {
            setBackgroundImage(images[0].data_url); // Set the background image to the first selected image
            setIsTransparent(true); // Make h1 and upload-image transparent
            setVisible(false); // Close the modal
        }
    };

    const handleRemove = () => {
        setBackgroundImage(null); // Remove the background image
        setIsTransparent(false); // Reset transparency for h1 and upload-image
    };

    // Handle input changes for basic info
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setInfo((prevInfo) => ({
            ...prevInfo,
            [name]: value,
        }));
    };

    const handleSummaryChange = (e) => {
        setSummary(e.target.value);
    };

    const handleBackstoryChange = (e) => {
        setBackstory(e.target.value);
    };

    // Functions to add and delete traits
    const addTrait = (setTraitFunction, traitList) => {
        setTraitFunction([...traitList, { name: '', description: '' }]);
    };

    const deleteTrait = (indexToDelete, setTraitFunction, traitList) => {
        setTraitFunction(traitList.filter((_, index) => index !== indexToDelete));
    };
    

    // Fetch characters on component mount
    useEffect(() => {
        fetchCharacters();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchCharacters = async () => {
        try {
            const response = await axios.get(`http://localhost:5001/api/characters?projectId=${projectId}`);
            setCharacters(response.data);
        } catch (error) {
            console.error('Error fetching characters:', error);
        }
    };

    const handleCharacterGridClick = () => {
        navigate(`/CharacterGrid/${projectId}`);
    };

    // Handle form submission to create a new character
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Prepare form data
            const formData = new FormData();
            formData.append('projectId', projectId);
            formData.append('fullName', info.fullName);
            formData.append('age', info.age);
            formData.append('gender', info.gender);
            formData.append('ethnicity', info.ethnicity);
            formData.append('summary', summary);
            formData.append('backstory', backstory);
            formData.append('physicalTraits', JSON.stringify(physicalTraits));
            formData.append('personalityTraits', JSON.stringify(personalityTraits));
            formData.append('characterArcs', JSON.stringify(characterArcs));
            formData.append('relationships', JSON.stringify(relationships));
            formData.append('skills', JSON.stringify(skills));
            formData.append('weaknesses', JSON.stringify(weaknesses));
            formData.append('roles', JSON.stringify(roles));

            if (images.length > 0) {
                // Assuming only one image is allowed
                formData.append('backgroundImage', images[0].file);
            } else if (backgroundImage) {
                // If backgroundImage is a data URL, convert it to a Blob
                const blob = dataURLtoBlob(backgroundImage);
                formData.append('backgroundImage', blob, 'generated-image.png');
            }

            // Send POST request to backend
            const response = await axios.post('http://localhost:5001/api/characters', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Update character list
            setCharacters([...characters, response.data]);

            // Reset form
            setInfo({
                fullName: '',
                age: '',
                gender: '',
                ethnicity: '',
            });
            setSummary('');
            setBackstory('');
            setPhysicalTraits([{ name: '', description: '' }]);
            setPersonalityTraits([{ name: '', description: '' }]);
            setCharacterArcs([{ name: '', description: '' }]);
            setRelationships([{ name: '', description: '' }]);
            setSkills([{ name: '', description: '' }]);
            setWeaknesses([{ name: '', description: '' }]);
            setRoles([{ name: '', description: '' }]);
            setImages([]);
            setBackgroundImage(null);
            setIsTransparent(false);
        } catch (error) {
            console.error('Error creating character:', error);
        }
    };

    // Function to convert data URL to Blob
    const dataURLtoBlob = (dataurl) => {
        const arr = dataurl.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type:mime});
    }

    // Handle Generate button click
    const handleGenerateClick = () => {
        setIsDescriptionPopupVisible(true);
    };

    // Handle image generation
    const handleGenerateImage = async () => {
        if (!description) return;

        setIsGeneratingImage(true);

        try {
            const response = await fetch(
                "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev",
                {
                    headers: {
                        Authorization: "Bearer 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",
                        "Content-Type": "application/json",
                    },
                    method: "POST",
                    body: JSON.stringify({ inputs: description }),
                }
            );
            const resultBlob = await response.blob();
            // Convert blob to data URL
            const reader = new FileReader();
            reader.readAsDataURL(resultBlob);
            reader.onloadend = () => {
                const base64data = reader.result;
                setBackgroundImage(base64data);
                setIsTransparent(true);
                setIsDescriptionPopupVisible(false);
                setIsGeneratingImage(false);
            };
        } catch (error) {
            console.error('Error generating image:', error);
            setIsGeneratingImage(false);
        }
    };

    



    return (
        <div className="character-container">
             <Header/>
             <Sidebar projectId={projectId} />



      <div className="character-main-dashboard">

   

            {/* Character Overview */}

            <div className="character-overview">
                <div className="character-save-btn" onClick={handleSubmit}><span class="text">Save Character</span></div>
                <div className="character-see-btn" onClick={handleCharacterGridClick} 
                style={{
                        marginTop: `5%`,
                    }} 
                ><span class="text">View Character</span></div>

                <div className="character-list">Character List</div>

                <ul className="character-list__items">
                    {characters.map((char) => (
                        <li key={char._id} className="character-list__item">
                            {char.backgroundImage && (
                                <img src={`http://localhost:5001/${char.backgroundImage}`} alt={char.fullName} className="character-list__picture" />
                            )}
                            {!char.backgroundImage && (
                                <img src={characterIcon} alt={char.fullName} className="character-list__picture" />
                            )}
                            <span className="character-list__name">{char.fullName}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Character Dashboard */}
            <div className="character-dashboard">
                <div
                    className="character-image"
                    style={{
                        backgroundImage: `url(${backgroundImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                >
                    <h1 style={{ opacity: isTransparent ? 0 : 1 }}>Choose image</h1>
                    <img
                        src={uploadIcon}
                        alt="upload"
                        className="character-upload-image"
                        onClick={() => setVisible(true)}
                        style={{ opacity: isTransparent ? 0.0 : 1, zIndex: 10 }}
                    />

                    {/* Main Modal */}
                    <Modal className="character-image-popup" isOpen={visible} onRequestClose={() => setVisible(false)}>
                        {/* Slide transition based on modalPage */}
                        <div className={`character-modal-page ${modalPage === 1 ? 'slide-in' : 'slide-out'}`}>
                            <h1>Select Image</h1>
                            <img src={closeIcon} alt="close" className="character-close-icon" onClick={() => setVisible(false)} />

                            <div className="character-app">
                                <ImageUploading multiple value={images} onChange={onChange} maxNumber={maxNumber} dataURLKey="data_url">
                                    {({ imageList, onImageUpload }) => (
                                        <div className="character-upload__image-wrapper">
                                            <button className="character-uploader" onClick={onImageUpload}>
                                                Upload image
                                            </button>

                                            {imageList.map((image, index) => (
                                                <div key={index} className="character-image-item">
                                                    <img src={image.data_url} className="character-image-selected" alt="image-selected" />
                                                    <div className="character-image-item__btn-wrapper">
                                                        <button className="character-updater" onClick={handleSave}>Save</button>
                                                        <button className="character-remover" onClick={handleRemove}>Remove</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </ImageUploading>
                                <div>
                                    <button onClick={handleGenerateClick} className="character-next-page-button">Generate</button>

                                    {/* Conditionally render the description popup */}
                                    {isDescriptionPopupVisible && (
                                        <div className="character-description-modal-overlay">
                                            <div className="character-description-modal-content">
                                                <button onClick={() => setIsDescriptionPopupVisible(false)} className="character-description-close-popup-button">Close</button>
                                                <textarea
                                                    placeholder="Enter character description"
                                                    value={description}
                                                    onChange={(e) => setDescription(e.target.value)}
                                                    className="character-description-textarea"
                                                />
                                                <button onClick={handleGenerateImage} disabled={isGeneratingImage}>
                                                    {isGeneratingImage ? 'Generating...' : 'Generate Image'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Modal>
                </div>

                {/* Character Summary */}
                <div className="character-summary">
                    <h1>Summary</h1>
                    <textarea
                        value={summary}
                        onChange={handleSummaryChange}
                        className="character-summary-textarea"
                        placeholder="Enter the summary of the character"
                    />
                </div>

                {/* Basic Information */}
                <div className="character-basic-info">
                    <div className="character-basic-heading">Basic Information</div>

                    <div className="character-field">
                        <div className="character-label">Full name</div>
                        <input
                            type="text"
                            name="fullName"
                            value={info.fullName}
                            onChange={handleInputChange}
                            className="character-input-field"
                            placeholder="Enter full name"
                        />
                    </div>

                    <div className="character-field">
                        <div className="character-label">Age</div>
                        <input
                            type="text"
                            name="age"
                            value={info.age}
                            onChange={handleInputChange}
                            className="character-input-field"
                            placeholder="Enter age"
                        />
                    </div>

                    <div className="character-field">
                        <div className="character-label">Gender</div>
                        <input
                            type="text"
                            name="gender"
                            value={info.gender}
                            onChange={handleInputChange}
                            className="character-input-field"
                            placeholder="Enter gender"
                        />
                    </div>

                    <div className="character-field">
                        <div className="character-label">Ethnicity</div>
                        <input
                            type="text"
                            name="ethnicity"
                            value={info.ethnicity}
                            onChange={handleInputChange}
                            className="character-input-field"
                            placeholder="Enter ethnicity"
                        />
                    </div>
                </div>

                {/* Backstory */}
                <div className="character-backstory">
                    <h1>Backstory</h1>
                    <textarea
                        value={backstory}
                        onChange={handleBackstoryChange}
                        className="character-backstory-textarea"
                        placeholder="Enter the backstory of the character"
                    />
                </div>

                {/* Physical Traits */}
                <div className="character-physical-traits">
                    <h1>Physical Traits</h1>
                    <button className="character-add-physical" onClick={() => addTrait(setPhysicalTraits, physicalTraits)}>
                        <img src={plusIcon} alt="plus" className="character-plus-icon" />
                    </button>
                    {physicalTraits.map((trait, index) => (
                        <div key={index} className="character-trait-item">
                            <input
                                type="text"
                                placeholder="Trait Name"
                                value={trait.name}
                                onChange={(e) => {
                                    const updatedTraits = [...physicalTraits];
                                    updatedTraits[index].name = e.target.value;
                                    setPhysicalTraits(updatedTraits);
                                }}
                                className="character-trait-name-input"
                            />
                            <textarea
                                placeholder="Add description"
                                value={trait.description}
                                onChange={(e) => {
                                    const updatedTraits = [...physicalTraits];
                                    updatedTraits[index].description = e.target.value;
                                    setPhysicalTraits(updatedTraits);
                                }}
                                className="character-trait-description-textarea"
                            />
                            <img
                                src={verticalOptionIcon}
                                alt="vert"
                                className="character-vert-icon"
                                onClick={() => deleteTrait(index, setPhysicalTraits, physicalTraits)}
                            />
                        </div>
                    ))}
                </div>

                {/* Personality Traits */}
                <div className="character-personality-traits">
                    <h1>Personality Traits</h1>
                    <button className="character-add-personality" onClick={() => addTrait(setPersonalityTraits, personalityTraits)}>
                        <img src={plusIcon} alt="plus" className="character-plus-icon" />
                    </button>
                    {personalityTraits.map((trait, index) => (
                        <div key={index} className="character-trait-item">
                            <input
                                type="text"
                                placeholder="Trait Name"
                                value={trait.name}
                                onChange={(e) => {
                                    const updatedTraits = [...personalityTraits];
                                    updatedTraits[index].name = e.target.value;
                                    setPersonalityTraits(updatedTraits);
                                }}
                                className="character-trait-name-input"
                            />
                            <textarea
                                placeholder="Add description"
                                value={trait.description}
                                onChange={(e) => {
                                    const updatedTraits = [...personalityTraits];
                                    updatedTraits[index].description = e.target.value;
                                    setPersonalityTraits(updatedTraits);
                                }}
                                className="character-trait-description-textarea"
                            />
                            <img
                                src={verticalOptionIcon}
                                alt="vert"
                                className="character-vert-icon"
                                onClick={() => deleteTrait(index, setPersonalityTraits, personalityTraits)}
                            />
                        </div>
                    ))}
                </div>

                {/* Character Arcs */}
                <div className="character-character-arcs">
                    <h1>Character Arcs</h1>
                    <button className="character-add-character-arc" onClick={() => addTrait(setCharacterArcs, characterArcs)}>
                        <img src={plusIcon} alt="plus" className="character-plus-icon" />
                    </button>
                    {characterArcs.map((arc, index) => (
                        <div key={index} className="character-trait-item">
                            <input
                                type="text"
                                placeholder="Arc Name"
                                value={arc.name}
                                onChange={(e) => {
                                    const updatedArcs = [...characterArcs];
                                    updatedArcs[index].name = e.target.value;
                                    setCharacterArcs(updatedArcs);
                                }}
                                className="character-trait-name-input"
                            />
                            <textarea
                                placeholder="Add description"
                                value={arc.description}
                                onChange={(e) => {
                                    const updatedArcs = [...characterArcs];
                                    updatedArcs[index].description = e.target.value;
                                    setCharacterArcs(updatedArcs);
                                }}
                                className="character-trait-description-textarea"
                            />
                            <img
                                src={verticalOptionIcon}
                                alt="vert"
                                className="character-vert-icon"
                                onClick={() => deleteTrait(index, setCharacterArcs, characterArcs)}
                            />
                        </div>
                    ))}
                </div>

                {/* Relationships */}
                <div className="character-relationships">
                    <h1>Relationships</h1>
                    <button className="character-add-relationship" onClick={() => addTrait(setRelationships, relationships)}>
                        <img src={plusIcon} alt="plus" className="character-plus-icon" />
                    </button>
                    {relationships.map((relationship, index) => (
                        <div key={index} className="character-trait-item">
                            <input
                                type="text"
                                placeholder="Relationship Name"
                                value={relationship.name}
                                onChange={(e) => {
                                    const updatedRelationships = [...relationships];
                                    updatedRelationships[index].name = e.target.value;
                                    setRelationships(updatedRelationships);
                                }}
                                className="character-trait-name-input"
                            />
                            <textarea
                                placeholder="Add description"
                                value={relationship.description}
                                onChange={(e) => {
                                    const updatedRelationships = [...relationships];
                                    updatedRelationships[index].description = e.target.value;
                                    setRelationships(updatedRelationships);
                                }}
                                className="character-trait-description-textarea"
                            />
                            <img
                                src={verticalOptionIcon}
                                alt="vert"
                                className="character-vert-icon"
                                onClick={() => deleteTrait(index, setRelationships, relationships)}
                            />
                        </div>
                    ))}
                </div>

                {/* Skills */}
                <div className="character-skills">
                    <h1>Skills</h1>
                    <button className="character-add-skill" onClick={() => addTrait(setSkills, skills)}>
                        <img src={plusIcon} alt="plus" className="character-plus-icon" />
                    </button>
                    {skills.map((skill, index) => (
                        <div key={index} className="character-trait-item">
                            <input
                                type="text"
                                placeholder="Skill Name"
                                value={skill.name}
                                onChange={(e) => {
                                    const updatedSkills = [...skills];
                                    updatedSkills[index].name = e.target.value;
                                    setSkills(updatedSkills);
                                }}
                                className="character-trait-name-input"
                            />
                            <textarea
                                placeholder="Add description"
                                value={skill.description}
                                onChange={(e) => {
                                    const updatedSkills = [...skills];
                                    updatedSkills[index].description = e.target.value;
                                    setSkills(updatedSkills);
                                }}
                                className="character-trait-description-textarea"
                            />
                            <img
                                src={verticalOptionIcon}
                                alt="vert"
                                className="character-vert-icon"
                                onClick={() => deleteTrait(index, setSkills, skills)}
                            />
                        </div>
                    ))}
                </div>

                {/* Weaknesses */}
                <div className="character-weaknesses">
                    <h1>Weaknesses</h1>
                    <button className="character-add-weakness" onClick={() => addTrait(setWeaknesses, weaknesses)}>
                        <img src={plusIcon} alt="plus" className="character-plus-icon" />
                    </button>
                    {weaknesses.map((weakness, index) => (
                        <div key={index} className="character-trait-item">
                            <input
                                type="text"
                                placeholder="Weakness Name"
                                value={weakness.name}
                                onChange={(e) => {
                                    const updatedWeaknesses = [...weaknesses];
                                    updatedWeaknesses[index].name = e.target.value;
                                    setWeaknesses(updatedWeaknesses);
                                }}
                                className="character-trait-name-input"
                            />
                            <textarea
                                placeholder="Add description"
                                value={weakness.description}
                                onChange={(e) => {
                                    const updatedWeaknesses = [...weaknesses];
                                    updatedWeaknesses[index].description = e.target.value;
                                    setWeaknesses(updatedWeaknesses);
                                }}
                                className="character-trait-description-textarea"
                            />
                            <img
                                src={verticalOptionIcon}
                                alt="vert"
                                className="character-vert-icon"
                                onClick={() => deleteTrait(index, setWeaknesses, weaknesses)}
                            />
                        </div>
                    ))}
                </div>

                {/* Roles */}
                <div className="character-roles">
                    <h1>Roles</h1>
                    <button className="character-add-role" onClick={() => addTrait(setRoles, roles)}>
                        <img src={plusIcon} alt="plus" className="character-role-icon" />
                    </button>
                    {roles.map((role, index) => (
                        <div key={index} className="character-trait-item">
                            <input
                                type="text"
                                placeholder="Role Name"
                                value={role.name}
                                onChange={(e) => {
                                    const updatedRoles = [...roles];
                                    updatedRoles[index].name = e.target.value;
                                    setRoles(updatedRoles);
                                }}
                                className="character-trait-name-input"
                            />
                            <textarea
                                placeholder="Add description"
                                value={role.description}
                                onChange={(e) => {
                                    const updatedRoles = [...roles];
                                    updatedRoles[index].description = e.target.value;
                                    setRoles(updatedRoles);
                                }}
                                className="character-trait-description-textarea"
                            />
                            <img
                                src={verticalOptionIcon}
                                alt="vert"
                                className="character-vert-icon"
                                onClick={() => deleteTrait(index, setRoles, roles)}
                            />
                        </div>
                    ))}
                </div>
            </div>
            </div>

  
      
        </div>
    );
}

export default Character;
