const Task = require('../models/Task');

/**
 * Task Service
 * 
 * This layer handles all database interactions. The controller calls this service,
 * meaning the controller doesn't need to know anything about Mongoose or MongoDB.
 */
class TaskService {
  async getAllTasks(userId) {
    return await Task.find({ user: userId }).sort({ createdAt: -1 });
  }

  async getTaskById(id, userId) {
    return await Task.findOne({ _id: id, user: userId });
  }

  async createTask(taskData) {
    return await Task.create(taskData);
  }

  async updateTask(id, userId, updateData) {
    // We fetch the task first to utilize Mongoose pre-save hooks (like syncing 'completed' status)
    const task = await Task.findOne({ _id: id, user: userId });
    
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

  async deleteTask(id, userId) {
    return await Task.findOneAndDelete({ _id: id, user: userId });
  }
}

// Export a single instance (Singleton pattern)
module.exports = new TaskService();
