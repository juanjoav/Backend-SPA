import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { ICreateUserDTO, ILoginUserDTO, IApiErrorResponse } from '../types';

/**
 * Schema de validación para registrar un nuevo usuario
 */
const createUserSchema = Joi.object<ICreateUserDTO>({
  username: Joi.string()
    .trim()
    .min(3)
    .max(30)
    .pattern(/^[a-zA-Z0-9_]+$/)
    .required()
    .messages({
      'string.empty': 'El nombre de usuario es obligatorio',
      'string.min': 'El nombre de usuario debe tener al menos 3 caracteres',
      'string.max': 'El nombre de usuario no puede exceder 30 caracteres',
      'string.pattern.base': 'El nombre de usuario solo puede contener letras, números y guiones bajos',
      'any.required': 'El nombre de usuario es obligatorio'
    }),
  
  email: Joi.string()
    .trim()
    .lowercase()
    .email()
    .required()
    .messages({
      'string.empty': 'El email es obligatorio',
      'string.email': 'El formato del email no es válido',
      'any.required': 'El email es obligatorio'
    }),
  
  password: Joi.string()
    .min(6)
    .max(128)
    .required()
    .messages({
      'string.empty': 'La contraseña es obligatoria',
      'string.min': 'La contraseña debe tener al menos 6 caracteres',
      'string.max': 'La contraseña no puede exceder 128 caracteres',
      'any.required': 'La contraseña es obligatoria'
    })
});

/**
 * Schema de validación para login de usuario
 */
const loginUserSchema = Joi.object<ILoginUserDTO>({
  username: Joi.string()
    .trim()
    .required()
    .messages({
      'string.empty': 'El nombre de usuario o email es obligatorio',
      'any.required': 'El nombre de usuario o email es obligatorio'
    }),
  
  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'La contraseña es obligatoria',
      'any.required': 'La contraseña es obligatoria'
    })
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
 * Middleware de validación para registro de usuario
 */
export const validateCreateUser = (req: Request, res: Response, next: NextFunction): void => {
  const { error, value } = createUserSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });
  
  if (error) {
    const errorResponse: IApiErrorResponse = {
      error: 'Datos de registro inválidos',
      message: 'La información proporcionada para el registro no es válida',
      details: formatValidationErrors(error)
    };
    
    res.status(400).json(errorResponse);
    return;
  }
  
  req.body = value;
  next();
};

/**
 * Middleware de validación para login de usuario
 */
export const validateLoginUser = (req: Request, res: Response, next: NextFunction): void => {
  const { error, value } = loginUserSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });
  
  if (error) {
    const errorResponse: IApiErrorResponse = {
      error: 'Datos de login inválidos',
      message: 'Las credenciales proporcionadas no son válidas',
      details: formatValidationErrors(error)
    };
    
    res.status(400).json(errorResponse);
    return;
  }
  
  req.body = value;
  next();
};
