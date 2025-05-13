// src/Components/Plot/Plot.js

import React, { useState, useRef, useEffect } from 'react';
import './plot.css';
import plotIcon from '../Images/Plot.png';
import characterIcon from '../Images/Character.png';
import publishIcon from '../Images/Published.png';
import goalIcon from '../Images/goal.png';
import comIcon from "../Images/comm.png";
import plusIcon from '../Images/Plus.png';
import downrightIcon from '../Images/downright.png';
import zoomInIcon from '../Images/zoom_in.png';
import zoomOutIcon from '../Images/zoom_out.png';
import { useParams, useNavigate } from 'react-router-dom';
//import { toast, ToastContainer } from 'react-toastify';
//import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import Lottie from 'react-lottie';
import menuAnimation from '../Images/menu-animation.json'; 
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { Modal } from '@mui/material';
import { Box, Button} from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import IconButton from '@mui/material/IconButton';
import Header from '../Header/header';
import Sidebar from '../Sidebar/sidebar';


function Plot() {

    const { projectId } = useParams(); // Project ID from route parameters

    // State Variables
    const [chapters, setChapters] = useState([]); // List of chapters
    const [selectedChapterId, setSelectedChapterId] = useState(null); // Currently selected chapter
    const [mainPlots, setMainPlots] = useState([]); // Plots of the selected chapter
    const [isModalOpen, setIsModalOpen] = useState(false); // Modal for plot actions
    const [sectionModalOpen, setSectionModalOpen] = useState(false); // Modal for section deletion
    const [currentIndex, setCurrentIndex] = useState(null); // Current plot index for actions
    const [currentSection, setCurrentSection] = useState(null); // Current section info for actions
    const [showSections, setShowSections] = useState({}); // Toggle visibility of sections per plot
    const [zoomLevel, setZoomLevel] = useState(1); // Zoom level state
    const [overviewColors, setOverviewColors] = useState({}); // Colors for overview items
    const [customMenuVisible, setCustomMenuVisible] = useState(false); // Custom context menu visibility
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 }); // Position for context menu
    const [selectedOverviewIndex, setSelectedOverviewIndex] = useState(null); // Selected overview item
    const [characters, setCharacters] = useState([]); // Global characters list
    const [projectType, setProjectType] = useState(null); // Store the project type
    const [user, setUser] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    // Sidebar State
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Refs
    const mainPlotVisualRef = useRef(null);
    const overviewRefs = useRef({});

    const navigate = useNavigate();

    // Define overviewRef correctly
    const overviewRef = (mainPlotIndex, sectionIndex) => (element) => {
        overviewRefs.current[`${mainPlotIndex}-${sectionIndex}`] = element;
    };


