import mongoose, { Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUserDocument, IUserModel } from '../types';

/**
 * Schema de Mongoose para los usuarios
 * Define la estructura y validaciones de los documentos de usuario en MongoDB
 */
const userSchema: Schema<IUserDocument> = new Schema({
  username: {
    type: String,
    required: [true, 'El nombre de usuario es obligatorio'],
    unique: true,
    trim: true,
    minlength: [3, 'El nombre de usuario debe tener al menos 3 caracteres'],
    maxlength: [30, 'El nombre de usuario no puede exceder 30 caracteres'],
    match: [/^[a-zA-Z0-9_]+$/, 'El nombre de usuario solo puede contener letras, números y guiones bajos']
  },
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Formato de email inválido']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    select: false // No incluir en las consultas por defecto
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Middleware pre-save: hashea la contraseña antes de guardar
 */
userSchema.pre<IUserDocument>('save', async function(next) {
  // Solo hashear la contraseña si ha sido modificada
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Generar salt y hashear la contraseña
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    this.updatedAt = new Date();
    next();
  } catch (error) {
    next(error as Error);
  }
});

/**
 * Middleware pre-findOneAndUpdate: actualiza updatedAt en actualizaciones
 */
userSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

/**
 * Índices para optimización de consultas
 */
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });

/**
 * Métodos de instancia del documento
 */
userSchema.methods = {
  /**
   * Compara una contraseña en texto plano con la contraseña hasheada
   * @param candidatePassword - Contraseña a verificar
   * @returns Promise<boolean> - true si las contraseñas coinciden
   */
  async comparePassword(candidatePassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
      return false;
    }
  },

  /**
   * Obtener representación sin contraseña
   * @returns Objeto usuario sin contraseña
   */
  toSafeObject() {
    const userObject = this.toObject();
    delete userObject.password;
    return userObject;
  }
};

/**
 * Métodos estáticos del modelo
 */
userSchema.statics = {
  /**
   * Buscar usuario por nombre de usuario o email
   * @param identifier - Nombre de usuario o email
   * @returns Promise<IUserDocument | null>
   */
  async findByIdentifier(identifier: string) {
    return this.findOne({
      $or: [
        { username: identifier },
        { email: identifier }
      ]
    }).select('+password');
  },

  /**
   * Verificar si un nombre de usuario ya existe
   * @param username - Nombre de usuario a verificar
   * @returns Promise<boolean>
   */
  async isUsernameTaken(username: string): Promise<boolean> {
    const user = await this.findOne({ username });
    return !!user;
  },

  /**
   * Verificar si un email ya está registrado
   * @param email - Email a verificar
   * @returns Promise<boolean>
   */
  async isEmailTaken(email: string): Promise<boolean> {
    const user = await this.findOne({ email });
    return !!user;
  }
};

/**
 * Modelo de usuario con tipado completo de TypeScript
 */
const User = mongoose.model<IUserDocument, IUserModel & Model<IUserDocument>>('User', userSchema);

export default User;
