// @ts-ignore - Importação de tipos do Express
import { Request, Response } from 'express';
import { prisma } from '../server';

// Obtém o histórico de uma tarefa
export const getTaskHistory = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    // Verifica se a tarefa existe
    const task = await prisma.task.findUnique({
      where: { id: Number(id) },
    });

    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Tarefa não encontrada',
      });
    }

    // Obtém o histórico da tarefa
    const history = await prisma.taskHistory.findMany({
      where: { taskId: Number(id) },
      include: {
        changedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        changedAt: 'desc',
      },
    });

    // Formata a resposta
    const formattedHistory = history.map((record) => ({
      id: record.id,
      taskId: record.taskId,
      changedBy: {
        id: record.changedByUser.id,
        name: record.changedByUser.name,
        email: record.changedByUser.email,
      },
      oldStatus: record.oldStatus,
      newStatus: record.newStatus,
      changedAt: record.changedAt,
    }));

    return res.status(200).json({
      status: 'success',
      results: formattedHistory.length,
      data: {
        history: formattedHistory,
      },
    });
  } catch (error: any) {
    console.error('Erro ao buscar histórico da tarefa:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Erro ao buscar histórico da tarefa',
    });
  }
};

// Cria uma nova tarefa
export const createTask = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { title, description, status, priority, assignedTo, teamId } = req.body;
    const createdById = req.user!.id;

    // Verifica se o time existe
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return res.status(404).json({
        status: 'error',
        message: 'Time não encontrado',
      });
    }

    // Se um usuário for atribuído, verifica se ele é membro do time
    if (assignedTo) {
      const isTeamMember = await prisma.teamMember.findFirst({
        where: {
          teamId,
          userId: assignedTo,
        },
      });

      if (!isTeamMember) {
        return res.status(400).json({
          status: 'error',
          message: 'O usuário atribuído deve ser membro do time',
        });
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'PENDING',
        priority: priority || 'MEDIUM',
        assignedTo: assignedTo || createdById, // Se não for especificado, atribui ao criador
        teamId,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Registra a criação da tarefa no histórico
    await prisma.taskHistory.create({
      data: {
        taskId: task.id,
        changedBy: createdById,
        oldStatus: 'PENDING',
        newStatus: task.status,
      },
    });

    return res.status(201).json({
      status: 'success',
      data: {
        task,
      },
    });
  } catch (error: any) {
    console.error('Erro ao criar tarefa:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({
        status: 'error',
        message: 'Já existe uma tarefa com este título',
      });
    }
    
    return res.status(500).json({
      status: 'error',
      message: 'Erro ao criar tarefa',
    });
  }
};

// Obtém todas as tarefas com filtros
export const getTasks = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { status, priority, teamId, assignedTo } = req.query as {
      status?: string;
      priority?: string;
      teamId?: string;
      assignedTo?: string;
    };
    const userId = req.user!.id;
    const isAdmin = req.user!.role === 'ADMIN';

    const where: {
      status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
      priority?: 'LOW' | 'MEDIUM' | 'HIGH';
      teamId?: number | { in: number[] };
      assignedTo?: number;
    } = {};

    // Aplicar filtros
    if (status) {
      if (['PENDING', 'IN_PROGRESS', 'COMPLETED'].includes(status)) {
        where.status = status as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
      }
    }
    if (priority) {
      if (['LOW', 'MEDIUM', 'HIGH'].includes(priority)) {
        where.priority = priority as 'LOW' | 'MEDIUM' | 'HIGH';
      }
    }
    if (teamId) where.teamId = Number(teamId);
    
    // Se não for admin, só mostra as tarefas do time do usuário
    if (!isAdmin) {
      // Se o usuário não for admin, só pode ver as tarefas do seu time
      const userTeams = await prisma.teamMember.findMany({
        where: { userId },
        select: { teamId: true },
      });
      
      const teamIds = userTeams.map(ut => ut.teamId);
      where.teamId = { in: teamIds };
      
      // Se não for o admin, só pode ver as próprias tarefas
      if (assignedTo && Number(assignedTo) !== userId) {
        return res.status(403).json({
          status: 'error',
          message: 'Você só pode visualizar suas próprias tarefas',
        });
      }
    }
    
    // Filtrar por usuário atribuído
    if (assignedTo) where.assignedTo = Number(assignedTo);

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json({
      status: 'success',
      results: tasks.length,
      data: {
        tasks,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar tarefas:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Erro ao buscar tarefas',
    });
  }
};

