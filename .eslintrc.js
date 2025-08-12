module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended'
  ],
  rules: {
    // Estilo de código
    'indent': ['error', 2],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    
    // Mejores prácticas
    'no-console': 'off', // Permitir console en este proyecto
    'no-debugger': 'error',
    'no-duplicate-imports': 'error',
    'prefer-template': 'error',
    'no-unused-vars': 'off', // Desactivar para TypeScript
    
    // Manejo de errores
    'no-throw-literal': 'error'
  },
  env: {
    node: true,
    es6: true,
    jest: true
  },
  ignorePatterns: [
    'dist/',
    'node_modules/',
    'coverage/',
    '*.js'
  ]
};
