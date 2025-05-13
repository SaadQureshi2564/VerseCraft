// src/components/AdminPanel.js
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminPanel.css';
import profileIcon from '../Images/generic-user-profile-picture.png';
import UserManagement from './UserManagement';
import NovelManagement from './NovelManagement';
import StoryManagement from './StoryManagement';
import UrduManagement from './UrduManagement';
import NotifyUsers from './NotifyUsers';

// Chart components & auto registration
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';  // <--- ADDED Line here

// Icons
import {
  FaUser,
  FaBook,
  FaPenFancy,
  FaLanguage,
  FaBell,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaHome,
  FaSyncAlt,
  FaSearch,
  FaSun,
  FaMoon,
  FaUsers,
  FaMale,
  FaFemale,
  FaUserShield,
  FaUserFriends,
  FaUserEdit,
  FaUserAlt,
  FaQuestionCircle,
  FaInfoCircle
} from 'react-icons/fa';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
  PointElement,
  LineElement,
  Filler
);

// Debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const AdminPanel = () => {
  const navigate = useNavigate();

  // State for user
  const [user, setUser] = useState(null);

  // Active section
  const [activeSection, setActiveSection] = useState('users');

  // Sidebar
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Basic stats
  const [totalUsers, setTotalUsers] = useState(0);
  const [maleUsers, setMaleUsers] = useState(0);
  const [femaleUsers, setFemaleUsers] = useState(0);

  // Age breakdown
  const [under18Count, setUnder18Count] = useState(0);
  const [between18And25Count, setBetween18And25Count] = useState(0);
  const [above26Count, setAbove26Count] = useState(0);

  // UserType breakdown
  const [adminCount, setAdminCount] = useState(0);
  const [moderatorCount, setModeratorCount] = useState(0);
  const [normalUserCount, setNormalUserCount] = useState(0);

  // Loading / error for stats
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState('');

  // Global search
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');    // no longer displayed in UI
  const [filterStatus, setFilterStatus] = useState('all'); // no longer displayed in UI

  const debouncedSearchTerm = useDebounce(globalSearchTerm, 300);

  // Theming
  const [theme, setTheme] = useState(
    () => localStorage.getItem('adminPanelTheme') || 'light'
  );

  // For stories, novels, urdu data
  const [stories, setStories] = useState([]);
  const [novels, setNovels] = useState([]);
  const [urduProjects, setUrduProjects] = useState([]);
  const [dataError, setDataError] = useState('');

  // Top authors limit
  const [topAuthorsLimit, setTopAuthorsLimit] = useState(5);

  // Selection for Male/Female data display
  const [genderDataType, setGenderDataType] = useState('absolute'); // 'absolute' or 'percentage'

  // Fetch admin user data
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        const response = await axios.get('http://localhost:5001/api/users/profile', {
          headers: { 'x-auth-token': token },
        });
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        navigate('/login');
      }
    };
    fetchAdmin();
  }, [navigate]);

  // Fetch stats initially and when filters change
  useEffect(() => {
    fetchAllStats();
  }, [debouncedSearchTerm, filterRole, filterStatus]);

  // Also fetch stories, novels, and urdu data
  useEffect(() => {
    fetchStoriesNovelsUrdu();
  }, []);

  const fetchStoriesNovelsUrdu = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      // 1) Stories
      const storiesRes = await axios.get('http://localhost:5001/api/stories', {
        headers: { 'x-auth-token': token },
      });
      setStories(storiesRes.data || []);

      // 2) Novels
      const novelsRes = await axios.get('http://localhost:5001/api/admin/novels', {
        headers: { 'x-auth-token': token },
      });
      setNovels(novelsRes.data || []);

      // 3) Urdu
      const urduRes = await axios.get('http://localhost:5001/api/urdu', {
        headers: { 'x-auth-token': token },
      });
      setUrduProjects(urduRes.data || []);
    } catch (err) {
      console.error(err);
      setDataError('Failed to fetch stories/novels/urdu data.');
    }
  };


  

  const fetchLatestCommentReviews = async () => {
    try {
      // Step 1: Get comments with "Undecided" sentiment type from your Express API
      const response = await axios.get("/api/comments/undecided");
  
      if (response.status === 200) {
        const undecidedComments = response.data;
  
        // Step 2: Loop through each undecided comment
        for (let comment of undecidedComments) {
          // Step 3: Analyze the sentiment using the Flask API
          const flaskResponse = await axios.post("http://127.0.0.1:5000/analyze_sentiment", {
            comment: comment.comment,
          });
  
          if (flaskResponse.status === 200) {
            const sentiment = flaskResponse.data.sentiment;
  
            // Step 4: Update the comment's sentiment type in the Express backend
            await axios.put(`/api/comments/${comment._id}`, {
              commentType: sentiment,
            });
  
            console.log(`✅ Updated comment "${comment.comment}" to sentiment: ${sentiment}`);
          }
        }
  
        console.log("✅ All undecided comments updated!");
      } else {
        console.log("❌ Error fetching undecided comments.");
      }
    } catch (error) {
      console.error("Error in fetchLatestCommentReviews:", error);
    }
  };
  

  const fetchAllStats = async () => {
    setLoadingStats(true);
    setStatsError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Build query parameters based on search
      let query = '';
      if (debouncedSearchTerm) {
        query += `&search=${encodeURIComponent(debouncedSearchTerm)}`;
      }
      // role, status if you want them (not shown in UI now)
      if (filterRole !== 'all') {
        query += `&role=${encodeURIComponent(filterRole)}`;
      }
      if (filterStatus !== 'all') {
        query += `&status=${encodeURIComponent(filterStatus)}`;
      }

      // Get all users with query
      const usersRes = await axios.get(`http://localhost:5001/api/admin/users?${query}`, {
        headers: { 'x-auth-token': token },
      });

      const allUsers = usersRes.data || [];
      setTotalUsers(allUsers.length);

      // Gender
      const males = allUsers.filter(u => u.gender === 'Male').length;
      const females = allUsers.filter(u => u.gender === 'Female').length;
      setMaleUsers(males);
      setFemaleUsers(females);

      // Age
      let under18 = 0;
      let between18And25 = 0;
      let above26 = 0;
      allUsers.forEach(u => {
        if (u.age < 18) under18++;
        else if (u.age >= 18 && u.age <= 25) between18And25++;
        else if (u.age >= 26) above26++;
      });
      setUnder18Count(under18);
      setBetween18And25Count(between18And25);
      setAbove26Count(above26);

      // userType
      let admin = 0;
      let moderator = 0;
      let normal = 0;
      allUsers.forEach(u => {
        if (u.userType === 'admin') admin++;
        else if (u.userType === 'moderator') moderator++;
        else normal++;
      });
      setAdminCount(admin);
      setModeratorCount(moderator);
      setNormalUserCount(normal);

    } catch (err) {
      console.error(err);
      setStatsError('Failed to fetch stats. Please try again later.');
    } finally {
      setLoadingStats(false);
    }
  };

  // Render whichever management section is active
  const renderManagementSection = () => {
    switch (activeSection) {
      case 'users':
        return <UserManagement globalSearchTerm={debouncedSearchTerm} />;
      case 'stories':
        return <StoryManagement globalSearchTerm={debouncedSearchTerm} />;
      case 'novels':
        return <NovelManagement globalSearchTerm={debouncedSearchTerm} />;
      case 'urdu':
        return <UrduManagement globalSearchTerm={debouncedSearchTerm} />;
      case 'notify':
        return <NotifyUsers />;
      case 'help':
        return (
          <div className="adminpenal-help-section">
            <div className="help-card">
              <h2><FaInfoCircle /> Help &amp; Documentation</h2>
              <p>This panel allows you to manage Users, Stories, Novels, and Urdu projects.</p>
              <p><strong>User Management:</strong> Create, edit, delete users and update roles.</p>
              <p><strong>Story/Novel/Urdu Management:</strong> Manage literary items, etc.</p>
              <p><strong>Notify Users:</strong> Broadcast important announcements or updates.</p>
              <p><strong>Analytics:</strong> View detailed statistics about your platform.</p>
              <p>
                Need further assistance?{' '}
                <a href="mailto:support@yourdomain.com" className="support-link">Contact Support</a>
              </p>
            </div>
          </div>
        );
      default:
        return <UserManagement globalSearchTerm={debouncedSearchTerm} />;
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'custom' : 'light';
    setTheme(newTheme);
    localStorage.setItem('adminPanelTheme', newTheme);
  };

  // Theme class
  const themeClass =
    theme === 'dark' ? 'dark-theme' : theme === 'custom' ? 'custom-theme' : 'light-theme';

  // ======================
  // CHART DATA EXAMPLES (USER STATS)
  // ======================
  const ageBarData = {
    labels: ['<18', '18-25', '26+'],
    datasets: [
      {
        label: 'Number of Users',
        data: [under18Count, between18And25Count, above26Count],
        backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726'],
        borderRadius: 5,
      },
    ],
  };
  const ageBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Age Distribution',
        font: { size: 18, weight: 'bold' },
        color: theme === 'dark' ? '#fff' : '#333',
      },
      legend: { display: false },
      tooltip: {
        backgroundColor: theme === 'dark' ? '#444' : '#fff',
        titleColor: theme === 'dark' ? '#fff' : '#333',
        bodyColor: theme === 'dark' ? '#ddd' : '#555',
        borderColor: theme === 'dark' ? '#555' : '#ccc',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: {
          color: theme === 'dark' ? '#fff' : '#333',
          font: { size: 14, weight: '600' },
        },
        grid: { display: false },
      },
      y: {
        ticks: {
          color: theme === 'dark' ? '#fff' : '#333',
          font: { size: 14, weight: '600' },
        },
        grid: { color: theme === 'dark' ? '#555' : '#ccc' },
      },
    },
  };

  // Doughnut chart for user types
  const userTypeDoughnutData = {
    labels: ['Admin', 'Moderator', 'User'],
    datasets: [
      {
        data: [adminCount, moderatorCount, normalUserCount],
        backgroundColor: ['#EF5350', '#AB47BC', '#29B6F6'],
        hoverOffset: 10,
        borderWidth: 1,
      },
    ],
  };
  const userTypeDoughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'User Types',
        font: { size: 18, weight: 'bold' },
        color: theme === 'dark' ? '#fff' : '#333',
      },
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: theme === 'dark' ? '#fff' : '#333',
          font: { size: 14, weight: '600' },
        },
      },
      tooltip: {
        backgroundColor: theme === 'dark' ? '#444' : '#fff',
        titleColor: theme === 'dark' ? '#fff' : '#333',
        bodyColor: theme === 'dark' ? '#ddd' : '#555',
        borderColor: theme === 'dark' ? '#555' : '#ccc',
        borderWidth: 1,
      },
    },
  };

  // ============================================================
  // STORIES/NOVELS/URDU - AGGREGATION & CHARTS (by Author)
  // ============================================================
  const aggregateByAuthorEmail = (items = []) => {
    const map = {};
    items.forEach((item) => {
      const authorEmail =
        item.author?.email ||
        item.authorEmail ||
        'unknown@example.com';
      if (!map[authorEmail]) {
        map[authorEmail] = 1;
      } else {
        map[authorEmail]++;
      }
    });
    const arr = Object.keys(map).map((email) => ({
      authorEmail: email,
      count: map[email],
    }));
    arr.sort((a, b) => b.count - a.count);
    return arr;
  };

  const topStoriesAuthors = useMemo(
    () => aggregateByAuthorEmail(stories).slice(0, topAuthorsLimit),
    [stories, topAuthorsLimit]
  );
  const topNovelsAuthors = useMemo(
    () => aggregateByAuthorEmail(novels).slice(0, topAuthorsLimit),
    [novels, topAuthorsLimit]
  );
  const topUrduAuthors = useMemo(
    () => aggregateByAuthorEmail(urduProjects).slice(0, topAuthorsLimit),
    [urduProjects, topAuthorsLimit]
  );

  // 1) Stories
  const storiesByAuthorsBarData = {
    labels: topStoriesAuthors.map((a) => a.authorEmail),
    datasets: [
      {
        label: 'Stories Count',
        data: topStoriesAuthors.map((a) => a.count),
        backgroundColor: '#FF8A65',
        borderRadius: 5,
      },
    ],
  };
  const storiesByAuthorsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: `Top ${topAuthorsLimit} Authors (Stories)`,
        font: { size: 18, weight: 'bold' },
        color: theme === 'dark' ? '#fff' : '#333',
      },
      legend: { display: false },
      tooltip: {
        backgroundColor: theme === 'dark' ? '#444' : '#fff',
        titleColor: theme === 'dark' ? '#fff' : '#333',
        bodyColor: theme === 'dark' ? '#ddd' : '#555',
        borderColor: theme === 'dark' ? '#555' : '#ccc',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: {
          color: theme === 'dark' ? '#fff' : '#333',
          font: { size: 14, weight: '600' },
          maxRotation: 45,
          minRotation: 0,
        },
        grid: { display: false },
      },
      y: {
        ticks: {
          color: theme === 'dark' ? '#fff' : '#333',
          font: { size: 14, weight: '600' },
        },
        grid: { color: theme === 'dark' ? '#555' : '#ccc' },
      },
    },
  };

  // 2) Novels
  const novelsByAuthorsBarData = {
    labels: topNovelsAuthors.map((a) => a.authorEmail),
    datasets: [
      {
        label: 'Novels Count',
        data: topNovelsAuthors.map((a) => a.count),
        backgroundColor: '#9CCC65',
        borderRadius: 5,
      },
    ],
  };
  const novelsByAuthorsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: `Top ${topAuthorsLimit} Authors (Novels)`,
        font: { size: 18, weight: 'bold' },
        color: theme === 'dark' ? '#fff' : '#333',
      },
      legend: { display: false },
      tooltip: {
        backgroundColor: theme === 'dark' ? '#444' : '#fff',
        titleColor: theme === 'dark' ? '#fff' : '#333',
        bodyColor: theme === 'dark' ? '#ddd' : '#555',
        borderColor: theme === 'dark' ? '#555' : '#ccc',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: {
          color: theme === 'dark' ? '#fff' : '#333',
          font: { size: 14, weight: '600' },
          maxRotation: 45,
          minRotation: 0,
        },
        grid: { display: false },
      },
      y: {
        ticks: {
          color: theme === 'dark' ? '#fff' : '#333',
          font: { size: 14, weight: '600' },
        },
        grid: { color: theme === 'dark' ? '#555' : '#ccc' },
      },
    },
  };

  // 3) Urdu
  const urduByAuthorsBarData = {
    labels: topUrduAuthors.map((a) => a.authorEmail),
    datasets: [
      {
        label: 'Urdu Count',
        data: topUrduAuthors.map((a) => a.count),
        backgroundColor: '#EF9A9A',
        borderRadius: 5,
      },
    ],
  };
  const urduByAuthorsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: `Top ${topAuthorsLimit} Authors (Urdu)`,
        font: { size: 18, weight: 'bold' },
        color: theme === 'dark' ? '#fff' : '#333',
      },
      legend: { display: false },
      tooltip: {
        backgroundColor: theme === 'dark' ? '#444' : '#fff',
        titleColor: theme === 'dark' ? '#fff' : '#333',
        bodyColor: theme === 'dark' ? '#ddd' : '#555',
        borderColor: theme === 'dark' ? '#555' : '#ccc',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: {
          color: theme === 'dark' ? '#fff' : '#333',
          font: { size: 14, weight: '600' },
          maxRotation: 45,
          minRotation: 0,
        },
        grid: { display: false },
      },
      y: {
        ticks: {
          color: theme === 'dark' ? '#fff' : '#333',
          font: { size: 14, weight: '600' },
        },
        grid: { color: theme === 'dark' ? '#555' : '#ccc' },
      },
    },
  };

  // ================================
  // Male/Female Distribution Chart
  // ================================
  const maleFemaleChartData = {
    labels: ['Male', 'Female'],
    datasets: [
      {
        label: 'Gender Distribution',
        data:
          genderDataType === 'absolute'
            ? [maleUsers, femaleUsers]
            : [
                ((maleUsers / totalUsers) * 100).toFixed(2),
                ((femaleUsers / totalUsers) * 100).toFixed(2)
              ],
        backgroundColor: ['#42A5F5', '#FF4081'],
        hoverOffset: 10,
        borderWidth: 1,
      },
    ],
  };
  const maleFemaleDoughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text:
          genderDataType === 'absolute'
            ? 'Gender Distribution (Absolute)'
            : 'Gender Distribution (Percentage)',
        font: { size: 18, weight: 'bold' },
        color: theme === 'dark' ? '#fff' : '#333',
      },
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: theme === 'dark' ? '#fff' : '#333',
          font: { size: 14, weight: '600' },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.label || '';
            if (genderDataType === 'percentage') {
              label += `: ${context.parsed}%`;
            } else {
              label += `: ${context.parsed}`;
            }
            return label;
          },
        },
        backgroundColor: theme === 'dark' ? '#444' : '#fff',
        titleColor: theme === 'dark' ? '#fff' : '#333',
        bodyColor: theme === 'dark' ? '#ddd' : '#555',
        borderColor: theme === 'dark' ? '#555' : '#ccc',
        borderWidth: 1,
      },
    },
  };

  // ============================================================
  // MULTI-LINE CHART: Monthly Creations for Stories/Novels/Urdu
  // ============================================================
  // Helper: count how many items in each month of the current year
  function getMonthlyCounts(items = []) {
    const counts = new Array(12).fill(0);
    const currentYear = new Date().getFullYear();

    items.forEach((item) => {
      if (item.createdAt) {
        const date = new Date(item.createdAt);
        if (date.getFullYear() === currentYear) {
          const monthIndex = date.getMonth(); // 0=Jan, 1=Feb, ...
          counts[monthIndex]++;
        }
      }
    });

    return counts;
  }


  console.log('Profile image path:', user?.profileImage);

  // Build arrays
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const storiesMonthly = getMonthlyCounts(stories);
  const novelsMonthly = getMonthlyCounts(novels);
  const urduMonthly = getMonthlyCounts(urduProjects);

  // Combine into line chart data
  const monthlyLineData = {
    labels: monthLabels,
    datasets: [
      {
        label: 'Stories Created',
        data: storiesMonthly,
        borderColor: '#42A5F5',
        backgroundColor: 'rgba(66,165,245,0.1)',
        fill: true,
        tension: 0.3,
      },
      {
        label: 'Novels Created',
        data: novelsMonthly,
        borderColor: '#f9a109',
        backgroundColor: 'rgba(249,161,9,0.1)',
        fill: true,
        tension: 0.3,
      },
      {
        label: 'Urdu Created',
        data: urduMonthly,
        borderColor: '#AB47BC',
        backgroundColor: 'rgba(171,71,188,0.1)',
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const monthlyLineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Monthly Creation (Stories, Novels, Urdu)',
        font: { size: 18, weight: 'bold' },
        color: theme === 'dark' ? '#fff' : '#333',
      },
      legend: {
        position: 'top',
        labels: {
          color: theme === 'dark' ? '#fff' : '#333',
        },
      },
      tooltip: {
        backgroundColor: theme === 'dark' ? '#444' : '#fff',
        titleColor: theme === 'dark' ? '#fff' : '#333',
        bodyColor: theme === 'dark' ? '#ddd' : '#555',
        borderColor: theme === 'dark' ? '#555' : '#ccc',
        borderWidth: 1,
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y || 0;
            return `${label}: ${value}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: theme === 'dark' ? '#fff' : '#333',
        },
        grid: { display: false },
      },
      y: {
        ticks: {
          color: theme === 'dark' ? '#fff' : '#333',
        },
        grid: {
          color: theme === 'dark' ? '#555' : '#ccc',
        },
      },
    },
  };

  return (
    <div className={`adminpenal-container ${themeClass}`}>
      {/* SIDEBAR */}
      <aside className={`adminpenal-sidebar ${sidebarOpen ? 'open' : 'closed'} tooltip-container`}>
        <div className="adminpenal-sidebar-header fancy-gradient-bg">
          <h2 className="adminpenal-sidebar-title">
            {sidebarOpen ? 'Admin Panel' : <FaHome />}
          </h2>
          <button
            className="adminpenal-sidebar-toggle-btn"
            onClick={toggleSidebar}
            aria-label="Toggle Sidebar"
            title={sidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
          >
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Welcome text */}
        {sidebarOpen && (
          <div className="adminpenal-welcome-text">
            <p>Welcome, {user?.fullname || 'Administrator'}!</p>
            <span>Manage all your resources in one place.</span>
          </div>
        )}

        <ul className="adminpenal-sidebar-menu">
          {/* Section: Management */}
          <li className="adminpenal-menu-section">
            <span className="adminpenal-menu-section-title">Management</span>
          </li>
          <li
            className={activeSection === 'users' ? 'active' : ''}
            onClick={() => setActiveSection('users')}
            aria-label="User Management"
            title="User Management"
          >
            <FaUser className="adminpenal-menu-icon" />
            <span className="adminpenal-menu-text">User Management</span>
          </li>
          <li
            className={activeSection === 'stories' ? 'active' : ''}
            onClick={() => setActiveSection('stories')}
            aria-label="Story Management"
            title="Story Management"
          >
            <FaPenFancy className="adminpenal-menu-icon" />
            <span className="adminpenal-menu-text">Story Management</span>
          </li>
          <li
            className={activeSection === 'novels' ? 'active' : ''}
            onClick={() => setActiveSection('novels')}
            aria-label="Novel Management"
            title="Novel Management"
          >
            <FaBook className="adminpenal-menu-icon" />
            <span className="adminpenal-menu-text">Novel Management</span>
          </li>
          <li
            className={activeSection === 'urdu' ? 'active' : ''}
            onClick={() => setActiveSection('urdu')}
            aria-label="Urdu Management"
            title="Urdu Management"
          >
            <FaLanguage className="adminpenal-menu-icon" />
            <span className="adminpenal-menu-text">Urdu Management</span>
          </li>

          {/* Section: Communications */}
          <li className="adminpenal-menu-section">
            <span className="adminpenal-menu-section-title">Communications</span>
          </li>
          <li
            className={activeSection === 'notify' ? 'active' : ''}
            onClick={() => setActiveSection('notify')}
            aria-label="Notify Users"
            title="Notify Users"
          >
            <FaBell className="adminpenal-menu-icon" />
            <span className="adminpenal-menu-text">Notify Users</span>
          </li>

          {/* Section: Support & Info */}
          <li className="adminpenal-menu-section">
            <span className="adminpenal-menu-section-title">Support & Info</span>
          </li>
          <li
            className={activeSection === 'help' ? 'active' : ''}
            onClick={() => setActiveSection('help')}
            aria-label="Help & Documentation"
            title="Help & Documentation"
          >
            <FaQuestionCircle className="adminpenal-menu-icon" />
            <span className="adminpenal-menu-text">Help & Docs</span>
          </li>

          {/* Divider */}
          <li className="adminpenal-menu-divider"></li>

          {/* Logout */}
          <li
            onClick={handleLogout}
            className="adminpenal-logout"
            aria-label="Logout"
            title="Logout"
          >
            <FaSignOutAlt className="adminpenal-menu-icon" />
            <span className="adminpenal-menu-text">Logout</span>
          </li>
        </ul>
      </aside>

      {/* MAIN CONTENT */}
      <div className="adminpenal-main-content">
        {/* TOP BAR */}
        <header className="adminpenal-header">
          <button
            className="adminpenal-header-toggle-btn"
            onClick={toggleSidebar}
            aria-label="Toggle Sidebar"
            title={sidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
          >
            <FaBars />
          </button>

          {/* Global Search with Filters */}
          <div className="adminpenal-search-container">
            <div className="adminpenal-global-search tooltip-container">
              <FaSearch className="adminpenal-search-icon" />
              <input
                type="text"
                placeholder="Search by name, email, etc."
                value={globalSearchTerm}
                onChange={(e) => setGlobalSearchTerm(e.target.value)}
                aria-label="Global Search"
              />
              <span className="tooltip-text"></span>
            </div>
            <div className="adminpenal-filters">
              {/* Role/Status removed from UI */}
            </div>
          </div>

          <div className="adminpenal-header-right">
            {/* Theme Toggle */}
            <button
              className="adminpenal-theme-toggle-btn"
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <FaSun /> : theme === 'custom' ? <FaMoon /> : <FaMoon />}
            </button>

            {/* Profile */}
            <div className="adminpenal-profile tooltip-container">
              <img
                src={
                  user?.profileImage
                    ? `http://localhost:5001/${user.profileImage}`
                    : profileIcon
                }
                alt="Profile"
                className="adminpenal-profile-icon"
              />
              <div className="adminpenal-profile-details">
                <h3>{user ? user.fullname : 'Guest'}</h3>
                <p>{user ? user.email : 'guest@example.com'}</p>
              </div>
              <span className="tooltip-text">View Profile</span>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="adminpenal-content">
          <div className="adminpenal-dashboard-overview">
            <div className="adminpenal-dashboard-header">
              <h2>Dashboard Overview</h2>
              <button
                className="adminpenal-refresh-button"
                onClick={() => { fetchAllStats(); fetchLatestCommentReviews(); }}

                disabled={loadingStats}
                aria-label="Refresh Statistics"
                title="Refresh Statistics"
              >
                {loadingStats ? 'Refreshing...' : (
                  <>
                    <FaSyncAlt /> Refresh Stats
                  </>
                )}
              </button>
            </div>
            {statsError && <div className="adminpenal-stats-error">{statsError}</div>}

            {/* Summary Cards */}
            <div className="adminpenal-cards-row">
              <div className="adminpenal-card highlight-card card1">
                <FaUsers className="adminpenal-card-icon" />
                <h3 className="adminpenal-card-title">Total Users</h3>
                <p className="adminpenal-card-value">{totalUsers}</p>
                <span className="adminpenal-badge success">All</span>
              </div>

              <div className="adminpenal-card highlight-card card2">
                <div className="adminpenal-gender-icons">
                  <FaMale className="adminpenal-gender-icon male" />
                  <FaFemale className="adminpenal-gender-icon female" />
                </div>
                <h3 className="adminpenal-card-title">Males / Females</h3>
                <p className="adminpenal-card-value">
                  {maleUsers} / {femaleUsers}
                </p>
                <span className="adminpenal-badge warning">
                  Total: {maleUsers + femaleUsers}
                </span>
              </div>

              <div className="adminpenal-card highlight-card card3">
                <FaUserAlt className="adminpenal-card-icon" />
                <h3 className="adminpenal-card-title">Under 18</h3>
                <p className="adminpenal-card-value">{under18Count}</p>
                <span className="adminpenal-badge success">Age Group</span>
              </div>

              <div className="adminpenal-card highlight-card card3">
                <FaUserFriends className="adminpenal-card-icon" />
                <h3 className="adminpenal-card-title">18-25</h3>
                <p className="adminpenal-card-value">{between18And25Count}</p>
                <span className="adminpenal-badge success">Age Group</span>
              </div>
            </div>

            <div className="adminpenal-cards-row">
              <div className="adminpenal-card highlight-card card3">
                <FaUserShield className="adminpenal-card-icon" />
                <h3 className="adminpenal-card-title">26+</h3>
                <p className="adminpenal-card-value">{above26Count}</p>
                <span className="adminpenal-badge success">Age Group</span>
              </div>
              <div className="adminpenal-card highlight-card card4">
                <FaUserShield className="adminpenal-card-icon" />
                <h3 className="adminpenal-card-title">Admin</h3>
                <p className="adminpenal-card-value">{adminCount}</p>
                <span className="adminpenal-badge danger">User Type</span>
              </div>
              <div className="adminpenal-card highlight-card card4">
                <FaUserEdit className="adminpenal-card-icon" />
                <h3 className="adminpenal-card-title">Moderator</h3>
                <p className="adminpenal-card-value">{moderatorCount}</p>
                <span className="adminpenal-badge danger">User Type</span>
              </div>
              <div className="adminpenal-card highlight-card card4">
                <FaUser className="adminpenal-card-icon" />
                <h3 className="adminpenal-card-title">User</h3>
                <p className="adminpenal-card-value">{normalUserCount}</p>
                <span className="adminpenal-badge danger">User Type</span>
              </div>
            </div>

            {/* ADVANCED ANALYTICS GRAPHS */}
            <div className="adminpenal-analytics-row">
              <div className="adminpenal-chart-container">
                <Bar data={ageBarData} options={ageBarOptions} />
              </div>
              <div className="adminpenal-chart-container">
                <Doughnut data={userTypeDoughnutData} options={userTypeDoughnutOptions} />
              </div>
              <div className="adminpenal-chart-container">
                <div className="adminpenal-dropdown-container">
                  <label htmlFor="gender-data-select">Display as:</label>
                  <select
                    id="gender-data-select"
                    value={genderDataType}
                    onChange={(e) => setGenderDataType(e.target.value)}
                    className="adminpenal-dropdown"
                  >
                    <option value="absolute">Absolute Numbers</option>
                    <option value="percentage">Percentages</option>
                  </select>
                </div>
                <Doughnut data={maleFemaleChartData} options={maleFemaleDoughnutOptions} />
              </div>
            </div>
          </div>

          {/* Additional Graphs for Stories/Novels/Urdu */}
          <div className="adminpenal-dashboard-overview">
            <h2>Author-Based Analytics (Stories, Novels, Urdu)</h2>
            {dataError && <div className="adminpenal-stats-error">{dataError}</div>}

            <div className="adminpenal-dropdown-container">
              <label htmlFor="top-authors-select">Show Top Authors:</label>
              <select
                id="top-authors-select"
                value={topAuthorsLimit}
                onChange={(e) => setTopAuthorsLimit(Number(e.target.value))}
                className="adminpenal-dropdown"
              >
                <option value={3}>Top 3</option>
                <option value={5}>Top 5</option>
                <option value={10}>Top 10</option>
              </select>
            </div>

            <div className="adminpenal-analytics-row">
              <div className="adminpenal-chart-container">
                <Bar data={storiesByAuthorsBarData} options={storiesByAuthorsOptions} />
              </div>
              <div className="adminpenal-chart-container">
                <Bar data={novelsByAuthorsBarData} options={novelsByAuthorsOptions} />
              </div>
              <div className="adminpenal-chart-container">
                <Bar data={urduByAuthorsBarData} options={urduByAuthorsOptions} />
              </div>
            </div>
          </div>

          {/* MULTI-LINE CHART: Monthly Creation */}
          <div className="adminpenal-dashboard-overview">
  <h2>Monthly Creation Analytics</h2>
  <div className="adminpenal-analytics-row single-chart-center">
    <div className="adminpenal-chart-container wide-center-chart">
      <Line data={monthlyLineData} options={monthlyLineOptions} />
    </div>
  </div>
</div>


          {/* Renders whichever management section is active */}
          {renderManagementSection()}
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