// Obtém uma tarefa específica
export const getTask = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const isAdmin = req.user!.role === 'ADMIN';

    const task = await prisma.task.findUnique({
      where: { id: Number(id) },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
        history: {
          orderBy: {
            changedAt: 'desc',
          },
          include: {
            changedByUser: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Tarefa não encontrada',
      });
    }

    // Verifica se o usuário tem permissão para ver a tarefa
    if (!isAdmin) {
      // Verifica se o usuário é membro do time da tarefa
      const isTeamMember = await prisma.teamMember.findFirst({
        where: {
          teamId: task.teamId,
          userId,
        },
      });

      if (!isTeamMember) {
        return res.status(403).json({
          status: 'error',
          message: 'Você não tem permissão para visualizar esta tarefa',
        });
      }
    }

    return res.status(200).json({
      status: 'success',
      data: {
        task,
      },
    });
  } catch (error: any) {
    console.error('Erro ao buscar tarefa:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        status: 'error',
        message: 'Tarefa não encontrada',
      });
    }
    
    return res.status(500).json({
      status: 'error',
      message: 'Erro ao buscar tarefa',
    });
  }
};

// Atualiza uma tarefa
export const updateTask = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, assignedTo } = req.body;
    const userId = req.user!.id;
    const isAdmin = req.user!.role === 'ADMIN';

    // Busca a tarefa para verificar permissões
    const task = await prisma.task.findUnique({
      where: { id: Number(id) },
    });

    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Tarefa não encontrada',
      });
    }

    // Verifica se o usuário tem permissão para editar a tarefa
    if (!isAdmin) {
      // Verifica se o usuário é o responsável pela tarefa ou é o criador
      if (task.assignedTo !== userId) {
        return res.status(403).json({
          status: 'error',
          message: 'Você só pode editar suas próprias tarefas',
        });
      }
    }

    // Se estiver atualizando o usuário atribuído, verifica se ele pertence ao time
    if (assignedTo) {
      const isTeamMember = await prisma.teamMember.findFirst({
        where: {
          teamId: task.teamId,
          userId: assignedTo,
        },
      });

      if (!isTeamMember) {
        return res.status(400).json({
          status: 'error',
          message: 'O usuário atribuído deve ser membro do time',
        });
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id: Number(id) },
      data: {
        title,
        description,
        status,
        priority,
        assignedTo,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Se o status foi alterado, registra no histórico
    if (status && status !== task.status) {
      await prisma.taskHistory.create({
        data: {
          taskId: task.id,
          changedBy: userId,
          oldStatus: task.status,
          newStatus: status,
        },
      });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        task: updatedTask,
      },
    });
  } catch (error: any) {
    console.error('Erro ao atualizar tarefa:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        status: 'error',
        message: 'Tarefa não encontrada',
      });
    }
    
    return res.status(500).json({
      status: 'error',
      message: 'Erro ao atualizar tarefa',
    });
  }
};

// Atualiza apenas o status de uma tarefa
export const updateTaskStatus = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user!.id;

    // Busca a tarefa para verificar permissões
    const task = await prisma.task.findUnique({
      where: { id: Number(id) },
    });

    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Tarefa não encontrada',
      });
    }

    // Verifica se o status é diferente do atual
    if (status === task.status) {
      return res.status(400).json({
        status: 'error',
        message: 'O novo status deve ser diferente do status atual',
      });
    }

    // Atualiza o status da tarefa
    const updatedTask = await prisma.task.update({
      where: { id: Number(id) },
      data: { status },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Registra a mudança de status no histórico
    await prisma.taskHistory.create({
      data: {
        taskId: task.id,
        changedBy: userId,
        oldStatus: task.status,
        newStatus: status,
      },
    });

    return res.status(200).json({
      status: 'success',
      data: {
        task: updatedTask,
      },
    });
  } catch (error: any) {
    console.error('Erro ao atualizar status da tarefa:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        status: 'error',
        message: 'Tarefa não encontrada',
      });
    }
    
    return res.status(500).json({
      status: 'error',
      message: 'Erro ao atualizar status da tarefa',
    });
  }
};

// Deleta uma tarefa
export const deleteTask = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const isAdmin = req.user!.role === 'ADMIN';

    // Busca a tarefa para verificar permissões
    const task = await prisma.task.findUnique({
      where: { id: Number(id) },
    });

    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Tarefa não encontrada',
      });
    }

    // Verifica se o usuário tem permissão para excluir a tarefa
    if (!isAdmin) {
      // Verifica se o usuário é o responsável pela tarefa
      if (task.assignedTo !== userId) {
        return res.status(403).json({
          status: 'error',
          message: 'Você só pode excluir suas próprias tarefas',
        });
      }
    }

    // Primeiro, remove o histórico da tarefa
    await prisma.taskHistory.deleteMany({
      where: { taskId: task.id },
    });

    // Depois remove a tarefa
    await prisma.task.delete({
      where: { id: task.id },
    });

    return res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error: any) {
    console.error('Erro ao deletar tarefa:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        status: 'error',
        message: 'Tarefa não encontrada',
      });
    }
    
    return res.status(500).json({
      status: 'error',
      message: 'Erro ao deletar tarefa',
    });
  }
};
