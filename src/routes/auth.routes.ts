import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, getMe } from '../controllers/auth.controller';
import { validate } from '../middlewares/validation.middleware';

const router = Router();

// Rota para registro de usuário
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('O nome é obrigatório'),
    body('email').isEmail().withMessage('E-mail inválido'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('A senha deve ter no mínimo 6 caracteres'),
  ],
  validate,
  register
);

// Rota para login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('E-mail inválido'),
    body('password').notEmpty().withMessage('A senha é obrigatória'),
  ],
  validate,
  login
);

// Rota para obter usuário autenticado
import { isAuthenticated } from '../middlewares/validation.middleware';
router.get('/me', isAuthenticated, getMe);

export default router;
