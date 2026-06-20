import React, { useState, useEffect } from 'react';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import AddTask from './pages/AddTask';
import authService from './services/authService';

function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check auth and theme on load
  useEffect(() => {
    // 1. Auth check
    const currentUser = authService.getCurrentUser();
    if (currentUser && authService.isAuthenticated()) {
      setUser(currentUser);
    } else {
      authService.logout();
      setUser(null);
    }

    // 2. Theme check
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
    
    setIsDarkMode(initialDark);
    if (initialDark) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }

    // 3. Setup Axios auth failure listener
    const handleAuthExpired = () => {
      setUser(null);
      setCurrentPage('dashboard');
    };
    window.addEventListener('auth-expired', handleAuthExpired);

    return () => {
      window.removeEventListener('auth-expired', handleAuthExpired);
    };
  }, []);

  // Handle dark mode toggle
  const toggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  };

  // Auth Success callback
  const handleAuthSuccess = (loggedUser) => {
    setUser(loggedUser);
    setCurrentPage('dashboard');
  };

  // Logout callback
  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setCurrentPage('dashboard');
  };

  // Navigations
  const navigateTo = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="app-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-brand" onClick={() => navigateTo('dashboard')}>
          <span>🚀 TaskFlow</span>
        </div>
        
        <div className="user-profile">
          {/* Dark Mode toggle */}
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle light/dark theme">
            {isDarkMode ? '☀️' : '🌙'}
          </button>

          {user && (
            <>
              <span className="username-display">Hi, {user.username}</span>
              <button 
                className={`nav-btn ${currentPage === 'dashboard' ? 'active' : ''}`}
                onClick={() => navigateTo('dashboard')}
              >
                Dashboard
              </button>
              <button 
                className={`nav-btn ${currentPage === 'add-task' ? 'active' : ''}`}
                onClick={() => navigateTo('add-task')}
              >
                Add Task
              </button>
              <button className="nav-btn btn-primary" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="main-content">
        {!user ? (
          <Auth onAuthSuccess={handleAuthSuccess} />
        ) : currentPage === 'dashboard' ? (
          <Dashboard onNavigateToAdd={() => navigateTo('add-task')} />
        ) : currentPage === 'add-task' ? (
          <AddTask 
            onTaskAdded={() => navigateTo('dashboard')} 
            onCancel={() => navigateTo('dashboard')} 
          />
        ) : (
          <div style={{ textAlign: 'center', marginTop: '4rem' }}>
            <h2>Page not found</h2>
            <button className="nav-btn btn-primary" onClick={() => navigateTo('dashboard')}>
              Go to Dashboard
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
