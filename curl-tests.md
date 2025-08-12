# 🧪 Comandos cURL para probar la API To-Do (TypeScript + JWT)

Esta guía contiene todos los comandos cURL necesarios para probar completamente la API del backend con autenticación JWT.

## 📋 **Prerequisitos**
- El servidor debe estar ejecutándose en `http://localhost:3000`
- MongoDB debe estar activo (`docker-compose up -d`)
- Para las rutas protegidas necesitarás un token JWT válido

---

## 🏠 **1. Verificar que el servidor esté funcionando**

```bash
curl -X GET http://localhost:3000/
```

**Respuesta esperada:** Información general de la API con endpoints disponibles.

---

## 🔐 **2. Autenticación**

### **2.1 Registrar nuevo usuario**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### **2.2 Iniciar sesión**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "password123"
  }'
```

**Importante:** Guarda el `token` de la respuesta para usar en las siguientes peticiones.

### **2.3 Obtener perfil del usuario**

```bash
# Reemplaza YOUR_JWT_TOKEN con el token obtenido en login
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **2.4 Verificar token**

```bash
curl -X GET http://localhost:3000/api/auth/verify \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📝 **3. Gestión de Tareas** (⚠️ Requiere Autenticación)

### **3.1 Obtener todas las tareas (GET /api/tasks)**

```bash
# Obtener todas las tareas (REQUIERE TOKEN)
curl -X GET http://localhost:3000/api/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

```bash
# Obtener tareas con formato bonito (opcional)
curl -X GET http://localhost:3000/api/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" | jq
```

### **3.2 Obtener estadísticas de tareas**

```bash
curl -X GET http://localhost:3000/api/tasks/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **3.3 Crear nuevas tareas (POST /api/tasks)**

```bash
# Crear tarea básica
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Mi primera tarea",
    "description": "Descripción de la tarea"
  }'
```

```bash
# Crear tarea completa con todos los campos
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tarea completa",
    "description": "Esta es una tarea con todos los campos",
    "priority": "alta",
    "completed": false,
    "dueDate": "2024-12-31T23:59:59.000Z"
  }'
```

```bash
# Crear tarea de alta prioridad
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tarea urgente",
    "description": "Esta tarea es muy importante",
    "priority": "alta"
  }'
```

```bash
# Crear tarea con fecha de vencimiento
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Reunión del lunes",
    "description": "Preparar presentación para la reunión",
    "priority": "media",
    "dueDate": "2024-01-15T09:00:00.000Z"
  }'
```

### **2.3 Obtener una tarea específica (GET /api/tasks/:id)**

```bash
# Reemplaza TASK_ID con el ID real de una tarea
curl -X GET http://localhost:3000/api/tasks/TASK_ID
```

**Ejemplo con ID real:**
```bash
curl -X GET http://localhost:3000/api/tasks/507f1f77bcf86cd799439011
```

### **2.4 Actualizar tareas (PUT /api/tasks/:id)**

```bash
# Marcar tarea como completada
curl -X PUT http://localhost:3000/api/tasks/TASK_ID \
  -H "Content-Type: application/json" \
  -d '{
    "completed": true
  }'
```

```bash
# Actualizar título y descripción
curl -X PUT http://localhost:3000/api/tasks/TASK_ID \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Título actualizado",
    "description": "Nueva descripción actualizada"
  }'
```

```bash
# Cambiar prioridad
curl -X PUT http://localhost:3000/api/tasks/TASK_ID \
  -H "Content-Type: application/json" \
  -d '{
    "priority": "baja"
  }'
```

```bash
# Actualización completa
curl -X PUT http://localhost:3000/api/tasks/TASK_ID \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tarea completamente actualizada",
    "description": "Nueva descripción completa",
    "completed": true,
    "priority": "alta",
    "dueDate": "2024-02-01T12:00:00.000Z"
  }'
