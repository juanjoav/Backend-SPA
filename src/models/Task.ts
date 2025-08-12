import mongoose, { Schema, Model } from 'mongoose';
import { ITaskDocument, TaskPriority } from '../types';

/**
 * Schema de Mongoose para las tareas
 * Define la estructura y validaciones de los documentos de tarea en MongoDB
 */
const taskSchema: Schema<ITaskDocument> = new Schema({
  title: {
    type: String,
    required: [true, 'El título es obligatorio'],
    trim: true,
    maxlength: [100, 'El título no puede exceder 100 caracteres']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres'],
    default: ''
  },
  completed: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: Object.values(TaskPriority),
    default: TaskPriority.MEDIA
  },
  dueDate: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Middleware pre-save: actualiza el campo updatedAt antes de guardar
 */
taskSchema.pre<ITaskDocument>('save', function(next) {
  this.updatedAt = new Date();
  next();
});

/**
 * Middleware pre-findOneAndUpdate: actualiza el campo updatedAt en actualizaciones
 */
taskSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

/**
 * Índices para mejorar el rendimiento de las consultas
 */
taskSchema.index({ completed: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ createdAt: -1 });

/**
 * Métodos estáticos del modelo
 */
taskSchema.statics = {
  /**
   * Buscar tareas por prioridad
   */
  findByPriority(priority: TaskPriority) {
    return this.find({ priority });
  },

  /**
   * Buscar tareas completadas
   */
  findCompleted() {
    return this.find({ completed: true });
  },

  /**
   * Buscar tareas pendientes
   */
  findPending() {
    return this.find({ completed: false });
  }
};

/**
 * Métodos de instancia del documento
 */
taskSchema.methods = {
  /**
   * Marcar tarea como completada
   */
  markAsCompleted() {
    this.completed = true;
    this.updatedAt = new Date();
    return this.save();
  },

  /**
   * Marcar tarea como pendiente
   */
  markAsPending() {
    this.completed = false;
    this.updatedAt = new Date();
    return this.save();
  },

  /**
   * Verificar si la tarea está vencida
   */
  isOverdue(): boolean {
    if (!this.dueDate) return false;
    return new Date() > this.dueDate && !this.completed;
  }
};

/**
 * Modelo de tarea con tipado completo de TypeScript
 */
const Task: Model<ITaskDocument> = mongoose.model<ITaskDocument>('Task', taskSchema);

export default Task;
