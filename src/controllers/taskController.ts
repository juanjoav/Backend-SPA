import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Task from '../models/Task';
import { 
  ITaskDocument, 
  ICreateTaskDTO, 
  IUpdateTaskDTO, 
  ITaskQueryFilters, 
  IApiResponse, 
  IApiErrorResponse,
  ITaskParamsDTO,
  TaskPriority 
} from '../types';

/**
 * Controlador para obtener todas las tareas con filtros opcionales
 * Soporta filtrado por estado, prioridad y ordenamiento
 * 
 * @param req - Request con query parameters opcionales
 * @param res - Response con lista de tareas
 */
export const getAllTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extraer y tipar los parámetros de consulta
    const { 
      completed, 
      priority, 
      sortBy = 'createdAt', 
      order = 'desc' 
    } = req.query as ITaskQueryFilters;
    
    // Construir filtros dinámicamente
    const filters: Record<string, any> = {};
    
    if (completed !== undefined) {
      filters.completed = completed;
    }
    
    if (priority) {
      filters.priority = priority;
    }
    
    // Configurar ordenamiento
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions: Record<string, 1 | -1> = { [sortBy]: sortOrder };
    
    // Ejecutar consulta con filtros y ordenamiento
    const tasks: ITaskDocument[] = await Task.find(filters).sort(sortOptions);
    
    // Respuesta exitosa tipada
    const response: IApiResponse<ITaskDocument[]> = {
      success: true,
      count: tasks.length,
      data: tasks
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    
    const errorResponse: IApiErrorResponse = {
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener las tareas'
    };
    
    res.status(500).json(errorResponse);
  }
};

/**
 * Controlador para obtener una tarea específica por su ID
 * 
 * @param req - Request con parámetro id
 * @param res - Response con la tarea encontrada
 */
export const getTaskById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validar formato de ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const errorResponse: IApiErrorResponse = {
        error: 'ID inválido',
        message: 'El ID proporcionado no es un ObjectId válido de MongoDB'
      };
      
      res.status(400).json(errorResponse);
      return;
    }
    
    // Buscar tarea por ID
    const task: ITaskDocument | null = await Task.findById(id);
    
    if (!task) {
      const errorResponse: IApiErrorResponse = {
        error: 'Tarea no encontrada',
        message: 'No existe una tarea con el ID proporcionado'
      };
      
      res.status(404).json(errorResponse);
      return;
    }
    
    // Respuesta exitosa
    const response: IApiResponse<ITaskDocument> = {
      success: true,
      data: task
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error al obtener tarea:', error);
    
    const errorResponse: IApiErrorResponse = {
      error: 'Error interno del servidor',
      message: 'No se pudo obtener la tarea'
    };
    
    res.status(500).json(errorResponse);
  }
};

/**
 * Controlador para crear una nueva tarea
 * 
 * @param req - Request con datos de la nueva tarea en el body
 * @param res - Response con la tarea creada
 */
export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    // Crear nueva instancia de tarea con datos validados
    const task = new Task(req.body);
    const savedTask: ITaskDocument = await task.save();
    
    // Respuesta exitosa con tarea creada
    const response: IApiResponse<ITaskDocument> = {
      success: true,
      message: 'Tarea creada exitosamente',
      data: savedTask
    };
    
    res.status(201).json(response);
  } catch (error) {
    console.error('Error al crear tarea:', error);
    
    // Manejar errores de validación de Mongoose
    if (error instanceof Error && error.name === 'ValidationError') {
      const mongooseError = error as mongoose.Error.ValidationError;
      const validationErrors = Object.values(mongooseError.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      const errorResponse: IApiErrorResponse = {
        error: 'Datos de entrada inválidos',
        message: 'La información proporcionada para crear la tarea no es válida',
        details: validationErrors
      };
      
      res.status(400).json(errorResponse);
      return;
    }
    
    // Error genérico del servidor
    const errorResponse: IApiErrorResponse = {
      error: 'Error interno del servidor',
      message: 'No se pudo crear la tarea'
    };
    
    res.status(500).json(errorResponse);
  }
};

/**
 * Controlador para actualizar una tarea existente
 * 
 * @param req - Request con ID en params y datos de actualización en body
 * @param res - Response con la tarea actualizada
 */
