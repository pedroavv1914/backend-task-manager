import { Request, Response } from 'express';
import { prisma } from '../server';

// Obtém os membros de um time
export const getTeamMembers = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { teamId } = req.params;

    const team = await prisma.team.findUnique({
      where: { id: Number(teamId) },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    if (!team) {
      return res.status(404).json({
        status: 'error',
        message: 'Time não encontrado',
      });
    }

    // Mapeia os membros para um formato mais limpo
    const members = team.members.map((member) => ({
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,
      role: member.user.role,
      joinedAt: member.createdAt,
    }));

    return res.status(200).json({
      status: 'success',
      results: members.length,
      data: {
        members,
      },
    });
  } catch (error: any) {
    console.error('Erro ao buscar membros do time:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Erro ao buscar membros do time',
    });
  }
};

// Cria um novo time
export const createTeam = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name, description, memberIds } = req.body;

    // Validação dos dados de entrada
    if (!name || typeof name !== 'string') {
      return res.status(400).json({
        status: 'error',
        message: 'O nome do time é obrigatório',
      });
    }

    // Inicia uma transação para garantir a integridade dos dados
    const result = await prisma.$transaction(async (prisma) => {
      // Cria o time
      const team = await prisma.team.create({
        data: {
          name,
          description: description || null,
        },
      });

      // Adiciona os membros ao time, se fornecidos
      if (Array.isArray(memberIds) && memberIds.length > 0) {
        // Remove duplicatas e converte para número
        const uniqueMemberIds = [...new Set(memberIds)].map(id => Number(id));
        
        // Cria as associações dos membros com o time
        // Usando createMany com skipDuplicates falso e tratando erros individualmente
        for (const userId of uniqueMemberIds) {
          try {
            await prisma.teamMember.create({
              data: {
                teamId: team.id,
                userId: userId
              }
            });
          } catch (error: any) {
            // Ignora erros de duplicação (código P2002)
            if (error?.code !== 'P2002') {
              throw error;
            }
          }
        }
      }

      // Busca o time com os membros para retornar
      return await prisma.team.findUnique({
        where: { id: team.id },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                },
              },
            },
          },
          _count: {
            select: { members: true, tasks: true },
          },
        },
      });
    });

    return res.status(201).json({
      status: 'success',
      data: {
        team: result,
      },
    });
  } catch (error: any) {
    console.error('Erro ao criar time:', error);
    
    // Tratamento de erros específicos do Prisma
    if (error.code === 'P2002') {
      return res.status(400).json({
        status: 'error',
        message: 'Já existe um time com este nome',
      });
    }
    
    if (error.code === 'P2003') {
      return res.status(400).json({
        status: 'error',
        message: 'Um ou mais usuários não foram encontrados',
      });
    }
    
    return res.status(500).json({
      status: 'error',
      message: 'Erro ao criar time',
    });
  }
};

// Obtém todos os times
export const getTeams = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const teams = await prisma.team.findMany({
      include: {
        _count: {
          select: { members: true, tasks: true },
        },
      },
    });

    return res.status(200).json({
      status: 'success',
      results: teams.length,
      data: {
        teams,
      },
    });
  } catch (error: any) {
    console.error('Erro ao buscar times:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Erro ao buscar times',
    });
  }
};

// Obtém um time específico
export const getTeam = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    const team = await prisma.team.findUnique({
      where: { id: Number(id) },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            createdAt: true,
          },
        },
      },
    });

    if (!team) {
      return res.status(404).json({
        status: 'error',
        message: 'Time não encontrado',
      });
    }

    // Formatar os dados para a resposta
    const formattedTeam = {
      ...team,
      members: team.members.map(member => member.user),
      membersCount: team.members.length,
      tasksCount: team.tasks.length,
    };

    return res.status(200).json({
      status: 'success',
      data: {
        team: formattedTeam,
      },
    });
  } catch (error: any) {
    console.error('Erro ao buscar time:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Erro ao buscar time',
    });
  }
};

// Atualiza um time
export const updateTeam = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const team = await prisma.team.update({
      where: { id: Number(id) },
      data: {
        name,
        description,
      },
    });

    return res.status(200).json({
      status: 'success',
      data: {
        team,
      },
    });
  } catch (error: any) {
    console.error('Erro ao atualizar time:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        status: 'error',
        message: 'Time não encontrado',
      });
    }
    
    return res.status(500).json({
      status: 'error',
      message: 'Erro ao atualizar time',
    });
  }
};

// Deleta um time
export const deleteTeam = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    // Primeiro, remove todos os membros do time
    await prisma.teamMember.deleteMany({
      where: { teamId: Number(id) },
    });

    // Depois remove o time
    await prisma.team.delete({
      where: { id: Number(id) },
    });

    return res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error: any) {
    console.error('Erro ao deletar time:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        status: 'error',
        message: 'Time não encontrado',
      });
    }
    
    return res.status(500).json({
      status: 'error',
      message: 'Erro ao deletar time',
    });
  }
};

// Adiciona um membro ao time
export const addTeamMember = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { teamId } = req.params;
    const { userId } = req.body;

    // Verifica se o usuário já é membro do time
    const existingMember = await prisma.teamMember.findFirst({
      where: {
        teamId: Number(teamId),
        userId: Number(userId),
      },
    });

    if (existingMember) {
      return res.status(400).json({
        status: 'error',
        message: 'Este usuário já é membro do time',
      });
    }

    // Adiciona o usuário ao time
    const teamMember = await prisma.teamMember.create({
      data: {
        teamId: Number(teamId),
        userId: Number(userId),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return res.status(201).json({
      status: 'success',
      data: {
        member: teamMember.user,
      },
    });
  } catch (error: any) {
    console.error('Erro ao adicionar membro ao time:', error);
    
    if (error.code === 'P2003') {
      return res.status(404).json({
        status: 'error',
        message: 'Time ou usuário não encontrado',
      });
    }
    
    return res.status(500).json({
      status: 'error',
      message: 'Erro ao adicionar membro ao time',
    });
  }
};

// Remove um membro do time
export const removeTeamMember = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { teamId, userId } = req.params;

    // Remove o usuário do time
    await prisma.teamMember.deleteMany({
      where: {
        teamId: Number(teamId),
        userId: Number(userId),
      },
    });

    return res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error: any) {
    console.error('Erro ao remover membro do time:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Erro ao remover membro do time',
    });
  }
};
