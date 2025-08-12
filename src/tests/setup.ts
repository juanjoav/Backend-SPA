/**
 * Configuración global para los tests
 * Se ejecuta antes de todos los tests
 */

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

/**
 * Configuración antes de todos los tests
 */
beforeAll(async () => {
  // Crear una instancia de MongoDB en memoria para tests
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Conectar a MongoDB en memoria
  await mongoose.connect(mongoUri);
});

/**
 * Limpieza después de cada test
 */
afterEach(async () => {
  // Limpiar todas las colecciones después de cada test
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

/**
 * Limpieza después de todos los tests
 */
afterAll(async () => {
  // Cerrar conexión y servidor de MongoDB
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

// Configurar timeout para tests más largos
jest.setTimeout(10000);
