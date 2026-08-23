const Task = require('../models/Task');
const ApiResponse = require('../utils/ApiResponse');
const { TASK_STATUS_VALUES, TASK_PRIORITY_VALUES } = require('../constants/taskConstants');

exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    return ApiResponse.ok(res, 'Tasks fetched successfully', tasks);
  } catch (error) {
    return ApiResponse.internal(res, 'Failed to fetch tasks', error.message);
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return ApiResponse.notFound(res, 'Task not found');
    }

    return ApiResponse.ok(res, 'Task fetched successfully', task);
  } catch (error) {
    return ApiResponse.internal(res, 'Failed to fetch task', error.message);
  }
};

exports.createTask = async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;
    let { status, priority } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return ApiResponse.badRequest(res, 'Task title is required');
    }

    // Normalize to lowercase so "TODO", "Todo", "todo" all work
    if (status) status = status.toLowerCase();
    if (priority) priority = priority.toLowerCase();

    if (status && !TASK_STATUS_VALUES.includes(status)) {
      return ApiResponse.badRequest(
        res,
        `Invalid status. Must be one of: ${TASK_STATUS_VALUES.join(', ')}`
      );
    }

    if (priority && !TASK_PRIORITY_VALUES.includes(priority)) {
      return ApiResponse.badRequest(
        res,
        `Invalid priority. Must be one of: ${TASK_PRIORITY_VALUES.join(', ')}`
      );
    }

    if (dueDate && isNaN(Date.parse(dueDate))) {
      return ApiResponse.badRequest(res, 'Invalid due date format');
    }

    const newTask = await Task.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
    });

    return ApiResponse.created(res, 'Task created successfully', newTask);
  } catch (error) {
    return ApiResponse.internal(res, 'Failed to create task', error.message);
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return ApiResponse.notFound(res, 'Task not found');
    }

    const { title, description, dueDate } = req.body;
    let { status, priority } = req.body;

    // Normalize to lowercase
    if (status !== undefined && status !== null) status = String(status).toLowerCase();
    if (priority !== undefined && priority !== null) priority = String(priority).toLowerCase();

    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim()) {
        return ApiResponse.badRequest(res, 'Task title is required');
      }
      task.title = title.trim();
    }

    if (description !== undefined) {
      task.description = description ? description.trim() : '';
    }

    if (status !== undefined) {
      if (!TASK_STATUS_VALUES.includes(status)) {
        return ApiResponse.badRequest(
          res,
          `Invalid status. Must be one of: ${TASK_STATUS_VALUES.join(', ')}`
        );
      }
      task.status = status;
    }

    if (priority !== undefined) {
      if (!TASK_PRIORITY_VALUES.includes(priority)) {
        return ApiResponse.badRequest(
          res,
          `Invalid priority. Must be one of: ${TASK_PRIORITY_VALUES.join(', ')}`
        );
      }
      task.priority = priority;
    }

    if (dueDate !== undefined) {
      if (dueDate === null) {
        task.dueDate = null;
      } else if (isNaN(Date.parse(dueDate))) {
        return ApiResponse.badRequest(res, 'Invalid due date format');
      } else {
        task.dueDate = new Date(dueDate);
      }
    }

    const updatedTask = await task.save();
    return ApiResponse.ok(res, 'Task updated successfully', updatedTask);
  } catch (error) {
    return ApiResponse.internal(res, 'Failed to update task', error.message);
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return ApiResponse.notFound(res, 'Task not found');
    }

    return ApiResponse.ok(res, 'Task deleted successfully');
  } catch (error) {
    return ApiResponse.internal(res, 'Failed to delete task', error.message);
  }
};
