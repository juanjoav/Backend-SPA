const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const taskRoutes = require('./routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexión a MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/todoapp?authSource=admin';
    await mongoose.connect(mongoURI);
    console.log('✅ Conexión exitosa a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};

// Rutas
app.use('/api', taskRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Servidor To-Do App funcionando correctamente',
    version: '1.0.0',
    endpoints: {
      tasks: {
        'GET /api/tasks': 'Obtener todas las tareas',
        'POST /api/tasks': 'Crear nueva tarea',
        'PUT /api/tasks/:id': 'Actualizar tarea por ID',
        'DELETE /api/tasks/:id': 'Eliminar tarea por ID'
      }
    }
  });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    message: `La ruta ${req.originalUrl} no existe en este servidor`
  });
});

// Manejo de errores global
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Algo salió mal'
  });
});

// Iniciar servidor
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🌟 Servidor ejecutándose en http://localhost:${PORT}`);
    console.log(`📱 Mongo Express disponible en http://localhost:8081`);
  });
};

startServer();
