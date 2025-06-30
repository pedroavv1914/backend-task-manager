#!/bin/bash

# Script para inicializar o banco de dados e executar migrações

echo "Iniciando o banco de dados com Docker Compose..."
docker-compose up -d

echo "Aguardando o banco de dados ficar pronto..."
until docker-compose exec -T postgres pg_isready -U postgres; do
  sleep 1
done

echo "Executando migrações do Prisma..."
npx prisma migrate dev --name init

echo "Inicializando usuário administrador..."
npm run init:admin

echo "Banco de dados inicializado com sucesso!"
echo "Acesse o pgAdmin em http://localhost:5050"
echo "- Email: admin@admin.com"
echo "- Senha: admin"
echo "Crie uma conexão com o servidor PostgreSQL usando os seguintes dados:"
echo "- Host: postgres"
echo "- Porta: 5432"
echo "- Usuário: postgres"
echo "- Senha: postgres"
echo "- Banco de dados: task_manager"
