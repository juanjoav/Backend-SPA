# 📝 To-Do App - Backend API (TypeScript)

Una aplicación web completa de gestión de tareas desarrollada con Node.js, Express, TypeScript y MongoDB. Incluye autenticación JWT, validación robusta y testing completo.

## 🚀 Características

- ✅ **API REST completa** con endpoints CRUD
- 🔐 **Autenticación JWT** con registro y login
- 🛡️ **TypeScript** con tipado completo y estricto
- 🔒 **Validación robusta** de datos con Joi
- 🗄️ **Base de datos MongoDB** con Mongoose
- 🌐 **CORS** habilitado para integración frontend
- 🧪 **Testing completo** con Jest y Supertest
- 📊 **Estadísticas de tareas** y filtros avanzados
- 🐳 **Docker Compose** para despliegue fácil
- 📝 **Documentación completa** con JSDoc/TSDoc
- 🔍 **Linting** con ESLint y reglas TypeScript

## 🛠️ Tecnologías Utilizadas

- **Backend**: Node.js + Express.js + TypeScript
- **Base de datos**: MongoDB + Mongoose
- **Autenticación**: JWT + bcryptjs
- **Validación**: Joi con schemas tipados
- **Testing**: Jest + Supertest + MongoDB Memory Server
- **Linting**: ESLint + TypeScript ESLint
- **Contenedores**: Docker + Docker Compose
- **Variables de entorno**: dotenv

## 📋 Endpoints API

### 🔐 Autenticación

| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|---------|
| `POST` | `/api/auth/register` | Registrar nuevo usuario | Público |
| `POST` | `/api/auth/login` | Iniciar sesión | Público |
| `GET` | `/api/auth/profile` | Obtener perfil del usuario | Privado |
| `GET` | `/api/auth/verify` | Verificar token JWT | Privado |

### 📋 Tareas (Tasks)

| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|---------|
| `GET` | `/api/tasks` | Obtener todas las tareas | Privado |
| `GET` | `/api/tasks/stats` | Obtener estadísticas | Privado |
| `GET` | `/api/tasks/:id` | Obtener una tarea por ID | Privado |
| `POST` | `/api/tasks` | Crear nueva tarea | Privado |
| `PUT` | `/api/tasks/:id` | Actualizar tarea por ID | Privado |
| `DELETE` | `/api/tasks/:id` | Eliminar tarea por ID | Privado |

### Parámetros de Query (GET /api/tasks)

- `completed`: Filtrar por estado (true/false)
- `priority`: Filtrar por prioridad (baja/media/alta)
- `sortBy`: Ordenar por campo (createdAt, title, priority, dueDate)
- `order`: Orden (asc/desc)

## 🗃️ Modelo de Datos

```javascript
{
  "_id": "ObjectId",
  "title": "String (requerido, máx 100 caracteres)",
  "description": "String (opcional, máx 500 caracteres)",
  "completed": "Boolean (default: false)",
  "priority": "String (baja/media/alta, default: media)",
  "dueDate": "Date (opcional)",
  "createdAt": "Date (automático)",
  "updatedAt": "Date (automático)"
}
```

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js (v16 o superior)
- Docker y Docker Compose
- npm o yarn

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd Backend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Configuración del servidor
PORT=3000
NODE_ENV=development

# Configuración de MongoDB
MONGODB_URI=mongodb://admin:password123@localhost:27017/todoapp?authSource=admin

# Configuración de CORS
CORS_ORIGIN=http://localhost:3000

# Configuración JWT
JWT_SECRET=tu-super-secreto-para-jwt-en-produccion-cambiar
JWT_EXPIRES_IN=7d
```

### 4. Iniciar MongoDB con Docker

```bash
docker-compose up -d
```

Este comando iniciará MongoDB en el puerto 27017.

### 5. Compilar y ejecutar el servidor

```bash
# Compilar TypeScript
npm run build

# Modo desarrollo (con hot reload)
npm run dev

# Modo producción
npm start
```

El servidor estará disponible en `http://localhost:3000`

## 🐳 Docker Compose

El archivo `docker-compose.yml` incluye:

- **MongoDB**: Base de datos principal
- **Mongo Express**: Interfaz web para administrar MongoDB

### Comandos útiles:

```bash
# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down

# Eliminar volúmenes (¡CUIDADO! Se perderán los datos)
docker-compose down -v
```

## 📊 Acceso a Mongo Express

Una vez que Docker Compose esté ejecutándose, puedes acceder a Mongo Express en:
`http://localhost:8081`

## 🧪 Ejemplos de Uso

### Crear una nueva tarea

```bash
curl -X POST http://localhost:3000/api/tasks \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Completar proyecto",
    "description": "Finalizar la aplicación To-Do",
    "priority": "alta",
    "dueDate": "2024-12-31T23:59:59.000Z"
  }'
```

