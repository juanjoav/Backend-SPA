# 🚀 To-Do App - Backend API (Node.js + TypeScript)

Una API REST robusta para gestión de tareas desarrollada con Node.js, Express, TypeScript y MongoDB.

## 🏗️ Características

- ✅ **Node.js + Express** con TypeScript completo
- 🗄️ **MongoDB + Mongoose** con schemas tipados
- 🔐 **Autenticación JWT** segura con bcrypt
- ✅ **Validación robusta** con Joi
- 🧪 **Testing completo** con Jest + Supertest
- 📊 **Filtros avanzados** y consultas optimizadas
- 🔄 **Auto-documentación** de API integrada
- 🏥 **Health checks** y monitoreo
- 🛡️ **CORS** y seguridad configurados

## 🛠️ Stack Tecnológico

```json
{
  "dependencies": {
    "express": "^4.18.2",        // Framework web
    "mongoose": "^7.5.0",        // ODM para MongoDB
    "jsonwebtoken": "^9.0.2",    // Autenticación JWT
    "bcryptjs": "^2.4.3",        // Hash de contraseñas
    "joi": "^17.9.2",            // Validación de schemas
    "cors": "^2.8.5",            // Políticas CORS
    "dotenv": "^16.3.1"          // Variables de entorno
  },
  "devDependencies": {
    "typescript": "^5.2.2",      // Tipado estático
    "ts-node-dev": "^2.0.0",     // Desarrollo con hot-reload
    "jest": "^29.7.0",           // Framework de testing
    "supertest": "^6.3.3",       // Testing HTTP
    "@types/express": "^4.17.17" // Tipos TypeScript
  }
}
```

## 📋 API Endpoints

### 🔐 **Autenticación** (`/api/auth`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `POST` | `/register` | Registrar nuevo usuario | ❌ |
| `POST` | `/login` | Iniciar sesión | ❌ |
| `GET` | `/profile` | Obtener perfil del usuario | ✅ |
| `GET` | `/verify` | Verificar token JWT | ✅ |

### 📝 **Tareas** (`/api/tasks`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `GET` | `/` | Obtener todas las tareas (con filtros) | ✅ |
| `GET` | `/stats` | Obtener estadísticas de tareas | ✅ |
| `GET` | `/:id` | Obtener tarea por ID | ✅ |
| `POST` | `/` | Crear nueva tarea | ✅ |
| `PUT` | `/:id` | Actualizar tarea por ID | ✅ |
| `DELETE` | `/:id` | Eliminar tarea por ID | ✅ |

### 🔧 **Utilidades**

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `GET` | `/` | Documentación automática de la API | ❌ |
| `GET` | `/health` | Estado de salud del servidor | ❌ |

## 🗄️ Modelos de Datos

### **Task Schema**
```typescript
interface ITask {
  title: string           // Título (requerido, max 100 chars)
  description?: string    // Descripción (opcional, max 500 chars)
  completed: boolean      // Estado completado (default: false)
  priority: 'baja' | 'media' | 'alta'  // Prioridad (default: 'media')
  dueDate?: Date          // Fecha límite (opcional)
  createdAt: Date         // Fecha de creación (auto)
  updatedAt: Date         // Fecha de actualización (auto)
}
```

### **User Schema**
```typescript
interface IUser {
  username: string        // Nombre único (3-30 chars, alphanumeric + _)
  email: string           // Email válido (único)
  password: string        // Hash bcrypt (6-128 chars original)
  createdAt: Date         // Fecha de registro (auto)
  updatedAt: Date         // Fecha de actualización (auto)
}
```

## 🔍 Filtros y Consultas

### **Filtros Disponibles**
```bash
# Por estado de completado
GET /api/tasks?completed=true
GET /api/tasks?completed=false

# Por prioridad
GET /api/tasks?priority=alta
GET /api/tasks?priority=media
GET /api/tasks?priority=baja

# Ordenamiento
GET /api/tasks?sortBy=createdAt&order=desc    # Más recientes
GET /api/tasks?sortBy=title&order=asc         # Alfabético A-Z
GET /api/tasks?sortBy=priority&order=desc     # Prioridad alta primero
GET /api/tasks?sortBy=dueDate&order=asc       # Vencimiento próximo

# Combinaciones
GET /api/tasks?completed=false&priority=alta&sortBy=dueDate&order=asc
```

### **Estadísticas**
```bash
# Obtener métricas completas
GET /api/tasks/stats

# Respuesta ejemplo:
{
  "success": true,
  "data": {
    "total": 25,
    "completed": 15,
    "pending": 10,
    "byPriority": {
      "alta": 5,
      "media": 12,
      "baja": 8
    }
  }
}
```

## 🚀 Instalación y Configuración

### **Prerrequisitos**
- Node.js 18+
- MongoDB 5+
- npm o yarn

### **1. Instalar dependencias**
```bash
npm install
```

### **2. Configurar variables de entorno**
Copia y configura el archivo de entorno:
```bash
cp config.example.env .env
```

```env
# Configuración del servidor
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://admin:password123@localhost:27017/todoapp?authSource=admin

# CORS
CORS_ORIGIN=http://localhost:3000

# JWT
JWT_SECRET=mi-super-secreto-jwt-para-desarrollo
JWT_EXPIRES_IN=7d
```

