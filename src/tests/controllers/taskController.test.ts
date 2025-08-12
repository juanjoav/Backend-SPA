/**
 * Tests de integración para el controlador de tareas
 */

import request from 'supertest';
import app from '../../server';
import Task from '../../models/Task';
import User from '../../models/User';
import jwt from 'jsonwebtoken';
import { TaskPriority } from '../../types';

describe('Task Controller', () => {
  let authToken: string;
  let userId: string;

  // Crear usuario y token de prueba antes de cada test
  beforeEach(async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };

    const user = new User(userData);
    const savedUser = await user.save();
    userId = savedUser._id.toString();

    // Generar token JWT
    authToken = jwt.sign(
      { userId: savedUser._id, username: savedUser.username },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  describe('GET /api/tasks', () => {
    it('debería obtener lista vacía de tareas', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(0);
      expect(response.body.data).toEqual([]);
    });

    it('debería obtener todas las tareas', async () => {
      // Crear tareas de prueba
      await Task.create([
        { title: 'Tarea 1', priority: TaskPriority.ALTA },
        { title: 'Tarea 2', priority: TaskPriority.MEDIA, completed: true }
      ]);

      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(response.body.data).toHaveLength(2);
    });

    it('debería filtrar tareas por estado completado', async () => {
      await Task.create([
        { title: 'Tarea 1', completed: false },
        { title: 'Tarea 2', completed: true }
      ]);

      const response = await request(app)
        .get('/api/tasks?completed=true')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.count).toBe(1);
      expect(response.body.data[0].title).toBe('Tarea 2');
      expect(response.body.data[0].completed).toBe(true);
    });

    it('debería filtrar tareas por prioridad', async () => {
      await Task.create([
        { title: 'Tarea 1', priority: TaskPriority.ALTA },
        { title: 'Tarea 2', priority: TaskPriority.BAJA }
      ]);

      const response = await request(app)
        .get('/api/tasks?priority=alta')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.count).toBe(1);
      expect(response.body.data[0].priority).toBe(TaskPriority.ALTA);
    });

    it('debería fallar sin token de autenticación', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .expect(401);

      expect(response.body.error).toBe('Token requerido');
    });
  });

  describe('POST /api/tasks', () => {
    it('debería crear una nueva tarea', async () => {
      const taskData = {
        title: 'Nueva tarea',
        description: 'Descripción de la tarea',
        priority: TaskPriority.ALTA
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Tarea creada exitosamente');
      expect(response.body.data.title).toBe(taskData.title);
      expect(response.body.data.description).toBe(taskData.description);
      expect(response.body.data.priority).toBe(taskData.priority);
      expect(response.body.data.completed).toBe(false);
    });

    it('debería fallar con título vacío', async () => {
      const taskData = {
        title: '',
        description: 'Descripción'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(400);

      expect(response.body.error).toBe('Datos de entrada inválidos');
      expect(response.body.details).toBeDefined();
    });

    it('debería fallar con prioridad inválida', async () => {
      const taskData = {
        title: 'Tarea válida',
        priority: 'super-alta'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(400);

      expect(response.body.error).toBe('Datos de entrada inválidos');
    });
  });

  describe('GET /api/tasks/:id', () => {
    let taskId: string;

    beforeEach(async () => {
      const task = await Task.create({ title: 'Tarea de prueba' });
      taskId = task._id.toString();
    });

    it('debería obtener una tarea por ID', async () => {
      const response = await request(app)
        .get(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(taskId);
      expect(response.body.data.title).toBe('Tarea de prueba');
    });

    it('debería fallar con ID inválido', async () => {
      const response = await request(app)
        .get('/api/tasks/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.error).toBe('ID inválido');
    });

    it('debería fallar con ID que no existe', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .get(`/api/tasks/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toBe('Tarea no encontrada');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    let taskId: string;

    beforeEach(async () => {
      const task = await Task.create({ 
        title: 'Tarea original',
        completed: false 
      });
      taskId = task._id.toString();
    });

    it('debería actualizar una tarea', async () => {
      const updateData = {
        title: 'Tarea actualizada',
        completed: true
      };

      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updateData.title);
      expect(response.body.data.completed).toBe(updateData.completed);
    });

    it('debería fallar sin campos para actualizar', async () => {
      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.error).toBe('Datos de entrada inválidos');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    let taskId: string;

    beforeEach(async () => {
      const task = await Task.create({ title: 'Tarea a eliminar' });
      taskId = task._id.toString();
    });

    it('debería eliminar una tarea', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Tarea eliminada exitosamente');

      // Verificar que la tarea fue eliminada
      const deletedTask = await Task.findById(taskId);
      expect(deletedTask).toBeNull();
    });

    it('debería fallar con ID que no existe', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .delete(`/api/tasks/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toBe('Tarea no encontrada');
    });
  });

  describe('GET /api/tasks/stats', () => {
    beforeEach(async () => {
      const yesterday = new Date(Date.now() - 86400000);
      
      await Task.create([
        { title: 'Tarea 1', completed: true, priority: TaskPriority.ALTA },
        { title: 'Tarea 2', completed: false, priority: TaskPriority.ALTA },
        { title: 'Tarea 3', completed: false, priority: TaskPriority.MEDIA, dueDate: yesterday }
      ]);
    });

    it('debería obtener estadísticas de tareas', async () => {
      const response = await request(app)
        .get('/api/tasks/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalTasks).toBe(3);
      expect(response.body.data.completedTasks).toBe(1);
      expect(response.body.data.pendingTasks).toBe(2);
      expect(response.body.data.highPriorityTasks).toBe(2);
      expect(response.body.data.overdueTasks).toBe(1);
      expect(response.body.data.completionPercentage).toBe(33);
    });
  });
});
