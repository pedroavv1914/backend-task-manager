import { Router } from 'express';
import { body, param } from 'express-validator';
import { isAuthenticated, validate } from '../middlewares/validation.middleware';
import {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  getTaskHistory,
} from '../controllers/task.controller';

const router = Router();

// Todas as rotas de tarefas exigem autenticação
router.use(isAuthenticated);

// Rotas para tarefas
router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('O título da tarefa é obrigatório'),
    body('description').optional().trim(),
    body('status')
      .optional()
      .isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED'])
      .withMessage('Status inválido'),
    body('priority')
      .optional()
      .isIn(['HIGH', 'MEDIUM', 'LOW'])
      .withMessage('Prioridade inválida'),
    body('assignedTo')
      .optional()
      .isInt()
      .withMessage('ID do usuário atribuído inválido'),
    body('teamId')
      .isInt()
      .withMessage('ID do time inválido')
      .toInt(),
  ],
  validate,
  createTask
);

router.get('/', getTasks);

router.get(
  '/:id',
  [param('id').isInt().withMessage('ID da tarefa inválido')],
  validate,
  getTask
);

router.put(
  '/:id',
  [
    param('id').isInt().withMessage('ID da tarefa inválido'),
    body('title').optional().trim().notEmpty().withMessage('O título da tarefa não pode estar vazio'),
    body('description').optional().trim(),
    body('status')
      .optional()
      .isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED'])
      .withMessage('Status inválido'),
    body('priority')
      .optional()
      .isIn(['HIGH', 'MEDIUM', 'LOW'])
      .withMessage('Prioridade inválida'),
    body('assignedTo')
      .optional()
      .isInt()
      .withMessage('ID do usuário atribuído inválido'),
  ],
  validate,
  updateTask
);

router.patch(
  '/:id/status',
  [
    param('id').isInt().withMessage('ID da tarefa inválido'),
    body('status')
      .isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED'])
      .withMessage('Status inválido'),
  ],
  validate,
  updateTaskStatus
);

router.delete(
  '/:id',
  [param('id').isInt().withMessage('ID da tarefa inválido')],
  validate,
  deleteTask
);

// Rota para obter o histórico de uma tarefa
router.get(
  '/:id/history',
  [param('id').isInt().withMessage('ID da tarefa inválido')],
  validate,
  getTaskHistory
);

export default router;
