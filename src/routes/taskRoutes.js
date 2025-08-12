const express = require('express');
const router = express.Router();

const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');

const {
  validateCreateTask,
  validateUpdateTask
} = require('../validators/taskValidator');

router.get('/tasks', getAllTasks);

router.get('/tasks/:id', getTaskById);

router.post('/tasks', validateCreateTask, createTask);

router.put('/tasks/:id', validateUpdateTask, updateTask);

router.delete('/tasks/:id', deleteTask);

module.exports = router;
