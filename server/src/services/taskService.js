const Task = require('../models/Task');

/**
 * Task Service
 * 
 * This layer handles all database interactions. The controller calls this service,
 * meaning the controller doesn't need to know anything about Mongoose or MongoDB.
 */
class TaskService {
  async getAllTasks() {
    return await Task.find().sort({ createdAt: -1 });
  }

  async getTaskById(id) {
    return await Task.findById(id);
  }

  async createTask(taskData) {
    return await Task.create(taskData);
  }

  async updateTask(id, updateData) {
    // We fetch the task first to utilize Mongoose pre-save hooks (like syncing 'completed' status)
    const task = await Task.findById(id);
    
    if (!task) {
      return null;
    }

    // Apply updates
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined) {
        task[key] = updateData[key];
      }
    });

    return await task.save();
  }

  async deleteTask(id) {
    return await Task.findByIdAndDelete(id);
  }
}

// Export a single instance (Singleton pattern)
module.exports = new TaskService();
