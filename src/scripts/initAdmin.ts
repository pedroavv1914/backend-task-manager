import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  // Verifica se já existe um usuário admin
  const existingAdmin = await prisma.user.findFirst({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('Usuário admin já existe');
    return;
  }

  // Criptografa a senha
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  // Cria o usuário admin
  const admin = await prisma.user.create({
    data: {
      name: 'Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN' as const,
    },
  });

  console.log('Usuário admin criado com sucesso:', {
    email: admin.email,
    role: admin.role,
  });
}

main()
  .catch((e) => {
    console.error('Erro ao criar usuário admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