```

### **2.5 Eliminar tareas (DELETE /api/tasks/:id)**

```bash
# Eliminar una tarea específica
curl -X DELETE http://localhost:3000/api/tasks/TASK_ID
```

---

## 🔍 **3. Filtros y consultas avanzadas**

### **3.1 Filtrar tareas por estado**

```bash
# Obtener solo tareas completadas
curl -X GET "http://localhost:3000/api/tasks?completed=true"
```

```bash
# Obtener solo tareas pendientes
curl -X GET "http://localhost:3000/api/tasks?completed=false"
```

### **3.2 Filtrar tareas por prioridad**

```bash
# Tareas de alta prioridad
curl -X GET "http://localhost:3000/api/tasks?priority=alta"
```

```bash
# Tareas de prioridad media
curl -X GET "http://localhost:3000/api/tasks?priority=media"
```

```bash
# Tareas de baja prioridad
curl -X GET "http://localhost:3000/api/tasks?priority=baja"
```

### **3.3 Ordenamiento de tareas**

```bash
# Ordenar por fecha de creación (más recientes primero)
curl -X GET "http://localhost:3000/api/tasks?sortBy=createdAt&order=desc"
```

```bash
# Ordenar por título alfabéticamente
curl -X GET "http://localhost:3000/api/tasks?sortBy=title&order=asc"
```

```bash
# Ordenar por prioridad
curl -X GET "http://localhost:3000/api/tasks?sortBy=priority&order=desc"
```

```bash
# Ordenar por fecha de vencimiento
curl -X GET "http://localhost:3000/api/tasks?sortBy=dueDate&order=asc"
```

### **3.4 Combinando filtros**

```bash
# Tareas pendientes de alta prioridad ordenadas por fecha
curl -X GET "http://localhost:3000/api/tasks?completed=false&priority=alta&sortBy=dueDate&order=asc"
```

```bash
# Tareas completadas ordenadas por fecha de creación
curl -X GET "http://localhost:3000/api/tasks?completed=true&sortBy=createdAt&order=desc"
```

---

## ❌ **4. Pruebas de validación de errores**

### **4.1 Crear tarea con datos inválidos**

```bash
# Título vacío (error de validación)
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "",
    "description": "Tarea sin título"
  }'
```

```bash
# Prioridad inválida
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tarea con prioridad inválida",
    "priority": "super-alta"
  }'
```

```bash
# Título demasiado largo (más de 100 caracteres)
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Este es un título extremadamente largo que excede los 100 caracteres permitidos para probar la validación",
    "description": "Descripción normal"
  }'
```

### **4.2 Obtener tarea con ID inválido**

```bash
# ID que no es un ObjectId válido
curl -X GET http://localhost:3000/api/tasks/123
```

```bash
# ID que no existe
curl -X GET http://localhost:3000/api/tasks/507f1f77bcf86cd799439999
```

### **4.3 Actualizar con datos inválidos**

```bash
# Sin proporcionar campos para actualizar
curl -X PUT http://localhost:3000/api/tasks/TASK_ID \
  -H "Content-Type: application/json" \
  -d '{}'
```

### **4.4 Ruta inexistente**

```bash
# Probar una ruta que no existe
curl -X GET http://localhost:3000/api/ruta-inexistente
```

---

## 🚀 **5. Script completo de pruebas**

```bash
#!/bin/bash
# Script para probar toda la API de forma secuencial

echo "🚀 Iniciando pruebas completas de la API..."

# 1. Verificar servidor
echo "1. Verificando servidor..."
curl -s http://localhost:3000/ | jq '.message'

# 2. Obtener tareas iniciales
echo "2. Obteniendo tareas iniciales..."
curl -s http://localhost:3000/api/tasks | jq '.count'

# 3. Crear una tarea
echo "3. Creando nueva tarea..."
RESPONSE=$(curl -s -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Tarea de prueba", "description": "Creada con script", "priority": "alta"}')

TASK_ID=$(echo $RESPONSE | jq -r '.data._id')
echo "Tarea creada con ID: $TASK_ID"

# 4. Obtener la tarea creada
echo "4. Obteniendo tarea por ID..."
curl -s http://localhost:3000/api/tasks/$TASK_ID | jq '.data.title'

# 5. Actualizar la tarea
echo "5. Actualizando tarea..."
curl -s -X PUT http://localhost:3000/api/tasks/$TASK_ID \
  -H "Content-Type: application/json" \
  -d '{"completed": true}' | jq '.data.completed'

# 6. Eliminar la tarea
echo "6. Eliminando tarea..."
curl -s -X DELETE http://localhost:3000/api/tasks/$TASK_ID | jq '.message'

echo "✅ Pruebas completadas!"
```

---

## 💡 **Consejos adicionales**

### **Para ver respuestas formateadas:**
```bash
# Agregar | jq al final para JSON bonito
curl -X GET http://localhost:3000/api/tasks | jq
```

### **Para guardar el ID de una tarea creada:**
```bash
# Crear tarea y guardar ID en variable
TASK_ID=$(curl -s -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Nueva tarea"}' | jq -r '.data._id')

echo "ID de la tarea: $TASK_ID"
```

### **Para ver solo los códigos de estado HTTP:**
```bash
# Solo código de estado
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/tasks
```

¡Con estos comandos puedes probar completamente toda la funcionalidad de tu API To-Do! 🎉
