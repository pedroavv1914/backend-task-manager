import { Router } from 'express';
import { body, param } from 'express-validator';
import { isAuthenticated, isAdmin, validate } from '../middlewares/validation.middleware';
import {
  createTeam,
  getTeams,
  getTeam,
  updateTeam,
  deleteTeam,
  addTeamMember,
  removeTeamMember,
  getTeamMembers,
} from '../controllers/team.controller';

const router = Router();

// Todas as rotas de times exigem autenticação
router.use(isAuthenticated);

// Rotas para times
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('O nome do time é obrigatório'),
    body('description').optional().trim(),
  ],
  validate,
  isAdmin, // Apenas administradores podem criar times
  createTeam
);

router.get('/', getTeams);
router.get('/:id', getTeam);

router.put(
  '/:id',
  [
    param('id').isInt().withMessage('ID do time inválido'),
    body('name').optional().trim().notEmpty().withMessage('O nome do time é obrigatório'),
    body('description').optional().trim(),
  ],
  validate,
  isAdmin, // Apenas administradores podem atualizar times
  updateTeam
);

router.delete(
  '/:id',
  [param('id').isInt().withMessage('ID do time inválido')],
  validate,
  isAdmin, // Apenas administradores podem excluir times
  deleteTeam
);

// Rotas para membros do time
router.get('/:teamId/members', getTeamMembers);

router.post(
  '/:teamId/members',
  [
    param('teamId').isInt().withMessage('ID do time inválido'),
    body('userId').isInt().withMessage('ID do usuário inválido'),
  ],
  validate,
  isAdmin, // Apenas administradores podem adicionar membros
  addTeamMember
);

router.delete(
  '/:teamId/members/:userId',
  [
    param('teamId').isInt().withMessage('ID do time inválido'),
    param('userId').isInt().withMessage('ID do usuário inválido'),
  ],
  validate,
  isAdmin, // Apenas administradores podem remover membros
  removeTeamMember
);

export default router;
