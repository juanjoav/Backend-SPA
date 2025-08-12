const Joi = require('joi');

const createTaskSchema = Joi.object({
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
    .default(false),
  
  priority: Joi.string()
    .valid('baja', 'media', 'alta')
    .default('media')
    .messages({
      'any.only': 'La prioridad debe ser: baja, media o alta'
    }),
  
  dueDate: Joi.date()
    .iso()
    .allow(null)
    .default(null)
    .messages({
      'date.format': 'La fecha debe estar en formato ISO válido'
    })
});

const updateTaskSchema = Joi.object({
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
  
  completed: Joi.boolean(),
  
  priority: Joi.string()
    .valid('baja', 'media', 'alta')
    .messages({
      'any.only': 'La prioridad debe ser: baja, media o alta'
    }),
  
  dueDate: Joi.date()
    .iso()
    .allow(null)
    .messages({
      'date.format': 'La fecha debe estar en formato ISO válido'
    })
}).min(1).messages({
  'object.min': 'Debe proporcionar al menos un campo para actualizar'
});

const validateCreateTask = (req, res, next) => {
  const { error, value } = createTaskSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      error: 'Datos de entrada inválidos',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }
  
  req.body = value;
  next();
};

const validateUpdateTask = (req, res, next) => {
  const { error, value } = updateTaskSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      error: 'Datos de entrada inválidos',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }
  
  req.body = value;
  next();
};

module.exports = {
  validateCreateTask,
  validateUpdateTask
};
