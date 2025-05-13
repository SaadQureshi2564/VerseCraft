import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';

import Homepage from './Components/Homepage/homepage';
import SplashScreen from './Components/SplashScreen/splashscreen'; 
import Login from './Components/Login/login'; 
import SignUp from './Components/Signup/signup'; 
import Plot from "./Components/Plot/plot";
import Character from "./Components/Character/character";
import Setting from "./Components/Settings/settings";
import Profile from "./Components/Profile/profile"; 
import Publish from "./Components/Publishing/publishing";
import Saved from "./Components/SavedWorks/savedworks";
import Notification from "./Components/Notifications/notifications";
import Progress from "./Components/ProgressPage/progress";
import Version from "./Components/Version/version";
import Novelboard from "./Components/NovelDashboard/noveldashboard";
import Favorite from "./Components/Favorites/favorites";
import Avatar from "./Components/Avatar/Avatarapp";
import Storyboard from "./Components/Storyboard/storyboard";
import Admin from "./Components/Adminpenal/Adminpenal";
import Chatbot from "./Components/Chatbot/ChatbotApp";
import CharacterGrid from "./Components/CharacterCards/CharacterGrid";
import ReadStoryProject from "./Components/ReadStoryProject/ReadStoryProject";
import ReadNovelProject from "./Components/ReadNovelProject/ReadNovelProject";
import ReadUrduProject from "./Components/ReadUrduProject/ReadUrduProject";
import Explore from "./Components/Explore/explore";
import Urduboard from "./Components/UrduEditor/urdueditor";
import ManageStoryProject from "./Components/ManageStoryProject/ManageStoryProject";
import ManageNovelProject from "./Components/ManageNovelProject/ManageNovelProject";
import ManageUrduProject from "./Components/ManageUrduProject/ManageUrduProject";
import Reading from "./Components/Reading/reading";

import './App.css'; 

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // State to manage user authentication
  const [isAdmin, setIsAdmin] = useState(false); // State to manage admin authentication


  return (
    <div className="App">
      <Routes>

      <Route path="/" element={<SplashScreen/>} />

        
        <Route
          path="/Login"
          element={<Login setIsAuthenticated={setIsAuthenticated} setIsAdmin={setIsAdmin} />}
        />
       <Route path="/Homepage" element={<Homepage />} />
       <Route path="/Admin" element={<Admin />} />

        <Route path="/Signup" element={<SignUp />} />
        {/* <Route path="/Novelboard" element={<Novelboard/>} /> */}
        <Route path="/Plot/:projectId" element={<Plot />} />
        <Route path="/Character/:projectId" element={<Character />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/Saved" element={<Saved />} />
        <Route path="/Setting" element={<Setting/>} />
        <Route path="/Notification" element={<Notification />} />
        <Route path="/Progress/:projectId" element={<Progress/>} />
        <Route path="/Publishing/:projectId" element={<Publish/>} />
        <Route path="/Explore" element={<Explore/>} />
        <Route path="/Favorite" element={<Favorite/>} />
        <Route path="/Version" element={<Version/>} />
        <Route path="/Avatar" element={<Avatar/>} />
        <Route path="/reading/:projectId" element={<Reading/>} />

        
        <Route path="Chatbot" element={<Chatbot/>} />
        <Route path="CharacterGrid/:projectId" element={<CharacterGrid/>} />

        {/* <Route path="/Urduboard" element={<Urduboard/>} /> */}

        <Route path="/Storyboard/:projectId" element={<Storyboard />} />
        <Route path="/Novelboard/:projectId" element={<Novelboard />} />
        <Route path="/Urduboard/:projectId" element={<Urduboard />} />

        <Route path="/ReadStoryProject/:projectId" element={<ReadStoryProject />} />
        <Route path="/ReadNovelProject/:projectId" element={<ReadNovelProject />} />
        <Route path="/ReadUrduProject/:projectId" element={<ReadUrduProject />} />

        <Route path="/ManageStoryProject/:projectId" element={<ManageStoryProject />} />
        <Route path="/ManageNovelProject/:projectId" element={<ManageNovelProject />} />
        <Route path="/ManageUrduProject/:projectId" element={<ManageUrduProject />} />
      </Routes>
    </div>
  );
}

const AppWithRouter = () => (
  <Router>
    <App />
  </Router>
);


// PrivateRoute Component to protect routes
const PrivateRoute = ({ children }) => {
  const { user } = React.useContext(AuthContext);
  return user ? children : <Navigate to="/login" />;
};

export default AppWithRouter;
