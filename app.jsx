import React, { useState, useEffect } from 'react';
import './App.css';

/**
 * Main App Component - Root component that manages the entire todo application
 * Handles state management, localStorage persistence, and renders child components
 */
const App = () => {
  // Load tasks from localStorage or initialize with empty array
  const loadTasksFromStorage = () => {
    try {
      const savedTasks = localStorage.getItem('todoTasks');
      return savedTasks ? JSON.parse(savedTasks) : [];
    } catch (error) {
      console.error('Error loading tasks from localStorage:', error);
      return [];
    }
  };

  // State for tasks array
  const [tasks, setTasks] = useState(loadTasksFromStorage);
  // State for currently editing task (null if not editing)
  const [editingTask, setEditingTask] = useState(null);
  // State for form validation errors
  const [formErrors, setFormErrors] = useState({});

  /**
   * Save tasks to localStorage whenever tasks state changes
   */
  useEffect(() => {
    try {
      localStorage.setItem('todoTasks', JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks to localStorage:', error);
    }
  }, [tasks]);

  /**
   * Validate task form inputs
   * @param {Object} task - Task object with name and description
   * @returns {Object} - Object containing validation errors
   */
  const validateTask = (task) => {
    const errors = {};
    
    if (!task.name || task.name.trim() === '') {
      errors.name = 'Task name is required';
    } else if (task.name.length < 3) {
      errors.name = 'Task name must be at least 3 characters';
    } else if (task.name.length > 100) {
      errors.name = 'Task name must be less than 100 characters';
    }

    if (!task.description || task.description.trim() === '') {
      errors.description = 'Task description is required';
    } else if (task.description.length < 5) {
      errors.description = 'Description must be at least 5 characters';
    } else if (task.description.length > 500) {
      errors.description = 'Description must be less than 500 characters';
    }

    return errors;
  };

  /**
   * Handle adding a new task
   * @param {Object} taskData - New task data from form
   */
  const handleAddTask = (taskData) => {
    const errors = validateTask(taskData);
    
    if (Object.keys(errors).length === 0) {
      const newTask = {
        id: Date.now(), // Use timestamp as unique ID
        name: taskData.name.trim(),
        description: taskData.description.trim(),
        completed: false,
        createdAt: new Date().toISOString()
      };
      
      setTasks([...tasks, newTask]);
      setFormErrors({});
      return true;
    } else {
      setFormErrors(errors);
      return false;
    }
  };

  /**
   * Handle editing an existing task
   * @param {Object} updatedTask - Updated task data
   */
  const handleEditTask = (updatedTask) => {
    const errors = validateTask(updatedTask);
    
    if (Object.keys(errors).length === 0) {
      setTasks(tasks.map(task => 
        task.id === updatedTask.id 
          ? { 
              ...task, 
              name: updatedTask.name.trim(), 
              description: updatedTask.description.trim() 
            } 
          : task
      ));
      setEditingTask(null);
      setFormErrors({});
      return true;
    } else {
      setFormErrors(errors);
      return false;
    }
  };

  /**
   * Handle deleting a task with confirmation
   * @param {number} taskId - ID of task to delete
   */
  const handleDeleteTask = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(tasks.filter(task => task.id !== taskId));
      if (editingTask?.id === taskId) {
        setEditingTask(null);
      }
    }
  };

  /**
   * Toggle task completion status
   * @param {number} taskId - ID of task to toggle
   */
  const handleToggleComplete = (taskId) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? { ...task, completed: !task.completed }
        : task
    ));
  };

  /**
   * Set task for editing
   * @param {Object} task - Task to edit
   */
  const handleStartEdit = (task) => {
    setEditingTask(task);
    setFormErrors({});
  };

  /**
   * Cancel editing mode
   */
  const handleCancelEdit = () => {
    setEditingTask(null);
    setFormErrors({});
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>📝 TaskMaster Todo List</h1>
        <p className="subtitle">Organize your tasks efficiently</p>
      </header>

      <main className="app-main">
        <TaskForm
          onSubmit={editingTask ? handleEditTask : handleAddTask}
          initialData={editingTask}
          onCancel={editingTask ? handleCancelEdit : null}
          errors={formErrors}
        />
        
        <TaskList
          tasks={tasks}
          onToggleComplete={handleToggleComplete}
          onEdit={handleStartEdit}
          onDelete={handleDeleteTask}
        />
      </main>

      <footer className="app-footer">
        <p>Total Tasks: {tasks.length} | Completed: {tasks.filter(t => t.completed).length}</p>
      </footer>
    </div>
  );
};

