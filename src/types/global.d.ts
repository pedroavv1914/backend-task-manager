// Importando tipos do Express para extensão
import 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: string; // Ou use o tipo específico do Prisma se disponível
      };
    }
  }
}

export {};