### **3. Iniciar MongoDB**
```bash
# Con Docker Compose (recomendado)
docker-compose up -d

# O MongoDB local
mongod --dbpath /data/db
```

### **4. Ejecutar en desarrollo**
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

### **5. Comandos disponibles**
```bash
# Desarrollo
npm run dev          # Servidor con hot-reload
npm run build        # Compilar TypeScript
npm run start        # Servidor de producción

# Testing
npm run test         # Ejecutar tests
npm run test:watch   # Tests en modo watch
npm run test:coverage # Cobertura de tests

# Linting
npm run lint         # Verificar código
npm run lint:fix     # Corregir automáticamente
```

## 🧪 Testing

### **Estrategia de Testing**
- ✅ **Unit Tests**: Modelos y controladores
- ✅ **Integration Tests**: Rutas de API
- ✅ **Validation Tests**: Schemas de Joi
- ✅ **Auth Tests**: JWT y middleware

### **Ejecutar Tests**
```bash
# Tests básicos
npm test

# Tests con watch
npm run test:watch

# Cobertura completa
npm run test:coverage
```

### **Estructura de Tests**
```
src/tests/
├── models/
│   ├── Task.test.ts         # Tests del modelo Task
│   └── User.test.ts         # Tests del modelo User
├── controllers/
│   ├── authController.test.ts    # Tests de autenticación
│   └── taskController.test.ts    # Tests de tareas
└── setup.ts                 # Configuración de tests
```

## 🔐 Autenticación y Seguridad

### **JWT Implementation**
```typescript
// Generar token
const token = jwt.sign(
  { userId: user._id, username: user.username },
  JWT_SECRET,
  { expiresIn: JWT_EXPIRES_IN }
)

// Middleware de autenticación
export const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.substring(7) // "Bearer TOKEN"
  
  if (!token) {
    return res.status(401).json({ error: 'Token requerido' })
  }
  
  jwt.verify(token, JWT_SECRET, (error, decoded) => {
    if (error) return res.status(401).json({ error: 'Token inválido' })
    req.user = decoded
    next()
  })
}
```

### **Seguridad Implementada**
- ✅ **Password Hashing**: bcrypt con salt
- ✅ **JWT Tokens**: Autenticación stateless
- ✅ **Input Validation**: Schemas Joi estrictos
- ✅ **CORS Protection**: Orígenes configurables
- ✅ **Error Handling**: No exposición de datos sensibles

## 📊 Monitoreo y Logs

### **Health Check**
```bash
# Verificar estado del servidor
curl http://localhost:3000/health

# Respuesta:
{
  "success": true,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "database": "connected"
}
```

### **Auto-documentación**
```bash
# Información completa de la API
curl http://localhost:3000/

# Incluye:
# - Lista de endpoints disponibles
# - Versión de la API
# - Características implementadas
# - Links a documentación
```

## 🧪 Testing con cURL

Para testing manual completo, consulta:
- **`curl-tests.md`**: 400+ líneas de comandos de prueba
- Incluye todos los endpoints
- Casos de error y validación
- Scripts automatizados

## 🗄️ Base de Datos

### **Conexión MongoDB**
```typescript
// Configuración optimizada
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

// Índices para performance
taskSchema.index({ completed: 1 })
taskSchema.index({ priority: 1 })
taskSchema.index({ dueDate: 1 })
taskSchema.index({ createdAt: -1 })
```

### **Middleware Mongoose**
```typescript
// Auto-actualización de timestamps
taskSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

taskSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() })
  next()
})
```

## 🚀 Deployment

### **Build de Producción**
```bash
# Compilar TypeScript
npm run build

# Archivos generados en /dist
npm start
```

### **Docker Support**
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./dist/
EXPOSE 3000

CMD ["npm", "start"]
```

## ⚡ Performance

### **Optimizaciones Implementadas**
- ✅ **Índices MongoDB**: Queries optimizados
- ✅ **Async/Await**: Manejo eficiente de promesas
- ✅ **Error Handling**: Middleware centralizado
- ✅ **Validation**: Joi con early exit
- ✅ **Lean Queries**: Objetos planos cuando es posible

## 📈 Escalabilidad

### **Preparado para:**
- **Horizontal Scaling**: Múltiples instancias
- **Load Balancing**: Sin estado en memoria
- **Microservices**: Servicios separables
- **Caching**: Redis para sesiones frecuentes
- **Database Sharding**: Partición por usuario

## ✅ Estado del Proyecto

- ✅ **API completa**: Todos los endpoints funcionales
- ✅ **Autenticación**: JWT seguro implementado
- ✅ **Validación**: Schemas robustos
- ✅ **Testing**: Cobertura completa
- ✅ **Documentación**: Auto-generada y manual
- ✅ **Production Ready**: Configuración optimizada

---

## 🎯 Resultado Final

Una API REST completa y robusta que proporciona:

1. **🔐 Autenticación segura** con JWT y bcrypt
2. **📝 CRUD completo** de tareas con filtros avanzados  
3. **✅ Validación robusta** en todos los endpoints
4. **🧪 Testing comprehensivo** con alta cobertura
5. **📊 Monitoreo integrado** con health checks
6. **🚀 Production ready** con configuración optimizada

¡El backend está completamente funcional y listo para producción! 🎉