const express = require('express');
const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');

const router = express.Router();

router.route('/').get(getAllTasks).post(createTask);

router
  .route('/:id')
  .get(getTaskById)
  .put(updateTask)
  .patch(updateTask)
  .delete(deleteTask);

module.exports = router;
