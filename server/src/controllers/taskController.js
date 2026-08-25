const taskService = require('../services/taskService');
const ApiResponse = require('../utils/ApiResponse');
const { TASK_STATUS_VALUES, TASK_PRIORITY_VALUES } = require('../constants/taskConstants');

exports.getAllTasks = async (req, res, next) => {
  try {
    const tasks = await taskService.getAllTasks();
    return ApiResponse.ok(res, 'Tasks fetched successfully', tasks);
  } catch (error) {
    next(error);
  }
};

exports.getTaskById = async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(req.params.id);

    if (!task) {
      return ApiResponse.notFound(res, 'Task not found');
    }

    return ApiResponse.ok(res, 'Task fetched successfully', task);
  } catch (error) {
    next(error);
  }
};

exports.createTask = async (req, res, next) => {
  try {
    const { title, description, dueDate } = req.body;
    let { status, priority } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return ApiResponse.badRequest(res, 'Task title is required');
    }

    // Normalize to lowercase
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

    const newTask = await taskService.createTask({
      title: title.trim(),
      description: description ? description.trim() : '',
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
    });

    return ApiResponse.created(res, 'Task created successfully', newTask);
  } catch (error) {
    next(error);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const { title, description, dueDate } = req.body;
    let { status, priority } = req.body;

    // Normalize to lowercase
    if (status !== undefined && status !== null) status = String(status).toLowerCase();
    if (priority !== undefined && priority !== null) priority = String(priority).toLowerCase();

    // Basic Validation
    if (title !== undefined && (typeof title !== 'string' || !title.trim())) {
      return ApiResponse.badRequest(res, 'Task title is required');
    }
    if (status !== undefined && !TASK_STATUS_VALUES.includes(status)) {
      return ApiResponse.badRequest(res, `Invalid status. Must be one of: ${TASK_STATUS_VALUES.join(', ')}`);
    }
    if (priority !== undefined && !TASK_PRIORITY_VALUES.includes(priority)) {
      return ApiResponse.badRequest(res, `Invalid priority. Must be one of: ${TASK_PRIORITY_VALUES.join(', ')}`);
    }
    if (dueDate !== undefined && dueDate !== null && isNaN(Date.parse(dueDate))) {
      return ApiResponse.badRequest(res, 'Invalid due date format');
    }

    // Prepare update payload
    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description ? description.trim() : '';
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;

    const updatedTask = await taskService.updateTask(req.params.id, updateData);

    if (!updatedTask) {
      return ApiResponse.notFound(res, 'Task not found');
    }

    return ApiResponse.ok(res, 'Task updated successfully', updatedTask);
  } catch (error) {
    next(error);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await taskService.deleteTask(req.params.id);

    if (!task) {
      return ApiResponse.notFound(res, 'Task not found');
    }

    return ApiResponse.ok(res, 'Task deleted successfully');
  } catch (error) {
    next(error);
  }
};
