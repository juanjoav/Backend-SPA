import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { TaskPriority, ICreateTaskDTO, IUpdateTaskDTO, IApiErrorResponse } from '../types';

/**
 * Schema de validación para crear una nueva tarea
 * Valida todos los campos requeridos y opcionales para la creación
 */
const createTaskSchema = Joi.object<ICreateTaskDTO>({
  title: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.empty': 'El título no puede estar vacío',
      'string.min': 'El título debe tener al menos 1 carácter',
      'string.max': 'El título no puede exceder 100 caracteres',
      'any.required': 'El título es obligatorio'
    }),
  
  description: Joi.string()
    .trim()
    .max(500)
    .allow('')
    .default('')
    .messages({
      'string.max': 'La descripción no puede exceder 500 caracteres'
    }),
  
  completed: Joi.boolean()
    .default(false)
    .messages({
      'boolean.base': 'El campo completed debe ser verdadero o falso'
    }),
  
  priority: Joi.string()
    .valid(...Object.values(TaskPriority))
    .default(TaskPriority.MEDIA)
    .messages({
      'any.only': `La prioridad debe ser: ${Object.values(TaskPriority).join(', ')}`
    }),
  
  dueDate: Joi.date()
    .iso()
    .allow(null)
    .default(null)
    .messages({
      'date.format': 'La fecha debe estar en formato ISO válido (YYYY-MM-DDTHH:mm:ss.sssZ)',
      'date.base': 'La fecha de vencimiento debe ser una fecha válida'
    })
});

/**
 * Schema de validación para actualizar una tarea existente
 * Todos los campos son opcionales, pero al menos uno debe estar presente
 */
const updateTaskSchema = Joi.object<IUpdateTaskDTO>({
  title: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .messages({
      'string.empty': 'El título no puede estar vacío',
      'string.min': 'El título debe tener al menos 1 carácter',
      'string.max': 'El título no puede exceder 100 caracteres'
    }),
  
  description: Joi.string()
    .trim()
    .max(500)
    .allow('')
    .messages({
      'string.max': 'La descripción no puede exceder 500 caracteres'
    }),
  
  completed: Joi.boolean()
    .messages({
      'boolean.base': 'El campo completed debe ser verdadero o falso'
    }),
  
  priority: Joi.string()
    .valid(...Object.values(TaskPriority))
    .messages({
      'any.only': `La prioridad debe ser: ${Object.values(TaskPriority).join(', ')}`
    }),
  
  dueDate: Joi.date()
    .iso()
    .allow(null)
    .messages({
      'date.format': 'La fecha debe estar en formato ISO válido (YYYY-MM-DDTHH:mm:ss.sssZ)',
      'date.base': 'La fecha de vencimiento debe ser una fecha válida'
    })
}).min(1).messages({
  'object.min': 'Debe proporcionar al menos un campo para actualizar'
});

/**
 * Schema de validación para parámetros de ID de MongoDB
 */
const mongoIdSchema = Joi.string()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .required()
  .messages({
    'string.pattern.base': 'El ID debe ser un ObjectId válido de MongoDB',
    'any.required': 'El ID es obligatorio'
  });

/**
 * Función helper para formatear errores de validación
 * @param error - Error de validación de Joi
 * @returns Array de errores formateados
 */
const formatValidationErrors = (error: Joi.ValidationError) => {
  return error.details.map(detail => ({
    field: detail.path.join('.'),
    message: detail.message
  }));
};

/**
 * Middleware de validación para crear una nueva tarea
 * Valida el cuerpo de la petición contra el schema de creación
 */
export const validateCreateTask = (req: Request, res: Response, next: NextFunction): void => {
  const { error, value } = createTaskSchema.validate(req.body, {
    abortEarly: false, // Obtener todos los errores, no solo el primero
    stripUnknown: true // Remover campos no definidos en el schema
  });
  
  if (error) {
    const errorResponse: IApiErrorResponse = {
      error: 'Datos de entrada inválidos',
      message: 'La información proporcionada para crear la tarea no es válida',
      details: formatValidationErrors(error)
    };
    
    res.status(400).json(errorResponse);
    return;
  }
  
  // Asignar los valores validados y limpiados al cuerpo de la petición
  req.body = value;
  next();
};

/**
 * Middleware de validación para actualizar una tarea existente
 * Valida el cuerpo de la petición contra el schema de actualización
 */
export const validateUpdateTask = (req: Request, res: Response, next: NextFunction): void => {
  const { error, value } = updateTaskSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });
  
  if (error) {
    const errorResponse: IApiErrorResponse = {
      error: 'Datos de entrada inválidos',
      message: 'La información proporcionada para actualizar la tarea no es válida',
      details: formatValidationErrors(error)
    };
    
    res.status(400).json(errorResponse);
    return;
  }
  
  req.body = value;
  next();
};

/**
 * Middleware de validación para parámetros de ID de MongoDB
 * Valida que el ID sea un ObjectId válido
 */
export const validateMongoId = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = mongoIdSchema.validate(req.params.id);
  
  if (error) {
    const errorResponse: IApiErrorResponse = {
      error: 'ID inválido',
      message: 'El ID proporcionado no es un ObjectId válido de MongoDB'
    };
    
    res.status(400).json(errorResponse);
    return;
  }
  
  next();
};

/**
 * Middleware de validación para filtros de consulta de tareas
 * Valida y sanitiza los parámetros de query
 */
export const validateTaskQueryFilters = (req: Request, res: Response, next: NextFunction): void => {
  const querySchema = Joi.object({
    completed: Joi.boolean()
      .messages({
        'boolean.base': 'El parámetro completed debe ser true o false'
      }),
    
    priority: Joi.string()
      .valid(...Object.values(TaskPriority))
      .messages({
        'any.only': `La prioridad debe ser: ${Object.values(TaskPriority).join(', ')}`
      }),
    
    sortBy: Joi.string()
      .valid('title', 'completed', 'priority', 'dueDate', 'createdAt', 'updatedAt')
      .default('createdAt')
      .messages({
        'any.only': 'El campo sortBy debe ser: title, completed, priority, dueDate, createdAt, o updatedAt'
      }),
    
    order: Joi.string()
      .valid('asc', 'desc')
      .default('desc')
      .messages({
        'any.only': 'El orden debe ser: asc o desc'
      })
  });

  const { error, value } = querySchema.validate(req.query, {
    stripUnknown: true
  });

  if (error) {
    const errorResponse: IApiErrorResponse = {
      error: 'Parámetros de consulta inválidos',
      message: 'Los filtros proporcionados no son válidos',
      details: formatValidationErrors(error)
    };
    
    res.status(400).json(errorResponse);
    return;
  }

  req.query = value;
  next();
};
