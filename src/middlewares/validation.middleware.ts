// @ts-ignore - Importação de tipos do Express
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import * as jwt from 'jsonwebtoken';

// Extendendo a interface Request do Express para incluir a propriedade user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: 'ADMIN' | 'MEMBER';
      };
    }
  }
}

export const validate = (req: Request, res: Response, next: NextFunction): Response | void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Erro de validação',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  
  return next();
};

export const isAuthenticated = (req: Request, res: Response, next: NextFunction): Response | void => {
  try {
    // Log do header Authorization recebido
    console.log('Authorization header recebido:', req.headers.authorization);
    // Verifica se o header de autorização existe
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      console.log('Erro de autenticação: Nenhum token fornecido');
      return res.status(401).json({
        status: 'error',
        message: 'Acesso não autorizado. Nenhum token fornecido.',
      });
    }
    
    // Verifica se o token está no formato correto (Bearer token)
    const parts = authHeader.split(' ');
    
    if (parts.length !== 2) {
      console.log('Erro de autenticação: Token error');
      return res.status(401).json({
        status: 'error',
        message: 'Erro no token',
      });
    }
    
    const [scheme, token] = parts;
    
    if (!/^Bearer$/i.test(scheme)) {
      console.log('Erro de autenticação: Token mal formatado');
      return res.status(401).json({
        status: 'error',
        message: 'Token mal formatado',
      });
    }
    
    // Verifica se o token existe
    if (!token) {
      console.log('Erro de autenticação: Nenhum token fornecido');
      return res.status(401).json({
        status: 'error',
        message: 'Nenhum token fornecido',
      });
    }
    
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    
    try {
      console.log('Verificando token JWT...');
      console.log('Token recebido:', token);
      console.log('Secret usado:', secret);
      
      // Verifica o token
      const decoded = jwt.verify(token, secret) as { userId: number; role: 'ADMIN' | 'MEMBER' };
      
      console.log('Token decodificado:', decoded);
      
      // Verifica se o token tem os campos necessários
      if (!decoded.userId || !decoded.role) {
        console.log('Erro de autenticação: Token inválido - campos ausentes');
        return res.status(401).json({
          status: 'error',
          message: 'Token inválido',
        });
      }
      
      // Adiciona o ID do usuário e a role ao objeto de requete para uso posterior
      req.user = {
        id: decoded.userId,
        role: decoded.role,
      };
      
      console.log(`Usuário autenticado: ID ${decoded.userId}, ROLE: ${decoded.role}`);
      return next();
    } catch (error: any) {
      if (error instanceof jwt.TokenExpiredError) {
        console.error('Erro ao verificar o token: Token expirado');
        return res.status(401).json({
          status: 'error',
          message: 'Sessão expirada. Por favor, faça login novamente.',
        });
      } else if (error instanceof jwt.JsonWebTokenError) {
        console.error('Erro ao verificar o token: JWT malformado');
        return res.status(401).json({
          status: 'error',
          message: 'Token JWT malformado ou inválido',
        });
      } else {
        console.error('Erro desconhecido ao verificar o token:', error);
        return res.status(401).json({
          status: 'error',
          message: 'Erro desconhecido ao verificar o token',
        });
      }
    }
  } catch (error) {
    // Este bloco externo agora só captura erros inesperados do middleware
    console.error('Erro inesperado de autenticação:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Erro interno de autenticação',
    });
  }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction): Response | void => {
  console.log('isAdmin middleware - req.user:', req.user);
  console.log('isAdmin middleware - req.user?.role:', req.user?.role);
  
  if (req.user?.role !== 'ADMIN') {
    console.log('Acesso negado - Usuário não é admin');
    return res.status(403).json({
      status: 'error',
      message: 'Acesso negado. Apenas administradores podem acessar este recurso.',
    });
  }
  
  console.log('Acesso permitido - Usuário é admin');
  return next();
};
