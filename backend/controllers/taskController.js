const { Task } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all tasks (with filters, search, pagination, sort)
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { search, status, sortBy, page = 1, limit = 6 } = req.query;
    
    // Base query conditions scoped to the logged-in user
    const whereCondition = {
      user_id: req.user.id
    };

    // Filter by status if provided
    if (status && status !== 'All') {
      whereCondition.status = status;
    }

    // Search by title or description if provided
    if (search) {
      whereCondition[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    // Sorting order
    let order = [['created_at', 'DESC']]; // default sorting
    if (sortBy === 'oldest') {
      order = [['created_at', 'ASC']];
    } else if (sortBy === 'title_asc') {
      order = [['title', 'ASC']];
    } else if (sortBy === 'title_desc') {
      order = [['title', 'DESC']];
    }

    // Pagination calculations
    const limitNum = parseInt(limit, 10);
    const pageNum = parseInt(page, 10);
    const offset = (pageNum - 1) * limitNum;

    // Fetch tasks with count
    const { count, rows: tasks } = await Task.findAndCountAll({
      where: whereCondition,
      order,
      limit: limitNum,
      offset,
    });

    res.json({
      tasks,
      total: count,
      pages: Math.ceil(count / limitNum),
      currentPage: pageNum
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error, failed to retrieve tasks.' });
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const { title, description, status = 'Pending' } = req.body;

    // Field-level validations
    if (!title || title.trim() === '') {
      return res.status(400).json({ message: 'Task title is required.' });
    }

    if (!description || description.trim().length < 20) {
      return res.status(400).json({ message: 'Description must be at least 20 characters long.' });
    }

    if (!['Pending', 'In Progress', 'Completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid task status. Must be Pending, In Progress, or Completed.' });
    }

    const task = await Task.create({
      title,
      description,
      status,
      user_id: req.user.id
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error, failed to create task.' });
  }
};

// @desc    Update a task (status or all details)
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const { title, description, status } = req.body;
    const task = await Task.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found or unauthorized.' });
    }

    // Input validation if specific fields are updated
    if (title !== undefined && title.trim() === '') {
      return res.status(400).json({ message: 'Task title is required.' });
    }

    if (description !== undefined && description.trim().length < 20) {
      return res.status(400).json({ message: 'Description must be at least 20 characters long.' });
    }

    if (status !== undefined && !['Pending', 'In Progress', 'Completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid task status.' });
    }

    // Update fields
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;

    await task.save();
    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error, failed to update task.' });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found or unauthorized.' });
    }

    await task.destroy();
    res.json({ message: 'Task deleted successfully.' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error, failed to delete task.' });
  }
};

// @desc    Get dashboard statistics for user
// @route   GET /api/tasks/stats
// @access  Private
const getTaskStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const totalTasks = await Task.count({ where: { user_id: userId } });
    const pendingTasks = await Task.count({ where: { user_id: userId, status: 'Pending' } });
    const inProgressTasks = await Task.count({ where: { user_id: userId, status: 'In Progress' } });
    const completedTasks = await Task.count({ where: { user_id: userId, status: 'Completed' } });

    res.json({
      total: totalTasks,
      pending: pendingTasks,
      inProgress: inProgressTasks,
      completed: completedTasks
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error, failed to load statistics.' });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats
};
