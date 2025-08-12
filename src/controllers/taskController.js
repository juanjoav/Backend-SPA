const Task = require('../models/Task');
const mongoose = require('mongoose');


const getAllTasks = async (req, res) => {
  try {
    const { completed, priority, sortBy = 'createdAt', order = 'desc' } = req.query;
    
    const filters = {};
    if (completed !== undefined) {
      filters.completed = completed === 'true';
    }
    if (priority) {
      filters.priority = priority;
    }
    
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions = { [sortBy]: sortOrder };
    
    const tasks = await Task.find(filters).sort(sortOptions);
    
    res.json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener las tareas'
    });
  }
};

const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'ID inválido',
        message: 'El ID proporcionado no es válido'
      });
    }
    
    const task = await Task.findById(id);
    
    if (!task) {
      return res.status(404).json({
        error: 'Tarea no encontrada',
        message: 'No existe una tarea con el ID proporcionado'
      });
    }
    
    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Error al obtener tarea:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo obtener la tarea'
    });
  }
};

const createTask = async (req, res) => {
  try {
    const task = new Task(req.body);
    const savedTask = await task.save();
    
    res.status(201).json({
      success: true,
      message: 'Tarea creada exitosamente',
      data: savedTask
    });
  } catch (error) {
    console.error('Error al crear tarea:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        error: 'Datos de entrada inválidos',
        details: validationErrors
      });
    }
    
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo crear la tarea'
    });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'ID inválido',
        message: 'El ID proporcionado no es válido'
      });
    }
    
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      req.body,
      { 
        new: true, 
        runValidators: true 
      }
    );
    
    if (!updatedTask) {
      return res.status(404).json({
        error: 'Tarea no encontrada',
        message: 'No existe una tarea con el ID proporcionado'
      });
    }
    
    res.json({
      success: true,
      message: 'Tarea actualizada exitosamente',
      data: updatedTask
    });
  } catch (error) {
    console.error('Error al actualizar tarea:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        error: 'Datos de entrada inválidos',
        details: validationErrors
      });
    }
    
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo actualizar la tarea'
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'ID inválido',
        message: 'El ID proporcionado no es válido'
      });
    }
    
    const deletedTask = await Task.findByIdAndDelete(id);
    
    if (!deletedTask) {
      return res.status(404).json({
        error: 'Tarea no encontrada',
        message: 'No existe una tarea con el ID proporcionado'
      });
    }
    
    res.json({
      success: true,
      message: 'Tarea eliminada exitosamente',
      data: deletedTask
    });
  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo eliminar la tarea'
    });
  }
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};
