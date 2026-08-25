import api from './api';

class TaskService {
  async getAllTasks() {
    const response = await api.get('/tasks');
    return response.data; // Extracts { success, data, message } wrapper
  }

  async getTaskById(id) {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  }

  async createTask(taskData) {
    const response = await api.post('/tasks', taskData);
    return response.data;
  }

  async updateTask(id, updateData) {
    const response = await api.put(`/tasks/${id}`, updateData);
    return response.data;
  }

  async deleteTask(id) {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  }
}

export default new TaskService();
