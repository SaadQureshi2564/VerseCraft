// Header.js
import logoIcon from '../Images/Logo-V.png';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react'; 
import './footer.css';
import { IconButton } from '@mui/material';
import { X, Facebook, LinkedIn, Instagram } from '@mui/icons-material';

const footer = () =>{
    return(
        <div className="footer-container">
             <div className="footer-links">
                <div className="footer-about-section">About
                    <p>About us</p>
                    <p>Careers</p>
                    <p>Contact us</p>
                    <p>Investors</p>
                </div>
                <div className="footer-discover-section">Discover
                    <p>Explore</p>
                    <p>Features</p>
                    <p>Help and Support</p>
                </div>
                <div className="footer-legal-section">Legal and Accessibility
                    <p>Privacy Policy</p>
                    <p>Copyright Policy</p>
                    <p>Terms and conditions</p>
                </div>
             
            </div>
            <div className="footer-explore-section"></div>
            
            <div className="footer-logo-container">
                <div className="footer-logo-image">
                    <img src={logoIcon} alt="home" className="header-logo-icon"></img>
                </div>
                <div className="footer-logo-text">VerseCraft</div>
                <div className="footer-socials">
                    <div className="footer-social-icons">
                        <IconButton 
                            href="https://twitter.com" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="social-icon twitter"
                        >
                            <X/>
                        </IconButton>
                        
                        <IconButton 
                            href="https://facebook.com" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="social-icon facebook"
                        >
                            <Facebook />
                        </IconButton>
                        
                        <IconButton 
                            href="https://linkedin.com" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="social-icon linkedin"
                        >
                            <LinkedIn />
                        </IconButton>
                        <IconButton 
                            href="https://instagram.com" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="social-icon instagram"
                        >
                            <Instagram />
                        </IconButton>
                    </div>
                </div>
                <div className="footer-reserve">© {new Date().getFullYear()} VerseCraft. All rights reserved.</div>
            </div>
        </div>
    
    );
};
export default footer;