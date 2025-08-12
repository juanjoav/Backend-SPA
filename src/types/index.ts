/**
 * Tipos y interfaces principales para la aplicación To-Do
 */

import { Document } from 'mongoose';
import { Request } from 'express';
import { ParsedQs } from 'qs';

/**
 * Enum para los niveles de prioridad de las tareas
 */
export enum TaskPriority {
  BAJA = 'baja',
  MEDIA = 'media',
  ALTA = 'alta'
}

/**
 * Interface para la estructura básica de una tarea
 */
export interface ITask {
  /** Título de la tarea (requerido) */
  title: string;
  /** Descripción detallada de la tarea */
  description?: string;
  /** Estado de completado de la tarea */
  completed: boolean;
  /** Nivel de prioridad de la tarea */
  priority: TaskPriority;
  /** Fecha límite para completar la tarea */
  dueDate?: Date | null;
  /** Fecha de creación de la tarea */
  createdAt: Date;
  /** Fecha de última actualización */
  updatedAt: Date;
}

/**
 * Interface para el documento de tarea en MongoDB
 * Extiende ITask y añade métodos de Mongoose
 */
export interface ITaskDocument extends ITask, Document {
  /** ID único del documento */
  _id: string;
}

/**
 * Interface para crear una nueva tarea
 * Omite campos auto-generados
 */
export interface ICreateTaskDTO {
  title: string;
  description?: string;
  completed?: boolean;
  priority?: TaskPriority;
  dueDate?: Date | null;
}

/**
 * Interface para actualizar una tarea existente
 * Todos los campos son opcionales
 */
export interface IUpdateTaskDTO {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: TaskPriority;
  dueDate?: Date | null;
}

/**
 * Interface para los filtros de consulta de tareas
 */
export interface ITaskQueryFilters {
  /** Filtrar por estado de completado */
  completed?: boolean;
  /** Filtrar por prioridad */
  priority?: TaskPriority;
  /** Campo por el cual ordenar */
  sortBy?: keyof ITask;
  /** Orden ascendente o descendente */
  order?: 'asc' | 'desc';
}

/**
 * Interface para la respuesta exitosa de la API
 */
export interface IApiResponse<T = any> {
  /** Indica si la operación fue exitosa */
  success: boolean;
  /** Mensaje descriptivo */
  message?: string;
  /** Datos de respuesta */
  data?: T;
  /** Número de elementos (para listas) */
  count?: number;
}

/**
 * Interface para respuestas de error de la API
 */
export interface IApiErrorResponse {
  /** Tipo de error */
  error: string;
  /** Mensaje descriptivo del error */
  message: string;
  /** Detalles específicos del error (para validaciones) */
  details?: Array<{
    field: string;
    message: string;
  }>;
}

/**
 * Interface para las requests de Express tipadas
 */
export interface ITypedRequest<TBody = any, TQuery = any> extends Omit<Request, 'body' | 'query'> {
  body: TBody;
  query: TQuery & ParsedQs;
}

/**
 * Interface para datos de usuario (para autenticación)
 */
export interface IUser {
  /** Nombre de usuario único */
  username: string;
  /** Email del usuario */
  email: string;
  /** Contraseña hasheada */
  password: string;
  /** Fecha de creación del usuario */
  createdAt: Date;
  /** Fecha de última actualización */
  updatedAt: Date;
}

/**
 * Interface para métodos de instancia del usuario
 */
export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

/**
 * Interface para métodos estáticos del modelo User
 */
export interface IUserModel {
  findByIdentifier(identifier: string): Promise<IUserDocument | null>;
  isUsernameTaken(username: string): Promise<boolean>;
  isEmailTaken(email: string): Promise<boolean>;
}

/**
 * Interface para el documento de usuario en MongoDB
 */
export interface IUserDocument extends IUser, Document, IUserMethods {}

/**
 * Interface para crear un nuevo usuario
 */
export interface ICreateUserDTO {
  username: string;
  email: string;
  password: string;
}

/**
 * Interface para login de usuario
 */
export interface ILoginUserDTO {
  username: string;
  password: string;
}

/**
 * Interface para el payload del JWT
 */
export interface IJWTPayload {
  /** ID del usuario */
  userId: string;
  /** Nombre de usuario */
  username: string;
  /** Timestamp de emisión */
  iat?: number;
  /** Timestamp de expiración */
  exp?: number;
}

/**
 * Interface para requests autenticadas
 */
export interface IAuthenticatedRequest extends Request {
  user?: IJWTPayload;
}

/**
 * Tipos para los parámetros de rutas
 */
export interface ITaskParamsDTO {
  id?: string;
}

/**
 * Configuración de la aplicación
 */
export interface IAppConfig {
  port: number;
  nodeEnv: string;
  mongodbUri: string;
  corsOrigin: string;
  jwtSecret: string;
  jwtExpiresIn: string;
}
