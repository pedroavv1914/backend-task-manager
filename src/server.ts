import 'express-async-errors';
import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

// Importar rotas
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import teamRoutes from './routes/team.routes';
import taskRoutes from './routes/task.routes';

// Inicializar o Prisma Client
export const prisma = new PrismaClient();

// Inicializar o Express
const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/tasks', taskRoutes);

// Rota de teste
app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'API do Gerenciador de Tarefas está funcionando!' });
});

// Middleware de tratamento de erros
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  
  if (err instanceof z.ZodError) {
    return res.status(400).json({
      status: 'error',
      message: 'Erro de validação',
      errors: err.errors,
    });
  }

  return res.status(500).json({
    status: 'error',
    message: 'Erro interno do servidor',
  });
});

// Iniciar o servidor
const server = app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

// Encerrar o Prisma Client ao encerrar a aplicação
process.on('SIGTERM', () => {
  prisma.$disconnect()
    .then(() => {
      console.log('Prisma Client desconectado');
      server.close(() => {
        console.log('Servidor encerrado');
      });
    });
});

export default app;
