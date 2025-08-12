// Script de prueba simple para verificar que la API funciona correctamente
// Ejecutar con: node test-api.js (después de iniciar el servidor)

const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Función helper para hacer peticiones HTTP
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({ statusCode: res.statusCode, body: jsonBody, headers: res.headers });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body: body, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Función para hacer GET
async function get(path) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: path,
    method: 'GET'
  };
  return makeRequest(options);
}

// Función para hacer POST
async function post(path, data) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  return makeRequest(options, data);
}

// Función para hacer PUT
async function put(path, data) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: path,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  return makeRequest(options, data);
}

// Función para hacer DELETE
async function del(path) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: path,
    method: 'DELETE'
  };
  return makeRequest(options);
}

// Función principal de pruebas
async function runTests() {
  console.log('🚀 Iniciando pruebas de la API...\n');
  
  try {
    // 1. Probar ruta de inicio
    console.log('1. Probando ruta de inicio (GET /)');
    const homeResponse = await get('/');
    console.log(`   Status: ${homeResponse.statusCode}`);
    console.log(`   Message: ${homeResponse.body.message}\n`);

    // 2. Obtener todas las tareas (inicialmente vacío)
    console.log('2. Obteniendo todas las tareas (GET /api/tasks)');
    const allTasksResponse = await get('/api/tasks');
    console.log(`   Status: ${allTasksResponse.statusCode}`);
    console.log(`   Count: ${allTasksResponse.body.count}\n`);

    // 3. Crear una nueva tarea
    console.log('3. Creando nueva tarea (POST /api/tasks)');
    const newTask = {
      title: 'Tarea de prueba',
      description: 'Esta es una tarea creada para probar la API',
      priority: 'alta',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 días desde ahora
    };
    
    const createResponse = await post('/api/tasks', newTask);
    console.log(`   Status: ${createResponse.statusCode}`);
    console.log(`   Created task ID: ${createResponse.body.data?._id}`);
    console.log(`   Title: ${createResponse.body.data?.title}\n`);

    if (createResponse.statusCode === 201 && createResponse.body.data?._id) {
      const taskId = createResponse.body.data._id;

      // 4. Obtener la tarea por ID
      console.log('4. Obteniendo tarea por ID (GET /api/tasks/:id)');
      const getTaskResponse = await get(`/api/tasks/${taskId}`);
      console.log(`   Status: ${getTaskResponse.statusCode}`);
      console.log(`   Task title: ${getTaskResponse.body.data?.title}\n`);

      // 5. Actualizar la tarea
      console.log('5. Actualizando tarea (PUT /api/tasks/:id)');
      const updateData = {
        completed: true,
        description: 'Tarea actualizada y completada'
      };
      
      const updateResponse = await put(`/api/tasks/${taskId}`, updateData);
      console.log(`   Status: ${updateResponse.statusCode}`);
      console.log(`   Completed: ${updateResponse.body.data?.completed}\n`);

      // 6. Obtener tareas filtradas
      console.log('6. Obteniendo tareas completadas (GET /api/tasks?completed=true)');
      const filteredResponse = await get('/api/tasks?completed=true');
      console.log(`   Status: ${filteredResponse.statusCode}`);
      console.log(`   Completed tasks count: ${filteredResponse.body.count}\n`);

      // 7. Eliminar la tarea
      console.log('7. Eliminando tarea (DELETE /api/tasks/:id)');
      const deleteResponse = await del(`/api/tasks/${taskId}`);
      console.log(`   Status: ${deleteResponse.statusCode}`);
      console.log(`   Message: ${deleteResponse.body.message}\n`);

      // 8. Verificar que la tarea fue eliminada
      console.log('8. Verificando eliminación (GET /api/tasks/:id)');
      const verifyDeleteResponse = await get(`/api/tasks/${taskId}`);
      console.log(`   Status: ${verifyDeleteResponse.statusCode}`);
      console.log(`   Expected 404: ${verifyDeleteResponse.statusCode === 404 ? 'OK' : 'FAIL'}\n`);
    }

    // 9. Probar validación de datos inválidos
    console.log('9. Probando validación con datos inválidos');
    const invalidTask = {
      title: '', // Título vacío (inválido)
      priority: 'súper-alta' // Prioridad inválida
    };
    
    const invalidResponse = await post('/api/tasks', invalidTask);
    console.log(`   Status: ${invalidResponse.statusCode}`);
    console.log(`   Expected 400: ${invalidResponse.statusCode === 400 ? 'OK' : 'FAIL'}`);
    console.log(`   Validation errors: ${invalidResponse.body.details?.length || 0}\n`);

    console.log('✅ Todas las pruebas completadas exitosamente!');
    console.log('🎉 La API está funcionando correctamente.');
    
  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.message);
    console.log('\n💡 Asegúrate de que:');
    console.log('   - El servidor esté ejecutándose en http://localhost:3000');
    console.log('   - MongoDB esté ejecutándose (docker-compose up -d)');
    console.log('   - No haya problemas de conectividad');
  }
}

// Ejecutar las pruebas
console.log('📋 Script de prueba para To-Do App API');
console.log('=====================================\n');

runTests();