export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validar formato de ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const errorResponse: IApiErrorResponse = {
        error: 'ID inválido',
        message: 'El ID proporcionado no es un ObjectId válido de MongoDB'
      };
      
      res.status(400).json(errorResponse);
      return;
    }
    
    // Actualizar tarea con validación
    const updatedTask: ITaskDocument | null = await Task.findByIdAndUpdate(
      id,
      req.body,
      { 
        new: true, // Retornar el documento actualizado
        runValidators: true // Ejecutar validaciones del schema
      }
    );
    
    if (!updatedTask) {
      const errorResponse: IApiErrorResponse = {
        error: 'Tarea no encontrada',
        message: 'No existe una tarea con el ID proporcionado'
      };
      
      res.status(404).json(errorResponse);
      return;
    }
    
    // Respuesta exitosa con tarea actualizada
    const response: IApiResponse<ITaskDocument> = {
      success: true,
      message: 'Tarea actualizada exitosamente',
      data: updatedTask
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error al actualizar tarea:', error);
    
    // Manejar errores de validación de Mongoose
    if (error instanceof Error && error.name === 'ValidationError') {
      const mongooseError = error as mongoose.Error.ValidationError;
      const validationErrors = Object.values(mongooseError.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      const errorResponse: IApiErrorResponse = {
        error: 'Datos de entrada inválidos',
        message: 'La información proporcionada para actualizar la tarea no es válida',
        details: validationErrors
      };
      
      res.status(400).json(errorResponse);
      return;
    }
    
    // Error genérico del servidor
    const errorResponse: IApiErrorResponse = {
      error: 'Error interno del servidor',
      message: 'No se pudo actualizar la tarea'
    };
    
    res.status(500).json(errorResponse);
  }
};

/**
 * Controlador para eliminar una tarea
 * 
 * @param req - Request con ID de la tarea a eliminar
 * @param res - Response con confirmación de eliminación
 */
export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validar formato de ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const errorResponse: IApiErrorResponse = {
        error: 'ID inválido',
        message: 'El ID proporcionado no es un ObjectId válido de MongoDB'
      };
      
      res.status(400).json(errorResponse);
      return;
    }
    
    // Eliminar tarea
    const deletedTask: ITaskDocument | null = await Task.findByIdAndDelete(id);
    
    if (!deletedTask) {
      const errorResponse: IApiErrorResponse = {
        error: 'Tarea no encontrada',
        message: 'No existe una tarea con el ID proporcionado'
      };
      
      res.status(404).json(errorResponse);
      return;
    }
    
    // Respuesta exitosa con tarea eliminada
    const response: IApiResponse<ITaskDocument> = {
      success: true,
      message: 'Tarea eliminada exitosamente',
      data: deletedTask
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    
    const errorResponse: IApiErrorResponse = {
      error: 'Error interno del servidor',
      message: 'No se pudo eliminar la tarea'
    };
    
    res.status(500).json(errorResponse);
  }
};

/**
 * Controlador para obtener estadísticas de tareas
 * Proporciona un resumen del estado de las tareas
 * 
 * @param req - Request
 * @param res - Response con estadísticas
 */
export const getTaskStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // Obtener conteos usando agregación de MongoDB
    const stats = await Task.aggregate([
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ['$completed', true] }, 1, 0] }
          },
          pendingTasks: {
            $sum: { $cond: [{ $eq: ['$completed', false] }, 1, 0] }
          },
          highPriorityTasks: {
            $sum: { $cond: [{ $eq: ['$priority', TaskPriority.ALTA] }, 1, 0] }
          },
          overdueTasks: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$dueDate', null] },
                    { $lt: ['$dueDate', new Date()] },
                    { $eq: ['$completed', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const taskStats = stats[0] || {
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      highPriorityTasks: 0,
      overdueTasks: 0
    };

    // Calcular porcentaje de completado
    const completionPercentage = taskStats.totalTasks > 0 
      ? Math.round((taskStats.completedTasks / taskStats.totalTasks) * 100)
      : 0;

    const response: IApiResponse = {
      success: true,
      data: {
        ...taskStats,
        completionPercentage
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    
    const errorResponse: IApiErrorResponse = {
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener las estadísticas de tareas'
    };
    
    res.status(500).json(errorResponse);
  }
};
