import { Router, Request, Response } from 'express';
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats
} from '../controllers/taskController';
import {
  validateCreateTask,
  validateUpdateTask,
  validateMongoId,
  validateTaskQueryFilters
} from '../validators/taskValidator';
import { authenticateToken, optionalAuth } from '../middleware/auth';

/**
 * Router para las rutas relacionadas con tareas
 * Incluye autenticación, validación y control de errores
 */
const router = Router();

/**
 * @route GET /api/tasks
 * @desc Obtener todas las tareas del usuario (requiere autenticación)
 * @access Privado
 * @query {boolean} [completed] - Filtrar por estado de completado
 * @query {string} [priority] - Filtrar por prioridad (baja|media|alta)
 * @query {string} [sortBy] - Campo para ordenar (title|completed|priority|dueDate|createdAt|updatedAt)
 * @query {string} [order] - Orden (asc|desc)
 */
router.get(
  '/tasks',
  authenticateToken,
  validateTaskQueryFilters,
  getAllTasks
);

/**
 * @route GET /api/tasks/stats
 * @desc Obtener estadísticas de tareas del usuario
 * @access Privado
 */
router.get(
  '/tasks/stats',
  authenticateToken,
  getTaskStats
);

/**
 * @route GET /api/tasks/:id
 * @desc Obtener una tarea específica por ID
 * @access Privado
 * @param {string} id - ID de la tarea (MongoDB ObjectId)
 */
router.get(
  '/tasks/:id',
  authenticateToken,
  validateMongoId,
  (req: Request, res: Response) => getTaskById(req, res)
);

/**
 * @route POST /api/tasks
 * @desc Crear una nueva tarea
 * @access Privado
 * @body {ICreateTaskDTO} - Datos de la nueva tarea
 */
router.post(
  '/tasks',
  authenticateToken,
  validateCreateTask,
  createTask
);

/**
 * @route PUT /api/tasks/:id
 * @desc Actualizar una tarea existente por ID
 * @access Privado
 * @param {string} id - ID de la tarea (MongoDB ObjectId)
 * @body {IUpdateTaskDTO} - Datos para actualizar
 */
router.put(
  '/tasks/:id',
  authenticateToken,
  validateMongoId,
  validateUpdateTask,
  (req: Request, res: Response) => updateTask(req, res)
);

/**
 * @route DELETE /api/tasks/:id
 * @desc Eliminar una tarea por ID
 * @access Privado
 * @param {string} id - ID de la tarea (MongoDB ObjectId)
 */
router.delete(
  '/tasks/:id',
  authenticateToken,
  validateMongoId,
  (req: Request, res: Response) => deleteTask(req, res)
);

export default router;
