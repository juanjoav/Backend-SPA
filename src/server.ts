import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import taskRoutes from './routes/taskRoutes';
import authRoutes from './routes/authRoutes';
import { IApiResponse, IApiErrorResponse, IAppConfig } from './types';

// Configurar variables de entorno
dotenv.config();

/**
 * Configuración de la aplicación con valores por defecto
 */
const config: IAppConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/todoapp?authSource=admin',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d'
};

/**
 * Crear instancia de la aplicación Express
 */
const app = express();

/**
 * Configuración de middleware
 */

// CORS - Configuración para permitir requests desde el frontend
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parsing de JSON y URL-encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging de requests en desarrollo
if (config.nodeEnv === 'development') {
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

/**
 * Función para conectar a MongoDB con reintentos
 */
const connectDB = async (): Promise<void> => {
  const maxRetries = 5;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      await mongoose.connect(config.mongodbUri);
      console.log('✅ Conexión exitosa a MongoDB');
      
      // Configurar eventos de conexión
      mongoose.connection.on('error', (error) => {
        console.error('❌ Error de conexión a MongoDB:', error);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️  Conexión a MongoDB perdida');
      });

      mongoose.connection.on('reconnected', () => {
        console.log('🔄 Reconectado a MongoDB');
      });

      return;
    } catch (error) {
      retries++;
      console.error(`❌ Error conectando a MongoDB (intento ${retries}/${maxRetries}):`, 
        error instanceof Error ? error.message : error);
      
      if (retries === maxRetries) {
        console.error('💥 No se pudo conectar a MongoDB después de múltiples intentos');
        process.exit(1);
      }
      
      // Esperar antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

/**
 * Rutas de la aplicación
 */

// Ruta de salud/estado de la aplicación
app.get('/health', (req: Request, res: Response) => {
  const healthResponse: IApiResponse = {
    success: true,
    data: {
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      uptime: process.uptime()
    }
  };
  
  res.json(healthResponse);
});

// Ruta de información general de la API
app.get('/', (req: Request, res: Response) => {
  const welcomeResponse: IApiResponse = {
    success: true,
    data: {
      message: '🚀 Servidor To-Do App funcionando correctamente',
      version: '2.0.0',
      description: 'API REST para gestión de tareas con autenticación JWT',
      features: [
        'Autenticación JWT',
        'CRUD completo de tareas',
        'Validación con TypeScript',
        'Filtros y ordenamiento',
        'Estadísticas de tareas'
      ],
      endpoints: {
        auth: {
          'POST /api/auth/register': 'Registrar nuevo usuario',
          'POST /api/auth/login': 'Iniciar sesión',
          'GET /api/auth/profile': 'Obtener perfil de usuario',
          'GET /api/auth/verify': 'Verificar token JWT'
        },
        tasks: {
          'GET /api/tasks': 'Obtener todas las tareas (con filtros)',
          'GET /api/tasks/stats': 'Obtener estadísticas de tareas',
          'GET /api/tasks/:id': 'Obtener tarea por ID',
          'POST /api/tasks': 'Crear nueva tarea',
          'PUT /api/tasks/:id': 'Actualizar tarea por ID',
          'DELETE /api/tasks/:id': 'Eliminar tarea por ID'
        },
        utils: {
          'GET /health': 'Estado de salud de la aplicación',
          'GET /': 'Información general de la API'
        }
      },
      documentation: {
        postman: 'Importa la colección de Postman para probar la API',
        curl: 'Consulta curl-tests.md para comandos de prueba'
      }
    }
  };
  
  res.json(welcomeResponse);
});

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Rutas de tareas
app.use('/api', taskRoutes);

/**
 * Manejo de errores y rutas no encontradas
 */

// Middleware para rutas no encontradas (404)
app.use('*', (req: Request, res: Response) => {
  const errorResponse: IApiErrorResponse = {
    error: 'Ruta no encontrada',
    message: `La ruta ${req.method} ${req.originalUrl} no existe en este servidor`
  };
  
  res.status(404).json(errorResponse);
});

// Middleware global de manejo de errores
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('💥 Error no manejado:', error);
  
  // No enviar detalles del error en producción
  const errorResponse: IApiErrorResponse = {
    error: 'Error interno del servidor',
    message: config.nodeEnv === 'development' 
      ? error.message 
      : 'Algo salió mal en el servidor'
  };
  
  res.status(500).json(errorResponse);
});

/**
 * Función para iniciar el servidor
 */
const startServer = async (): Promise<void> => {
  try {
    // Conectar a la base de datos
    await connectDB();
    
    // Iniciar servidor HTTP
    const server = app.listen(config.port, () => {
      console.log('🌟 ===============================================');
      console.log(`🚀 Servidor ejecutándose en http://localhost:${config.port}`);
      console.log(`📱 Ambiente: ${config.nodeEnv}`);
      console.log('🗄️  Base de datos: MongoDB');
      console.log('🔐 Autenticación: JWT habilitada');
      
      if (config.nodeEnv === 'development') {
        console.log('📊 MongoDB Express: http://localhost:8081');
        console.log(`📋 Documentación API: http://localhost:${config.port}/`);
        console.log(`🏥 Health Check: http://localhost:${config.port}/health`);
      }
      
      console.log('🌟 ===============================================');
    });

    // Configurar manejo de señales de terminación
    const gracefulShutdown = (signal: string) => {
      console.log(`\n🛑 Recibida señal ${signal}. Cerrando servidor...`);
      
      server.close(async () => {
        console.log('🔌 Servidor HTTP cerrado');
        
        try {
          await mongoose.connection.close();
          console.log('🗄️  Conexión a MongoDB cerrada');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error al cerrar conexión a MongoDB:', error);
          process.exit(1);
        }
      });
    };

    // Registrar manejadores de señales
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
  } catch (error) {
    console.error('💥 Error al iniciar servidor:', error);
    process.exit(1);
  }
};

/**
 * Iniciar la aplicación
 */
if (require.main === module) {
  startServer();
}

export default app;