/**
 * TaskForm Component - Handles task creation and editing
 * @param {Object} props - Component props
 * @param {Function} props.onSubmit - Submit handler
 * @param {Object} props.initialData - Initial task data for editing
 * @param {Function} props.onCancel - Cancel edit handler
 * @param {Object} props.errors - Validation errors
 */
const TaskForm = ({ onSubmit, initialData, onCancel, errors }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  // Update form when editing task changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description
      });
    } else {
      setFormData({ name: '', description: '' });
    }
  }, [initialData]);

  /**
   * Handle form input changes
   * @param {Object} e - Event object
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Handle form submission
   * @param {Object} e - Event object
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const taskData = initialData
      ? { ...formData, id: initialData.id }
      : formData;
    
    if (onSubmit(taskData)) {
      // Clear form only if submission was successful and not editing
      if (!initialData) {
        setFormData({ name: '', description: '' });
      }
    }
  };

  return (
    <div className="task-form-container">
      <h2>{initialData ? 'Edit Task' : 'Add New Task'}</h2>
      <form onSubmit={handleSubmit} className="task-form">
        <div className="form-group">
          <label htmlFor="name">Task Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter task name"
            className={errors.name ? 'error' : ''}
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter task description"
            rows="4"
            className={errors.description ? 'error' : ''}
          />
          {errors.description && <span className="error-message">{errors.description}</span>}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {initialData ? 'Update Task' : 'Add Task'}
          </button>
          {onCancel && (
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

/**
 * TaskList Component - Displays all tasks
 * @param {Object} props - Component props
 * @param {Array} props.tasks - Array of task objects
 * @param {Function} props.onToggleComplete - Toggle completion handler
 * @param {Function} props.onEdit - Edit task handler
 * @param {Function} props.onDelete - Delete task handler
 */
const TaskList = ({ tasks, onToggleComplete, onEdit, onDelete }) => {
  // Sort tasks: active first, then completed
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed === b.completed) return 0;
    return a.completed ? 1 : -1;
  });

  if (tasks.length === 0) {
    return (
      <div className="task-list empty">
        <p className="empty-message">No tasks yet. Add your first task above! 🎉</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      <h2>Your Tasks</h2>
      <div className="tasks-container">
        {sortedTasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            onToggleComplete={onToggleComplete}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * TaskItem Component - Individual task display
 * @param {Object} props - Component props
 * @param {Object} props.task - Task object
 * @param {Function} props.onToggleComplete - Toggle completion handler
 * @param {Function} props.onEdit - Edit task handler
 * @param {Function} props.onDelete - Delete task handler
 */
const TaskItem = ({ task, onToggleComplete, onEdit, onDelete }) => {
  return (
    <div className={`task-item ${task.completed ? 'completed' : 'active'}`}>
      <div className="task-content">
        <div className="task-header">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => onToggleComplete(task.id)}
            className="task-checkbox"
          />
          <h3 className="task-name">{task.name}</h3>
        </div>
        <p className="task-description">{task.description}</p>
        <small className="task-date">
          Created: {new Date(task.createdAt).toLocaleDateString()}
        </small>
      </div>
      
      <div className="task-actions">
        <button
          onClick={() => onEdit(task)}
          className="btn btn-edit"
          disabled={task.completed}
          title={task.completed ? "Cannot edit completed tasks" : "Edit task"}
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="btn btn-delete"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default App;
