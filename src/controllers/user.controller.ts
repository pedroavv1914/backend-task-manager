import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../server';

// Obtém todos os usuários (apenas admin)
export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log('Usuários encontrados no banco de dados:', users);
    console.log('Usuários ADMIN encontrados:', users.filter(u => u.role === 'ADMIN'));

    // Retorna diretamente o array de usuários para compatibilidade com o frontend
    return res.status(200).json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Erro ao buscar usuários',
    });
  }
};

// Obtém o perfil do usuário autenticado
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        status: 'error',
        message: 'Usuário não autenticado',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Usuário não encontrado',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao buscar perfil do usuário:', errorMessage);
    return res.status(500).json({
      status: 'error',
      message: 'Erro ao buscar perfil do usuário',
    });
  }
};

// Atualiza o perfil do usuário autenticado
export const updateUser = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        status: 'error',
        message: 'Usuário não autenticado',
      });
    }

    const { name, email, password } = req.body;
    const updateData: Record<string, unknown> = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao atualizar usuário:', errorMessage);
    
    // Verificação de tipo para acessar propriedades específicas do erro do Prisma
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002' && 
        'meta' in error && error.meta && typeof error.meta === 'object' && 
        'target' in error.meta && Array.isArray(error.meta.target) && 
        error.meta.target.includes('email')) {
      return res.status(400).json({
        status: 'error',
        message: 'Este e-mail já está em uso',
      });
    }
    
    return res.status(500).json({
      status: 'error',
      message: 'Erro ao atualizar usuário',
    });
  }
};

// Atualiza qualquer usuário (apenas admin)
export const updateAnyUser = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        status: 'error',
        message: 'Acesso negado. Apenas administradores podem atualizar outros usuários.',
      });
    }

    const { id } = req.params;
    const { name, email, password, role } = req.body;
    
    const updateData: Record<string, unknown> = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    if (role) {
      updateData.role = role;
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao atualizar usuário:', errorMessage);
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002' && 
        'meta' in error && error.meta && typeof error.meta === 'object' && 
        'target' in error.meta && Array.isArray(error.meta.target) && 
        error.meta.target.includes('email')) {
      return res.status(400).json({
        status: 'error',
        message: 'Este e-mail já está em uso',
      });
    }
    
    return res.status(500).json({
      status: 'error',
      message: 'Erro ao atualizar usuário',
    });
  }
};

// Deleta a conta do usuário autenticado
export const deleteUser = async (req: Request, res: Response) => {
  try {
    console.log('Iniciando auto-exclusão de usuário');
    
    if (!req.user?.id) {
      console.log('Erro: Usuário não autenticado');
      return res.status(401).json({
        status: 'error',
        message: 'Usuário não autenticado',
      });
    }

    console.log('ID do usuário a ser excluído:', req.user.id);
    
    // Verifica se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      console.log('Erro: Usuário não encontrado');
      return res.status(404).json({
        status: 'error',
        message: 'Usuário não encontrado',
      });
    }

    console.log('Excluindo usuário...');
    await prisma.user.delete({
      where: { id: req.user.id },
    });

    console.log('Usuário excluído com sucesso');
    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    
    if (error instanceof Error && 
        (error.message.includes('Record to delete does not exist') || 
         error.message.includes('No User found'))) {
      return res.status(404).json({
        status: 'error',
        message: 'Usuário não encontrado',
      });
    }
    
    return res.status(500).json({
      status: 'error',
      message: 'Erro ao excluir usuário',
    });
  }
};

// Deleta qualquer usuário (apenas admin)
export const deleteAnyUser = async (req: Request, res: Response) => {
  try {
    console.log('Iniciando exclusão de usuário');
    const { id } = req.params;
    
    console.log('ID do usuário a ser excluído:', id);
    console.log('Usuário autenticado:', req.user);
    
    if (!id) {
      console.log('Erro: ID do usuário não fornecido');
      return res.status(400).json({
        status: 'error',
        message: 'ID do usuário não fornecido',
      });
    }

    // Converte o ID para número para comparação
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      console.log('Erro: ID do usuário inválido');
      return res.status(400).json({
        status: 'error',
        message: 'ID do usuário inválido',
      });
    }

    // Verifica se o usuário está tentando excluir a si mesmo
    if (req.user?.id === userId) {
      console.log('Erro: Tentativa de auto-exclusão');
      return res.status(400).json({
        status: 'error',
        message: 'Você não pode excluir a si mesmo',
      });
    }

    console.log('Verificando se o usuário existe...');
    // Verifica se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.log('Erro: Usuário não encontrado');
      return res.status(404).json({
        status: 'error',
        message: 'Usuário não encontrado',
      });
    }

    console.log('Excluindo registros relacionados ao usuário...');
    
    // Inicia uma transação para garantir a integridade dos dados
    await prisma.$transaction(async (prisma) => {
      // 1. Exclui o histórico de tarefas associado ao usuário
      await prisma.taskHistory.deleteMany({
        where: { changedBy: userId },
      });
      
      // 2. Remove o usuário das equipes
      await prisma.teamMember.deleteMany({
        where: { userId },
      });
      
      // 3. Encontra um administrador para atribuir as tarefas
      const admin = await prisma.user.findFirst({
        where: { 
          role: 'ADMIN',
          id: { not: userId } // Não atribuir a si mesmo se for um admin se auto-excluindo
        },
        select: { id: true }
      });
      
      // Se não houver outro admin, mantém as tarefas atribuídas ao usuário atual
      // (serão excluídas quando o usuário for excluído devido à restrição CASCADE)
      if (admin) {
        console.log(`Atribuindo tarefas ao administrador ID: ${admin.id}`);
        await prisma.task.updateMany({
          where: { assignedTo: userId },
          data: { 
            assignedTo: admin.id,
            status: 'PENDING' // Reabre as tarefas para revisão
          },
        });
      }
      
      // 4. Finalmente, exclui o usuário
      await prisma.user.delete({
        where: { id: userId },
      });
    });

    console.log('Usuário e registros relacionados excluídos com sucesso');
    return res.status(204).send();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao excluir usuário:', errorMessage);
    
    if (error instanceof Error && 
        (error.message.includes('Record to delete does not exist') || 
         error.message.includes('No User found'))) {
      return res.status(404).json({
        status: 'error',
        message: 'Usuário não encontrado',
      });
    }
    
    return res.status(500).json({
      status: 'error',
      message: 'Erro ao excluir usuário',
    });
  }
};
