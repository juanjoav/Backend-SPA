# 📝 To-Do App - Backend API

Una aplicación web completa de gestión de tareas desarrollada con Node.js, Express y MongoDB.

## 🚀 Características

- ✅ API REST completa con endpoints CRUD
- 🔒 Validación robusta de datos con Joi
- 🗄️ Base de datos MongoDB con Mongoose
- 🌐 CORS habilitado para integración frontend
- 🐳 Docker Compose para despliegue fácil
- 📊 Interfaz de administración con Mongo Express

## 🛠️ Tecnologías Utilizadas

- **Backend**: Node.js + Express.js
- **Base de datos**: MongoDB + Mongoose
- **Validación**: Joi
- **CORS**: cors middleware
- **Contenedores**: Docker + Docker Compose
- **Variables de entorno**: dotenv

## 📋 Endpoints API

### Tareas (Tasks)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/tasks` | Obtener todas las tareas |
| `GET` | `/api/tasks/:id` | Obtener una tarea por ID |
| `POST` | `/api/tasks` | Crear nueva tarea |
| `PUT` | `/api/tasks/:id` | Actualizar tarea por ID |
| `DELETE` | `/api/tasks/:id` | Eliminar tarea por ID |

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
```

### 4. Iniciar MongoDB con Docker

```bash
docker-compose up -d
```

Este comando iniciará:
- MongoDB en el puerto 27017
- Mongo Express (interfaz web) en el puerto 8081

### 5. Iniciar el servidor

```bash
# Modo desarrollo (con nodemon)
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

## 🔧 Estructura del Proyecto

```
Backend/
├── src/
│   ├── controllers/
│   │   └── taskController.js
│   ├── models/
│   │   └── Task.js
│   ├── routes/
│   │   └── taskRoutes.js
│   ├── validators/
│   │   └── taskValidator.js
│   └── server.js
├── docker-compose.yml
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

- ✅ API REST completa implementada
- ✅ Validación de datos
- ✅ Base de datos MongoDB configurada
- ✅ CORS habilitado
- ✅ Docker Compose funcional
- ✅ Documentación completa

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.
