import React, { useState } from 'react';
import taskService from '../services/taskService';

const AddTask = ({ onTaskAdded, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Pending');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const tempErrors = {};
    if (!title.trim()) {
      tempErrors.title = 'Task title is required.';
    }
    if (!description.trim()) {
      tempErrors.description = 'Description is required.';
    } else if (description.trim().length < 20) {
      tempErrors.description = 'Description must be at least 20 characters long.';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    
    if (!validate()) return;

    setLoading(true);
    try {
      await taskService.createTask({ title, description, status });
      onTaskAdded(); // Return to dashboard
    } catch (err) {
      console.error(err);
      setServerError(err.response?.data?.message || 'Failed to create task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>Add New Task</h2>
        <p>Create a task to track your progress.</p>
      </div>

      {serverError && <div className="alert alert-danger">{serverError}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="task-title">Task Title</label>
          <input
            id="task-title"
            type="text"
            className={`form-input ${errors.title ? 'is-invalid' : ''}`}
            placeholder="e.g. Build Login Page"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
          />
          {errors.title && <div className="form-error">{errors.title}</div>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="task-desc">Description</label>
          <textarea
            id="task-desc"
            className={`form-input form-textarea ${errors.description ? 'is-invalid' : ''}`}
            placeholder="Describe the task requirements in detail (minimum 20 characters)..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />
          {errors.description && <div className="form-error">{errors.description}</div>}
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem', textAlign: 'right' }}>
            {description.length}/20 min chars
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="task-status">Status</label>
          <select
            id="task-status"
            className="select-filter"
            style={{ width: '100%', padding: '0.75rem' }}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={loading}
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-submit" style={{ flex: 1 }} disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></span>
                Creating...
              </>
            ) : (
              'Create Task'
            )}
          </button>
          <button type="button" className="btn-cancel" style={{ flex: 1 }} onClick={onCancel} disabled={loading}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTask;