const fetchChapters = async () => {
    try {
        const token = localStorage.getItem('token'); // Ensure token is stored
        const headers = {
            'Authorization': `Bearer ${token}`, // Authorization header
            'Content-Type': 'application/json',
        };

        let response;

        // Attempt to fetch chapters for story
        try {
            response = await axios.get(`/api/stories/${projectId}/chapters`, { headers });
            if (response.data && response.data.length > 0) {
                setChapters(response.data);
                setSelectedChapterId(response.data[0]._id); // Optional: Select the first chapter
                return;
            }
        } catch (error) {
            if (error.response && error.response.status !== 404) {
                throw error; // Re-throw if not a 404 error
            }
        }

        // Attempt to fetch chapters for novel
        try {
            response = await axios.get(`/api/novels/${projectId}/chapters`, { headers });
            if (response.data && response.data.length > 0) {
                setChapters(response.data);
                setSelectedChapterId(response.data[0]._id); // Optional: Select the first chapter
                return;
            }
        } catch (error) {
            if (error.response && error.response.status !== 404) {
                throw error; // Re-throw if not a 404 error
            }
        }

        // Attempt to fetch chapters for Urdu project
        try {
            response = await axios.get(`/api/urduchapters/${projectId}`, { headers });
            if (response.data && response.data.length > 0) {
                setChapters(response.data);
                setSelectedChapterId(response.data[0]._id); // Optional: Select the first chapter
                return;
            }
        } catch (error) {
            if (error.response && error.response.status !== 404) {
                throw error; // Re-throw if not a 404 error
            }
        }

        // If no chapters are found in any category
        throw new Error('Chapters not found for any project type.');

    } catch (error) {
        console.error("Error fetching chapters:", error);
       // toast.error(`Error fetching chapters: ${error.message}`);
    }
};

    

    // Fetch Plots for a Specific Chapter
    const fetchPlots = async (chapterId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/chapters/${chapterId}/plots`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                if (response.status === 404) {
                    // No plots found for this chapter
                    setMainPlots([]);
                   // toast.info('No plots found for this chapter. Start by adding a new plot.');
                    return;
                } else {
                    throw new Error('Failed to fetch plots.');
                }
            }
            const data = await response.json();
            setMainPlots(data);
        } catch (error) {
            console.error("Error fetching plots:", error);
         //   toast.error(`Error fetching plots: ${error.message}`);
        }
    };

    // Extract unique characters from all plots and set to global characters list
    useEffect(() => {
        const uniqueCharacters = new Set();
        mainPlots.forEach(plot => {
            plot.sections.forEach(section => {
                section.characters.forEach(char => {
                    if (char && char.trim() !== '') {
                        uniqueCharacters.add(char.trim());
                    }
                });
            });
        });
        setCharacters([...uniqueCharacters]);
    }, [mainPlots]);

    // Save Plots to the Database
    const savePlots = async () => {
        if (!selectedChapterId) {
           // toast.warn('Please select a chapter to save plots.');
            return;
        }

        // Validate all plots have names
        for (const [index, plot] of mainPlots.entries()) {
            if (!plot.name || plot.name.trim() === '') {
               // toast.error(`Plot ${index + 1} has an empty name. Please provide a name.`);
                return;
            }
        }

        try {
            const token = localStorage.getItem('token');
            const updatedPlots = [...mainPlots]; // Clone mainPlots to update with created plot IDs

            for (let index = 0; index < mainPlots.length; index++) {
                const plot = mainPlots[index];
                const plotData = {
                    name: plot.name,
                    sections: plot.sections.map(section => ({
                        name: section.name,
                        summary: section.summary,
                        characters: section.characters,
                    })),
                };

                if (plot._id) {
                    // Existing plot, perform PUT
                    const response = await fetch(`/api/chapters/${selectedChapterId}/plots/${plot._id}`, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(plotData),
                    });
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(`Failed to update plot "${plot.name}". ${errorData.message || ''}`);
                    }
                } else {
                    // New plot, perform POST
                    const response = await fetch(`/api/chapters/${selectedChapterId}/plots`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(plotData),
                    });
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(`Failed to create plot "${plot.name}". ${errorData.message || ''}`);
                    }
                    const createdPlot = await response.json();
                    // Update the plot in the cloned array with the assigned _id from the backend
                    updatedPlots[index] = createdPlot;
                }
            }

            // Update the mainPlots state with the updatedPlots array
            setMainPlots(updatedPlots);
           // toast.success('Plots saved successfully!');
        } catch (error) {
            console.error("Error saving plots:", error);
          //  toast.error(`Error saving plots: ${error.message}`);
        }
    };

    // Zoom Handlers
    const handleZoomIn = () => {
        const newZoomLevel = Math.min(zoomLevel + 0.1, 2); // Cap at 2x zoom
        setZoomLevel(newZoomLevel);
    };

    const handleZoomOut = () => {
        const newZoomLevel = Math.max(zoomLevel - 0.1, 0.5); // Min zoom level is 0.5x
        setZoomLevel(newZoomLevel);
    };

    // Adjust Container Width Based on Zoom Level
    useEffect(() => {
        if (mainPlotVisualRef.current) {
            const newWidth = `${100 / zoomLevel}%`; // Adjust width based on zoom
            mainPlotVisualRef.current.style.width = newWidth;
        }
    }, [zoomLevel]);

   


   
  

    // Handle Main Plot Name Change
    const handleMainPlotNameChange = (index, newName) => {
        const updatedMainPlots = mainPlots.map((plot, pIndex) => {
            if (pIndex !== index) return plot;
            return { ...plot, name: newName };
        });
        setMainPlots(updatedMainPlots);
    };

    // Handle Section Name Change
    const handleSectionNameChange = (plotIndex, secIndex, newName) => {
        const updatedMainPlots = mainPlots.map((plot, pIndex) => {
            if (pIndex !== plotIndex) return plot;
            const updatedSections = plot.sections.map((section, sIndex) => {
                if (sIndex !== secIndex) return section;
                return { ...section, name: newName };
            });
            return { ...plot, sections: updatedSections };
        });
        setMainPlots(updatedMainPlots);
    };

    // Handle Section Summary Change
    const handleSectionSummaryChange = (plotIndex, sectionIndex, newSummary) => {
        const updatedMainPlots = mainPlots.map((plot, pIndex) => {
            if (pIndex !== plotIndex) return plot;
            const updatedSections = plot.sections.map((section, sIndex) => {
                if (sIndex !== sectionIndex) return section;
                return { ...section, summary: newSummary };
            });
            return { ...plot, sections: updatedSections };
        });
        setMainPlots(updatedMainPlots);
    };

    // Remove Main Plot
    const removeMainPlot = (index) => {
        const newPlots = mainPlots.filter((_, i) => i !== index);
        setMainPlots(newPlots);
        setShowSections((prev) => {
            const updated = { ...prev };
            delete updated[`main_${index}`];
            return updated;
        });
        closeModal();
    };

    // Open Modal for Plot Actions
    const openModal = (index, isMain) => {
        setIsModalOpen(true);
        setCurrentIndex({ index, isMain });
    };

    

    // Close Modal
    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentIndex(null);
    };

    // Open Section Deletion Modal
    const openSectionModal = (sectionInfo, isMain) => {
        setSectionModalOpen(true);
        setCurrentSection({ sectionInfo, isMain });
    };

    // Close Section Deletion Modal
    const closeSectionModal = () => {
        setSectionModalOpen(false);
        setCurrentSection(null);
    };

    // Handle Deletion from Modal
    const handleDelete = () => {
        if (currentIndex.isMain) {
            removeMainPlot(currentIndex.index);
        }
    };

    // Delete Section
    const deleteSection = () => {
        if (currentSection.isMain) {
            const { plotIndex, secIndex } = currentSection.sectionInfo;
            const updatedMainPlots = mainPlots.map((plot, pIndex) => {
                if (pIndex !== plotIndex) return plot;
                const updatedSections = plot.sections.filter((_, sIndex) => sIndex !== secIndex);
                return { ...plot, sections: updatedSections };
            });
            setMainPlots(updatedMainPlots);
        }
        closeSectionModal();
    };

    // Add Section to a Main Plot
    const addSection = () => {
        if (currentIndex.isMain) {
            const updatedMainPlots = mainPlots.map((plot, pIndex) => {
                if (pIndex !== currentIndex.index) return plot;
                const newSection = { 
                    name: `New Section ${plot.sections.length + 1}`, // Assign a default name
                    summary: '', 
                    characters: [], 
                    newCharacter: '', // Initialize newCharacter
                };
                return { ...plot, sections: [...plot.sections, newSection] };
            });
            setMainPlots(updatedMainPlots);
            setShowSections((prevShow) => ({
                ...prevShow,
                [`main_${currentIndex.index}`]: true,
            }));
        }
        closeModal();
    };

    // Toggle Visibility of Sections
    const togglemainSectionVisibility = (index) => {
        const key = `main_${index}`;
        setShowSections((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    // Handle Right-Click for Custom Context Menu
    const handleRightClick = (e, mainPlotIndex, sectionIndex) => {
        e.preventDefault();
        setSelectedOverviewIndex({ mainPlotIndex, sectionIndex });
        setMenuPosition({ x: e.pageX, y: e.pageY });
        setCustomMenuVisible(true);
    };

    // Handle Color Change from Context Menu
    const handleColorChange = (color) => {
        if (selectedOverviewIndex !== null) {
            const { mainPlotIndex, sectionIndex } = selectedOverviewIndex;
            const updatedOverviewColors = { ...overviewColors, [`${mainPlotIndex}-${sectionIndex}`]: color };
            setOverviewColors(updatedOverviewColors);
        }
        setCustomMenuVisible(false);
    };

    // Handle Click Outside to Close Context Menu
    useEffect(() => {
        const handleClickOutside = () => {
            setCustomMenuVisible(false);
        };
        window.addEventListener('click', handleClickOutside);
        return () => {
            window.removeEventListener('click', handleClickOutside);
        };
    }, []);

    // Handle Character Selection for a Specific Section
    const handleCharacterChange = (plotIndex, secIndex, event) => {
        const selectedOptions = Array.from(event.target.selectedOptions, option => option.value);
        const updatedMainPlots = mainPlots.map((plot, pIndex) => {
            if (pIndex !== plotIndex) return plot;
            const updatedSections = plot.sections.map((section, sIndex) => {
                if (sIndex !== secIndex) return section;
                return { ...section, characters: selectedOptions };
            });
            return { ...plot, sections: updatedSections };
        });
        setMainPlots(updatedMainPlots);
    };

    // Handle Adding a New Character to a Specific Section
    const handleAddCharacter = (plotIndex, secIndex) => {
        // Find the specific section
        const plot = mainPlots[plotIndex];
        const section = plot.sections[secIndex];

        // Trim the new character name
        const trimmedName = section.newCharacter.trim();

        // Validation: Check if the character name is not empty and not already in the section
        if (trimmedName === '') {
          //  toast.warn('Character name cannot be empty.');
            return;
        }
        if (section.characters.includes(trimmedName)) {
          //  toast.warn(`Character "${trimmedName}" already exists in this section.`);
            return;
        }

        // Check if the character exists in the global list
        const characterExists = characters.includes(trimmedName);

        // Update the global characters list if the character is new
        let updatedCharacters = characters;
        if (!characterExists) {
            updatedCharacters = [...characters, trimmedName];
            setCharacters(updatedCharacters);
            //toast.success(`Character "${trimmedName}" added to global list.`);
        }

        // Update the mainPlots state immutably
        const updatedMainPlots = mainPlots.map((p, pIndex) => {
            if (pIndex !== plotIndex) return p;
            const updatedSections = p.sections.map((s, sIndex) => {
                if (sIndex !== secIndex) return s;
                return {
                    ...s,
                    characters: [...s.characters, trimmedName],
                    newCharacter: '', // Clear the input after adding
                };
            });
            return { ...p, sections: updatedSections };
        });

        setMainPlots(updatedMainPlots);
       // toast.success(`Character "${trimmedName}" added to Section ${secIndex + 1}.`);
    };

    // Fetch Chapters on Component Mount
    useEffect(() => {
        fetchChapters();
    }, [projectId]); // Re-fetch if projectId changes

    // Fetch Plots when a Chapter is Selected
    useEffect(() => {
        if (selectedChapterId) {
            fetchPlots(selectedChapterId);
        } else {
            setMainPlots([]); // Clear plots if no chapter is selected
        }
    }, [selectedChapterId]);

    // Handle Adding a New Main Plot
    const addMainPlot = () => {
        const newPlot = { 
            name: `New Plot ${mainPlots.length + 1}`, // Default name
            sections: [], 
            newCharacter: '' 
        };
        setMainPlots([...mainPlots, newPlot]);
    };

    const [isAddCollaboratorsOpen, setIsAddCollaboratorsOpen] = useState(false);
    const [isAnimationPlaying, setIsAnimationPlaying] = useState(false); // Track if animation is playing
    const animationRef = useRef(null); // Reference to the Lottie animation

    

    const lottieOptions = {
    loop: false, // We don't want it to loop
    autoplay: false, // Don't autoplay the animation
    animationData: menuAnimation, // Path to the Lottie JSON animation data
    rendererSettings: {
        preserveAspectRatio: 'xMidYMid slice',
    },
    };

    
      const handleAddCollaborator = () => {
        if (!projectId) {
           // toast.warn("No project selected.");
            return;
        }
        setIsAddCollaboratorsOpen(true);
    };
    return (
        <div className="plot-container">
            {/* Toast Container for Notifications */}

            <Header/>
            <Sidebar projectId={projectId} />
            {/* Plot Sidepanel */}
            <div className="plot-sidepanel">
                <div className="main-plots">
                    <div className="plot-left-sidepanel-header" style={{display:"flex", flexDirection:"row", alignItems:"center", justifyContent:"center"}}>
                    <h2>Plots</h2>
                    <div className="add-plot-container">
                        <span className="add-plot-text">Add Plot</span>
                        <AddCircleIcon 
                            className="main-plus-icon" 
                            onClick={addMainPlot} 
                            style={{ cursor: 'pointer', fontSize: '30px' ,
                                
                                  }}
                             />
                        </div>
                    </div>
                    
                    <div className="add-main-plot">
                        {mainPlots.map((plot, index) => (
                            <div key={index} className="main-plot-item">
                               <div className="plot-input-options-container">
                               <IconButton 
                                    aria-label="options" 
                                    onClick={() => openModal(index, true)}
                                    sx={{
                                        color: "black",
                                        position: 'relative',
                                        top: "-10px",
                                        backgroundColor: "none",
                                        transition: 'none', // Add this line
                                        '&:hover': { // Add this block
                                        backgroundColor: 'transparent', // Set background color to transparent on hover
                                        transform: 'none', // Remove any transform animations on hover
                                        },
                                    }}
                                    >
                                    <MoreHorizIcon />
                                    </IconButton>
                                </div>
                                <input
                                type="text"
                                placeholder={`Main Plot ${index + 1}`} 
                                className="main-plot-input"
                                value={plot.name}
                                onChange={(e) => handleMainPlotNameChange(index, e.target.value)}
                            />
                            
                            
                                <button 
                                    className={`dropdown-main ${showSections[`main_${index}`] ? 'rotated' : ''}`}
                                    onClick={() => togglemainSectionVisibility(index)}
                                >
                                    
                                </button>
                                {showSections[`main_${index}`] && (
                                    <div className="sections">
                                        {plot.sections.map((section, secIndex) => (
                                            <div key={secIndex} className="section-item">
                                                <img src={downrightIcon} alt="Down Icon" className="downright-icon" />
                                                <input
                                                    type="text"
                                                    placeholder={`Main-section ${secIndex + 1}`} 
                                                    className="main-plot-section-input"
                                                    value={section.name}
                                                    onChange={(e) => handleSectionNameChange(index, secIndex, e.target.value)}
                                                    onContextMenu={(e) => {
                                                        e.preventDefault(); // Prevent the default context menu
                                                        openSectionModal({ plotIndex: index, secIndex }, true); // Open the section modal
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div  className="plot-chapter-list"
                    style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '16px'
                    }}>
                    <h2 style={{ margin: '0 0 8px 50px' ,fontFamily:"sans-serif",fontWeight:"lighter"}}>Chapters</h2>
                    <ul style={{
                        listStyle: 'none',
                        padding: '0',
                        margin: '0',
                        fontSize:'13px',
                        overflowY: 'auto',
                        maxHeight: '300px', // adjust the max height as needed
                        scrollbarWidth: 'none', /* Firefox */
                        '&::-webkit-scrollbar': {
                        display: 'none' /* Safari and Chrome */
                        }
                    }}>
                        {chapters.sort((a, b) => a.number - b.number).map((chapter) => (
                        <li 
                            key={chapter._id} 
                            style={{
                            cursor: 'pointer',
                            textAlign:"start",
                            padding: '8px',
                            backgroundColor: selectedChapterId === chapter._id ? '#faf0e2' : 'transparent'
                            }}
                            onClick={() => setSelectedChapterId(chapter._id)} // Select chapter on click
                        >
                            <strong>Chapter {chapter.number}:</strong> {chapter.title}
                        </li>
                        ))}
                      </ul>
                    </div>
            </div>

            {/* Modal for Plot Actions */}
            {isModalOpen && (
                <Modal className="modal-content-container" open={isModalOpen} onClose={closeModal}
                BackdropProps={{
                    style: { backgroundColor: 'transparent' },
                  }}>
                    <Box className="modal-content"
                     sx={{
                        backgroundColor: 'white',
                        borderRadius: '7px',
                        padding: '10px',
                        width:"fit-content",
                        border:"none",
                        borderColor:"white",
                      }}>
                    <Button onClick={addSection}>Add Section</Button>
                    <Button onClick={handleDelete}>Delete Plot</Button>
                    </Box>
                </Modal>
                )}


            {/* Delete Section Modal */}
            {sectionModalOpen && (
                <Modal className="sub-modal-content-container" open={sectionModalOpen} onClose={closeSectionModal}
                    BackdropProps={{
                    style: { backgroundColor: 'transparent' },
                    }}
                >
                    <Box className="sub-modal-content"
                    sx={{
                        backgroundColor: 'white',
                        borderRadius: '7px',
                        padding: '5px',
                        width: "fit-content",
                        border: "none",
                        borderColor: "white",
                        textAlign: 'center'
                    }}
                    >
                    <Button onClick={deleteSection}>Delete</Button>
                    </Box>
                </Modal>
                )}

            {/* Plot Dashboard */}
            <div className="plot-dashboard">
                <div className="zoom-controls">
                    {/* Buttons for Zoom In and Zoom Out */}
                    <button className="zoom-button" onClick={handleZoomIn}>
                        <img src={zoomInIcon} alt="Zoom In" />
                    </button>
                    <button className="zoom-button" onClick={handleZoomOut}>
                        <img src={zoomOutIcon} alt="Zoom Out" />
                    </button>
                </div>
                        
                <div className="main-plot-visual" ref={mainPlotVisualRef} style={{ transform: `scale(${zoomLevel})`, transformOrigin: '0 0' }}>
                    {mainPlots.map((plot, plotIndex) => (
                        <div key={plot._id || plotIndex} className="main-plot-container">
                            {/* Plot indicator placed above the white line */}
                            <div className="white-line" />

                            {/* Render the corresponding overview below the white line */}
                            <div className="overview">
                                <div className="plot-indicator">
                                    {plot.name || `Main Plot ${plotIndex + 1}`} {/* Display main plot name */}
                                </div>
                                {plot.sections.map((section, secIndex) => (
                                    <div
                                        key={section._id || secIndex}
                                        className="overview-item"
                                        ref={overviewRef(plotIndex, secIndex)}
                                        style={{
                                            backgroundColor: overviewColors[`${plotIndex}-${secIndex}`] || 'white',
                                        }}
                                        onContextMenu={(e) => handleRightClick(e, plotIndex, secIndex)}
                                    >
                                        <div className="section-header">
                                            {section.name || `Main-section ${secIndex + 1}`} {/* Display section name */}
                                        </div>
                                        {/* Summary Section within each overview-item */}
                                        <div className="section-summary">
                                            <h4>Summary</h4>
                                            <textarea
                                                placeholder="Enter section summary..."
                                                className="summary-textarea"
                                                value={section.summary || ''}
                                                onChange={(e) =>
                                                    handleSectionSummaryChange(plotIndex, secIndex, e.target.value)
                                                }
                                            />
                                        </div>

                                        <div className="section-characters">
                                            {/* Add character input */}
                                            <div className="add-character-section">
                                                <input
                                                    type="text"
                                                    value={section.newCharacter || ''}
                                                    placeholder="Add new character"
                                                    onChange={(e) => {
                                                        const updatedMainPlots = mainPlots.map((p, pIdx) => {
                                                            if (pIdx !== plotIndex) return p;
                                                            const updatedSections = p.sections.map((s, sIdx) => {
                                                                if (sIdx !== secIndex) return s;
                                                                return { ...s, newCharacter: e.target.value };
                                                            });
                                                            return { ...p, sections: updatedSections };
                                                        });
                                                        setMainPlots(updatedMainPlots);
                                                    }}
                                                />
                                                <button onClick={() => handleAddCharacter(plotIndex, secIndex)}>Add Character</button>
                                            </div>
                                            <h4>Characters Involved</h4>
                                            <select 
                                                multiple 
                                                value={section.characters} 
                                                onChange={(e) => handleCharacterChange(plotIndex, secIndex, e)}
                                            >
                                                {characters.map((character, idx) => (
                                                    <option key={idx} value={character}>
                                                        {character}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
         
            {/* Custom Context Menu for Color Selection */}
            {customMenuVisible && (
                <div
                    className="custom-menu"
                    style={{ top: `${menuPosition.y}px`, left: `${menuPosition.x}px` }}
                >
                    <button onClick={() => handleColorChange('lightblue')}>Light Blue</button>
                    <button onClick={() => handleColorChange('lightgreen')}>Light Green</button>
                    <button onClick={() => handleColorChange('lightcoral')}>Light Coral</button>
                    <button onClick={() => handleColorChange('lightgoldenrodyellow')}>Light Yellow</button>
                </div>
            )}

            {/* Save Plots Button */}
          
            <div className="plot-save-button-css" onClick={savePlots}>Save Plots</div>
           
        </div>
    );

}

export default Plot;
