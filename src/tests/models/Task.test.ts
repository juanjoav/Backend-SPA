/**
 * Tests unitarios para el modelo Task
 */

import Task from '../../models/Task';
import { TaskPriority } from '../../types';

describe('Task Model', () => {
  describe('Validaciones', () => {
    it('debería crear una tarea válida con campos mínimos', async () => {
      const taskData = {
        title: 'Tarea de prueba'
      };

      const task = new Task(taskData);
      const savedTask = await task.save();

      expect(savedTask._id).toBeDefined();
      expect(savedTask.title).toBe('Tarea de prueba');
      expect(savedTask.description).toBe('');
      expect(savedTask.completed).toBe(false);
      expect(savedTask.priority).toBe(TaskPriority.MEDIA);
      expect(savedTask.dueDate).toBeNull();
      expect(savedTask.createdAt).toBeInstanceOf(Date);
      expect(savedTask.updatedAt).toBeInstanceOf(Date);
    });

    it('debería crear una tarea con todos los campos', async () => {
      const dueDate = new Date('2024-12-31');
      const taskData = {
        title: 'Tarea completa',
        description: 'Descripción detallada',
        completed: true,
        priority: TaskPriority.ALTA,
        dueDate
      };

      const task = new Task(taskData);
      const savedTask = await task.save();

      expect(savedTask.title).toBe('Tarea completa');
      expect(savedTask.description).toBe('Descripción detallada');
      expect(savedTask.completed).toBe(true);
      expect(savedTask.priority).toBe(TaskPriority.ALTA);
      expect(savedTask.dueDate).toEqual(dueDate);
    });

    it('debería fallar si no se proporciona título', async () => {
      const taskData = {
        description: 'Tarea sin título'
      };

      const task = new Task(taskData);
      
      await expect(task.save()).rejects.toThrow('El título es obligatorio');
    });

    it('debería fallar si el título excede 100 caracteres', async () => {
      const longTitle = 'a'.repeat(101);
      const taskData = {
        title: longTitle
      };

      const task = new Task(taskData);
      
      await expect(task.save()).rejects.toThrow('El título no puede exceder 100 caracteres');
    });

    it('debería fallar si la descripción excede 500 caracteres', async () => {
      const longDescription = 'a'.repeat(501);
      const taskData = {
        title: 'Tarea válida',
        description: longDescription
      };

      const task = new Task(taskData);
      
      await expect(task.save()).rejects.toThrow('La descripción no puede exceder 500 caracteres');
    });

    it('debería fallar con prioridad inválida', async () => {
      const taskData = {
        title: 'Tarea válida',
        priority: 'super-alta' as any
      };

      const task = new Task(taskData);
      
      await expect(task.save()).rejects.toThrow();
    });
  });

  describe('Middleware', () => {
    it('debería actualizar updatedAt al guardar', async () => {
      const task = new Task({ title: 'Test Task' });
      const savedTask = await task.save();
      
      const originalUpdatedAt = savedTask.updatedAt;
      
      // Esperar un momento para asegurar diferencia en timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
      
      savedTask.title = 'Updated Task';
      const updatedTask = await savedTask.save();
      
      expect(updatedTask.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('debería actualizar updatedAt en findOneAndUpdate', async () => {
      const task = new Task({ title: 'Test Task' });
      const savedTask = await task.save();
      
      const originalUpdatedAt = savedTask.updatedAt;
      
      // Esperar un momento
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const updatedTask = await Task.findByIdAndUpdate(
        savedTask._id,
        { title: 'Updated via findOneAndUpdate' },
        { new: true }
      );
      
      expect(updatedTask?.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('Métodos de instancia', () => {
    let task: any;

    beforeEach(async () => {
      task = new Task({
        title: 'Test Task',
        dueDate: new Date(Date.now() + 86400000) // Mañana
      });
      await task.save();
    });

    it('debería marcar tarea como completada', async () => {
      expect(task.completed).toBe(false);
      
      await task.markAsCompleted();
      
      expect(task.completed).toBe(true);
    });

    it('debería marcar tarea como pendiente', async () => {
      task.completed = true;
      await task.save();
      
      await task.markAsPending();
      
      expect(task.completed).toBe(false);
    });

    it('debería detectar tarea vencida', async () => {
      // Tarea con fecha en el pasado
      task.dueDate = new Date(Date.now() - 86400000); // Ayer
      task.completed = false;
      
      expect(task.isOverdue()).toBe(true);
    });

    it('no debería detectar como vencida una tarea completada', async () => {
      task.dueDate = new Date(Date.now() - 86400000); // Ayer
      task.completed = true;
      
      expect(task.isOverdue()).toBe(false);
    });

    it('no debería detectar como vencida una tarea sin fecha límite', async () => {
      task.dueDate = null;
      task.completed = false;
      
      expect(task.isOverdue()).toBe(false);
    });
  });

  describe('Métodos estáticos', () => {
    beforeEach(async () => {
      // Crear tareas de prueba
      await Task.create([
        { title: 'Tarea 1', priority: TaskPriority.ALTA, completed: false },
        { title: 'Tarea 2', priority: TaskPriority.MEDIA, completed: true },
        { title: 'Tarea 3', priority: TaskPriority.BAJA, completed: false }
      ]);
    });

    it('debería encontrar tareas por prioridad', async () => {
      const highPriorityTasks = await (Task as any).findByPriority(TaskPriority.ALTA);
      
      expect(highPriorityTasks).toHaveLength(1);
      expect(highPriorityTasks[0].title).toBe('Tarea 1');
    });

    it('debería encontrar tareas completadas', async () => {
      const completedTasks = await (Task as any).findCompleted();
      
      expect(completedTasks).toHaveLength(1);
      expect(completedTasks[0].title).toBe('Tarea 2');
    });

    it('debería encontrar tareas pendientes', async () => {
      const pendingTasks = await (Task as any).findPending();
      
      expect(pendingTasks).toHaveLength(2);
      expect(pendingTasks.map((t: any) => t.title)).toContain('Tarea 1');
      expect(pendingTasks.map((t: any) => t.title)).toContain('Tarea 3');
    });
  });
});
