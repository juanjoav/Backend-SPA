import { Router } from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  verifyToken
} from '../controllers/authController';
import {
  validateCreateUser,
  validateLoginUser
} from '../validators/userValidator';
import { authenticateToken } from '../middleware/auth';

/**
 * Router para las rutas de autenticación
 * Maneja registro, login y gestión de usuarios
 */
const router = Router();

/**
 * @route POST /api/auth/register
 * @desc Registrar un nuevo usuario
 * @access Público
 * @body {ICreateUserDTO} - Datos del nuevo usuario (username, email, password)
 */
router.post(
  '/register',
  validateCreateUser,
  registerUser
);

/**
 * @route POST /api/auth/login
 * @desc Iniciar sesión con credenciales de usuario
 * @access Público
 * @body {ILoginUserDTO} - Credenciales (username/email, password)
 */
router.post(
  '/login',
  validateLoginUser,
  loginUser
);

/**
 * @route GET /api/auth/profile
 * @desc Obtener perfil del usuario autenticado
 * @access Privado
 * @header {string} Authorization - Bearer token
 */
router.get(
  '/profile',
  authenticateToken,
  getUserProfile
);

/**
 * @route GET /api/auth/verify
 * @desc Verificar si el token JWT es válido
 * @access Privado
 * @header {string} Authorization - Bearer token
 */
router.get(
  '/verify',
  authenticateToken,
  verifyToken
);

export default router;
