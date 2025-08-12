import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { 
  IUserDocument, 
  ICreateUserDTO, 
  ILoginUserDTO, 
  IJWTPayload,
  IApiResponse, 
  IApiErrorResponse 
} from '../types';

/**
 * Genera un token JWT para el usuario
 * @param userId - ID del usuario
 * @param username - Nombre de usuario
 * @returns Token JWT firmado
 */
const generateToken = (userId: string, username: string): string => {
  const payload: IJWTPayload = {
    userId,
    username
  };

  const secret = process.env.JWT_SECRET || 'fallback-secret-key';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
};

/**
 * Controlador para registrar un nuevo usuario
 * 
 * @param req - Request con datos del usuario en el body
 * @param res - Response con usuario creado y token
 */
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    // Verificar si el nombre de usuario ya existe
    const existingUsername = await User.isUsernameTaken(username);
    if (existingUsername) {
      const errorResponse: IApiErrorResponse = {
        error: 'Usuario ya existe',
        message: 'El nombre de usuario ya está registrado'
      };
      
      res.status(409).json(errorResponse);
      return;
    }

    // Verificar si el email ya existe
    const existingEmail = await User.isEmailTaken(email);
    if (existingEmail) {
      const errorResponse: IApiErrorResponse = {
        error: 'Email ya registrado',
        message: 'El email ya está asociado a otra cuenta'
      };
      
      res.status(409).json(errorResponse);
      return;
    }

    // Crear nuevo usuario
    const user = new User({ username, email, password });
    const savedUser: IUserDocument = await user.save();

    // Generar token JWT
    const token = generateToken(savedUser._id, savedUser.username);

    // Respuesta exitosa (sin incluir la contraseña)
    const response: IApiResponse = {
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: {
          _id: savedUser._id,
          username: savedUser.username,
          email: savedUser.email,
          createdAt: savedUser.createdAt
        },
        token
      }
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Error al registrar usuario:', error);

    // Manejar errores de validación de Mongoose
    if (error instanceof Error && error.name === 'ValidationError') {
      const errorResponse: IApiErrorResponse = {
        error: 'Datos de registro inválidos',
        message: 'La información proporcionada para el registro no es válida'
      };
      
      res.status(400).json(errorResponse);
      return;
    }

    // Error genérico del servidor
    const errorResponse: IApiErrorResponse = {
      error: 'Error interno del servidor',
      message: 'No se pudo registrar el usuario'
    };
    
    res.status(500).json(errorResponse);
  }
};

/**
 * Controlador para iniciar sesión
 * 
 * @param req - Request con credenciales en el body
 * @param res - Response con usuario y token
 */
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    // Buscar usuario por nombre de usuario o email
    const user: IUserDocument | null = await User.findByIdentifier(username);
    
    if (!user) {
      const errorResponse: IApiErrorResponse = {
        error: 'Credenciales inválidas',
        message: 'Usuario o contraseña incorrectos'
      };
      
      res.status(401).json(errorResponse);
      return;
    }

    // Verificar contraseña
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      const errorResponse: IApiErrorResponse = {
        error: 'Credenciales inválidas',
        message: 'Usuario o contraseña incorrectos'
      };
      
      res.status(401).json(errorResponse);
      return;
    }

    // Generar token JWT
    const token = generateToken(user._id, user.username);

    // Respuesta exitosa
    const response: IApiResponse = {
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt
        },
        token
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    
    const errorResponse: IApiErrorResponse = {
      error: 'Error interno del servidor',
      message: 'No se pudo iniciar sesión'
    };
    
    res.status(500).json(errorResponse);
  }
};

/**
 * Controlador para obtener el perfil del usuario actual
 * 
 * @param req - Request autenticado con información del usuario
 * @param res - Response con datos del usuario
 */
export const getUserProfile = async (req: any, res: Response): Promise<void> => {
  try {
    // El middleware de autenticación ya verificó el token y agregó user al request
    const userId = req.user?.userId;

    if (!userId) {
      const errorResponse: IApiErrorResponse = {
        error: 'No autorizado',
        message: 'Token de acceso inválido'
      };
      
      res.status(401).json(errorResponse);
      return;
    }

    // Buscar usuario por ID
    const user: IUserDocument | null = await User.findById(userId);
    
    if (!user) {
      const errorResponse: IApiErrorResponse = {
        error: 'Usuario no encontrado',
        message: 'El usuario no existe en el sistema'
      };
      
      res.status(404).json(errorResponse);
      return;
    }

    // Respuesta exitosa con datos del usuario
    const response: IApiResponse = {
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    
    const errorResponse: IApiErrorResponse = {
      error: 'Error interno del servidor',
      message: 'No se pudo obtener el perfil del usuario'
    };
    
    res.status(500).json(errorResponse);
  }
};

/**
 * Controlador para verificar si un token JWT es válido
 * 
 * @param req - Request con token en headers
 * @param res - Response con estado de validez
 */
export const verifyToken = async (req: any, res: Response): Promise<void> => {
  try {
    // El middleware de autenticación ya verificó el token
    const user = req.user;

    if (!user) {
      const errorResponse: IApiErrorResponse = {
        error: 'Token inválido',
        message: 'El token proporcionado no es válido'
      };
      
      res.status(401).json(errorResponse);
      return;
    }

    // Respuesta exitosa
    const response: IApiResponse = {
      success: true,
      message: 'Token válido',
      data: {
        userId: user.userId,
        username: user.username,
        iat: user.iat,
        exp: user.exp
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error al verificar token:', error);
    
    const errorResponse: IApiErrorResponse = {
      error: 'Error interno del servidor',
      message: 'No se pudo verificar el token'
    };
    
    res.status(500).json(errorResponse);
  }
};
