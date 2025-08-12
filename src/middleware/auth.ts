import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { IJWTPayload, IApiErrorResponse, IAuthenticatedRequest } from '../types';

/**
 * Middleware para verificar y validar tokens JWT
 * Protege rutas que requieren autenticación
 * 
 * @param req - Request con token en headers
 * @param res - Response 
 * @param next - NextFunction para continuar
 */
export const authenticateToken = (req: IAuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) // Remover "Bearer " del inicio
      : null;

    if (!token) {
      const errorResponse: IApiErrorResponse = {
        error: 'Token requerido',
        message: 'Se requiere un token de acceso válido para acceder a este recurso'
      };
      
      res.status(401).json(errorResponse);
      return;
    }

    // Verificar y decodificar el token
    const secret = process.env.JWT_SECRET || 'fallback-secret-key';
    
    jwt.verify(token, secret, (error: any, decoded: any) => {
      if (error) {
        let errorMessage = 'Token inválido';
        
        // Proporcionar mensajes específicos según el tipo de error
        if (error.name === 'TokenExpiredError') {
          errorMessage = 'El token ha expirado. Por favor, inicia sesión nuevamente';
        } else if (error.name === 'JsonWebTokenError') {
          errorMessage = 'Token malformado o inválido';
        } else if (error.name === 'NotBeforeError') {
          errorMessage = 'Token no válido aún';
        }

        const errorResponse: IApiErrorResponse = {
          error: 'Autenticación fallida',
          message: errorMessage
        };
        
        res.status(401).json(errorResponse);
        return;
      }

      // Agregar información del usuario decodificada al request
      req.user = decoded as IJWTPayload;
      next();
    });
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    
    const errorResponse: IApiErrorResponse = {
      error: 'Error interno del servidor',
      message: 'Error al verificar la autenticación'
    };
    
    res.status(500).json(errorResponse);
  }
};

/**
 * Middleware opcional de autenticación
 * No bloquea el acceso si no hay token, pero lo decodifica si está presente
 * Útil para rutas que pueden funcionar con o sin autenticación
 * 
 * @param req - Request con token opcional en headers
 * @param res - Response
 * @param next - NextFunction para continuar
 */
export const optionalAuth = (req: IAuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7)
      : null;

    if (!token) {
      // Continuar sin autenticación
      next();
      return;
    }

    const secret = process.env.JWT_SECRET || 'fallback-secret-key';
    
    jwt.verify(token, secret, (error: any, decoded: any) => {
      if (!error && decoded) {
        // Token válido: agregar usuario al request
        req.user = decoded as IJWTPayload;
      }
      // Continuar independientemente del resultado (token opcional)
      next();
    });
  } catch (error) {
    console.error('Error en middleware de autenticación opcional:', error);
    // Continuar incluso si hay error (autenticación opcional)
    next();
  }
};

/**
 * Middleware para verificar roles/permisos específicos
 * Se ejecuta después del middleware de autenticación
 * 
 * @param allowedRoles - Array de roles permitidos (para futuras extensiones)
 */
export const requireRole = (allowedRoles: string[] = []) => {
  return (req: IAuthenticatedRequest, res: Response, next: NextFunction): void => {
    // Verificar que el usuario esté autenticado
    if (!req.user) {
      const errorResponse: IApiErrorResponse = {
        error: 'No autorizado',
        message: 'Se requiere autenticación para acceder a este recurso'
      };
      
      res.status(401).json(errorResponse);
      return;
    }

    // En una implementación más completa, aquí verificaríamos los roles
    // Por ahora, simplemente permitimos el acceso a usuarios autenticados
    next();
  };
};

/**
 * Middleware para rate limiting básico basado en usuario
 * Previene abuso de la API por usuario autenticado
 */
export const userRateLimit = () => {
  const userRequests = new Map<string, { count: number; resetTime: number }>();
  const maxRequestsPerMinute = 100;
  const windowMs = 60 * 1000; // 1 minuto

  return (req: IAuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next();
      return;
    }

    const userId = req.user.userId;
    const now = Date.now();
    
    const userRecord = userRequests.get(userId);
    
    if (!userRecord || now > userRecord.resetTime) {
      // Crear nuevo registro o resetear ventana
      userRequests.set(userId, {
        count: 1,
        resetTime: now + windowMs
      });
      next();
      return;
    }

    if (userRecord.count >= maxRequestsPerMinute) {
      const errorResponse: IApiErrorResponse = {
        error: 'Límite de tasa excedido',
        message: 'Demasiadas peticiones. Intenta de nuevo en un minuto'
      };
      
      res.status(429).json(errorResponse);
      return;
    }

    // Incrementar contador
    userRecord.count++;
    next();
  };
};
