const express = require('express');
const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const validateObjectId = require('../middleware/validateObjectId');

const router = express.Router();

router.use(protect);

router.route('/').get(getAllTasks).post(createTask);

// Any route that uses :id will first pass through validateObjectId
router
  .route('/:id')
  .get(validateObjectId, getTaskById)
  .put(validateObjectId, updateTask)
  .patch(validateObjectId, updateTask)
  .delete(validateObjectId, deleteTask);

module.exports = router;