### Obtener todas las tareas

```bash
curl http://localhost:3000/api/tasks
```

### Obtener tareas filtradas

```bash
# Tareas completadas
curl "http://localhost:3000/api/tasks?completed=true"

# Tareas de alta prioridad
curl "http://localhost:3000/api/tasks?priority=alta"

# Tareas ordenadas por fecha de vencimiento
curl "http://localhost:3000/api/tasks?sortBy=dueDate&order=asc"
```

### Actualizar una tarea

```bash
curl -X PUT http://localhost:3000/api/tasks/TASK_ID \\
  -H "Content-Type: application/json" \\
  -d '{
    "completed": true
  }'
```

### Eliminar una tarea

```bash
curl -X DELETE http://localhost:3000/api/tasks/TASK_ID
```

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Generar reporte de cobertura
npm run test:coverage

# Linting del código
npm run lint

# Corregir errores de linting automáticamente
npm run lint:fix
```

## 🔧 Estructura del Proyecto

```
Backend/
├── src/
│   ├── controllers/           # Lógica de negocio
│   │   ├── taskController.ts
│   │   └── authController.ts
│   ├── models/               # Modelos de MongoDB
│   │   ├── Task.ts
│   │   └── User.ts
│   ├── routes/               # Definición de rutas
│   │   ├── taskRoutes.ts
│   │   └── authRoutes.ts
│   ├── validators/           # Esquemas de validación
│   │   ├── taskValidator.ts
│   │   └── userValidator.ts
│   ├── middleware/           # Middleware personalizado
│   │   └── auth.ts
│   ├── types/               # Tipos e interfaces TypeScript
│   │   └── index.ts
│   ├── tests/               # Tests unitarios e integración
│   │   ├── setup.ts
│   │   ├── models/
│   │   └── controllers/
│   └── server.ts            # Punto de entrada principal
├── dist/                    # Código compilado (generado)
├── coverage/                # Reportes de cobertura (generado)
├── docker-compose.yml       # Configuración Docker
├── tsconfig.json           # Configuración TypeScript
├── jest.config.js          # Configuración Jest
├── .eslintrc.js           # Configuración ESLint
├── package.json
├── .gitignore
└── README.md
```

## 🔒 Validaciones

La aplicación incluye validaciones robustas:

- **Title**: Requerido, 1-100 caracteres
- **Description**: Opcional, máximo 500 caracteres
- **Priority**: Solo valores válidos (baja/media/alta)
- **DueDate**: Formato ISO válido
- **ID**: Validación de ObjectId de MongoDB

## 🚨 Manejo de Errores

La API devuelve respuestas consistentes para todos los errores:

```javascript
{
  "error": "Tipo de error",
  "message": "Descripción del error",
  "details": [ // Solo para errores de validación
    {
      "field": "campo",
      "message": "mensaje específico"
    }
  ]
}
```

## 📈 Estado del Proyecto

- ✅ **TypeScript** - Migración completa con tipado estricto
- ✅ **API REST** - Endpoints completos implementados
- ✅ **Autenticación JWT** - Registro, login y protección de rutas
- ✅ **Validación** - Schemas robustos con Joi y TypeScript
- ✅ **Base de datos** - MongoDB configurada con Mongoose
- ✅ **Testing** - Tests unitarios e integración completos
- ✅ **Linting** - ESLint con reglas TypeScript
- ✅ **CORS** - Configurado para frontend
- ✅ **Docker** - Compose funcional para MongoDB
- ✅ **Documentación** - Completa con ejemplos y tipos

## 🎯 Cobertura de Requisitos

### ✅ TypeScript
- **Tipado correcto en backend**: Interfaces, tipos y enums completos
- **Configuración estricta**: tsconfig.json con reglas estrictas
- **Validación en tiempo de compilación**: Sin errores TypeScript

### ✅ Código Limpio
- **Nombres descriptivos**: Variables, funciones y clases bien nombradas
- **Organización**: Estructura modular y separación de responsabilidades
- **Comentarios JSDoc/TSDoc**: Documentación completa en código
- **Linting**: ESLint configurado con reglas TypeScript

### ✅ API REST
- **Endpoints estructurados**: Rutas organizadas y RESTful
- **Control de errores**: Manejo robusto con tipos específicos
- **Validaciones**: Joi con schemas tipados
- **Middleware**: Autenticación, validación y manejo de errores

### ✅ Persistencia
- **MongoDB**: Base de datos configurada
- **Mongoose**: ODM con schemas tipados
- **Queries**: Operaciones CRUD optimizadas
- **Índices**: Para mejorar rendimiento

### ✅ Extra
- **Autenticación JWT**: Sistema completo de usuarios
- **Tests**: Unitarios e integración con Jest
- **Cobertura**: Tests para modelos y controladores
- **CI/CD Ready**: Configuración para pipelines

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.
