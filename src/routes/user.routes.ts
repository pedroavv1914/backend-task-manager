import { Router } from 'express';
import { body } from 'express-validator';
import { isAuthenticated, isAdmin, validate } from '../middlewares/validation.middleware';
import { getUsers, getUserProfile, updateUser, deleteUser, updateAnyUser, deleteAnyUser } from '../controllers/user.controller';

const router = Router();

// Rotas protegidas por autenticação
router.use(isAuthenticated);

// Rota para listar todos os usuários (apenas admin)
router.get('/', isAdmin, getUsers);

// Rota para obter perfil do usuário autenticado
router.get('/profile', getUserProfile);

// Rota para atualizar perfil do usuário autenticado
router.put(
  '/profile',
  [
    body('name').optional().trim().notEmpty().withMessage('O nome é obrigatório'),
    body('email').optional().isEmail().withMessage('E-mail inválido'),
    body('password')
      .optional()
      .isLength({ min: 6 })
      .withMessage('A senha deve ter no mínimo 6 caracteres'),
  ],
  validate,
  updateUser
);

// Rota para deletar a conta do usuário autenticado
router.delete('/profile', deleteUser);

// Rota para atualizar qualquer usuário (apenas admin)
router.put(
  '/:id',
  isAdmin,
  [
    body('name').optional().trim().notEmpty().withMessage('O nome é obrigatório'),
    body('email').optional().isEmail().withMessage('E-mail inválido'),
    body('password')
      .optional()
      .isLength({ min: 6 })
      .withMessage('A senha deve ter no mínimo 6 caracteres'),
    body('role').optional().isIn(['ADMIN', 'MEMBER']).withMessage('Cargo inválido'),
  ],
  validate,
  updateAnyUser
);

// Rota para excluir qualquer usuário (apenas admin)
router.delete('/:id', isAdmin, deleteAnyUser);

export default router;
