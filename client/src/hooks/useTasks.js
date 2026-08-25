import { useState, useEffect, useCallback } from 'react';
import taskService from '../services/taskService';
import toast from 'react-hot-toast';

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await taskService.getAllTasks();
      setTasks(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to fetch tasks');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (taskData) => {
    try {
      const response = await taskService.createTask(taskData);
      setTasks((prev) => [response.data, ...prev]);
      toast.success('Task created successfully');
      return true;
    } catch (err) {
      toast.error(err.message || 'Failed to create task');
      return false;
    }
  };

  const updateTask = async (id, updateData) => {
    try {
      const response = await taskService.updateTask(id, updateData);
      setTasks((prev) => prev.map((t) => (t.id === id ? response.data : t)));
      toast.success('Task updated successfully');
      return true;
    } catch (err) {
      toast.error(err.message || 'Failed to update task');
      return false;
    }
  };

  const removeTask = async (id) => {
    try {
      await taskService.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      toast.success('Task deleted successfully');
      return true;
    } catch (err) {
      toast.error(err.message || 'Failed to delete task');
      return false;
    }
  };

  return {
    tasks,
    isLoading,
    error,
    refreshTasks: fetchTasks,
    addTask,
    updateTask,
    removeTask,
  };
}
