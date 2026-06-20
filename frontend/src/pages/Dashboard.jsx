import React, { useState, useEffect } from 'react';
import taskService from '../services/taskService';

const Dashboard = ({ onNavigateToAdd }) => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Search query state that updates on a debounce delay
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page on search
    }, 450);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  // Fetch tasks and statistics
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch stats
      const statsData = await taskService.getStats();
      setStats(statsData);

      // Fetch task page list
      const tasksData = await taskService.getTasks({
        search: debouncedSearch,
        status,
        sortBy,
        page,
        limit: 6
      });
      setTasks(tasksData.tasks);
      setTotalPages(tasksData.pages);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [debouncedSearch, status, sortBy, page]);

  // Complete a task
  const handleCompleteTask = async (taskId) => {
    try {
      await taskService.updateTask(taskId, { status: 'Completed' });
      fetchData(); // Refresh list and stats
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  // Delete a task
  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskService.deleteTask(taskId);
        fetchData(); // Refresh list and stats
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  // Helper to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div>
      {/* 1. Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <h3>Total Tasks</h3>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat-icon total">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Pending</h3>
            <div className="stat-value">{stats.pending}</div>
          </div>
          <div className="stat-icon pending">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>In Progress</h3>
            <div className="stat-value">{stats.inProgress}</div>
          </div>
          <div className="stat-icon progress">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
            </svg>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Completed</h3>
            <div className="stat-value">{stats.completed}</div>
          </div>
          <div className="stat-icon completed">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
        </div>
      </div>

      {/* 2. Search & Filtering Toolbar */}
      <div className="toolbar">
        <div className="search-box">
          <svg className="search-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search tasks by title or content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-actions">
          <select
            className="select-filter"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            className="select-filter"
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title_asc">Title (A-Z)</option>
            <option value="title_desc">Title (Z-A)</option>
          </select>

          <button className="nav-btn btn-primary" onClick={onNavigateToAdd}>
            + Add Task
          </button>
        </div>
      </div>

      {/* 3. Tasks List Grid */}
      {loading ? (
        <div className="spinner-container">
          <span className="spinner"></span>
        </div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📂</div>
          <h3>No tasks found</h3>
          <p>Create a task to get started or clear your search query.</p>
          <button className="nav-btn btn-primary" onClick={onNavigateToAdd}>
            Add Task
          </button>
        </div>
      ) : (
        <>
          <div className="tasks-grid">
            {tasks.map((task) => (
              <div key={task.id} className={`task-card ${task.status.replace(' ', '-')}`}>
                <div className="task-header">
                  <h3 className="task-title" title={task.title}>{task.title}</h3>
                  <span className={`badge ${task.status.toLowerCase().replace(' ', '-')}`}>
                    {task.status}
                  </span>
                </div>
                
                <p className="task-desc">{task.description}</p>
                
                <div className="task-footer">
                  <div className="task-date">
                    📅 {formatDate(task.created_at)}
                  </div>
                  <div className="task-actions">
                    {task.status !== 'Completed' && (
                      <button
                        className="action-btn complete"
                        title="Mark as Completed"
                        onClick={() => handleCompleteTask(task.id)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </button>
                    )}
                    <button
                      className="action-btn delete"
                      title="Delete Task"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 4. Pagination Panel */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
              >
                &laquo;
              </button>
              {Array.from({ length: totalPages }, (_, idx) => (
                <button
                  key={idx + 1}
                  className={`page-btn ${page === idx + 1 ? 'active' : ''}`}
                  onClick={() => setPage(idx + 1)}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                className="page-btn"
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
              >
                &raquo;
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
