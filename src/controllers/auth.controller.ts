import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../server';

type UserRole = 'ADMIN' | 'MEMBER';

// Interface para o payload do token JWT
interface TokenPayload {
  userId: number;
  role: UserRole;
}

// Gera um token JWT
const generateToken = (user: { id: number; role: UserRole }): string => {
  const payload: TokenPayload = {
    userId: user.id,
    role: user.role,
  };

  const secret = process.env.JWT_SECRET || 'your-secret-key';
  
  // Usando type assertion para o payload e as opções
  return jwt.sign(
    payload as object,
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' } as jwt.SignOptions
  );
};

// Registra um novo usuário
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Verifica se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Já existe um usuário com este e-mail',
      });
    }

    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria o usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'MEMBER', // Por padrão, novos usuários são membros
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // Gera o token JWT
    const token = generateToken({
      id: user.id,
      role: user.role as 'ADMIN' | 'MEMBER',
    });

    res.status(201).json({
      status: 'success',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Erro ao registrar usuário',
    });
  }
  return undefined;
};

// Retorna o usuário autenticado
export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Usuário não autenticado' });
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'Usuário não encontrado' });
    }
    const { password, ...userWithoutPassword } = user;
    res.status(200).json({ status: 'success', user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Erro ao buscar usuário autenticado' });
  }
};

// Faz login do usuário
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Encontra o usuário pelo e-mail
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Verifica se o usuário existe e a senha está correta
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        status: 'error',
        message: 'Credenciais inválidas',
      });
    }

    // Gera o token JWT
    const token = generateToken({
      id: user.id,
      role: user.role as 'ADMIN' | 'MEMBER',
    });

    // Remove a senha da resposta
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      status: 'success',
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Erro ao fazer login',
    });
  }
  return undefined;
};
