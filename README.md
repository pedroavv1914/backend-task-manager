# API Gerenciador de Tarefas

API para um sistema de gerenciamento de tarefas com autenticação, times e controle de permissões.

## Tecnologias

- Node.js
- TypeScript
- Express.js
- Prisma (ORM)
- PostgreSQL
- JWT (Autenticação)
- Zod (Validação)
- Jest (Testes)

## Pré-requisitos

- Node.js (v16 ou superior)
- PostgreSQL
- npm ou yarn

## Configuração do Ambiente

1. Clone o repositório:
   ```bash
   git clone <url-do-repositorio>
   cd api-gerenciador-de-tarefas/backend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   - Copie o arquivo `.env.example` para `.env`
   - Edite o arquivo `.env` com as configurações do seu banco de dados

4. Execute as migrações do banco de dados:
   ```bash
   npx prisma migrate dev --name init
   ```

5. Inicialize o usuário administrador:
   ```bash
   npm run init:admin
   ```

## Executando a Aplicação

Para desenvolvimento:
```bash
npm run dev
```

Para produção:
```bash
npm run build
npm start
```

## Estrutura do Projeto

```
src/
├── config/           # Configurações da aplicação
├── controllers/       # Controladores das rotas
├── middlewares/       # Middlewares do Express
├── models/            # Modelos de dados (usando Prisma)
├── routes/            # Definições de rotas
├── services/          # Lógica de negócios
├── types/             # Tipos TypeScript
├── utils/             # Utilitários
└── validations/       # Esquemas de validação
```

## Rotas da API

### Autenticação

- `POST /api/auth/register` - Registrar um novo usuário
- `POST /api/auth/login` - Fazer login

### Usuários

- `GET /api/users` - Listar todos os usuários (apenas admin)
- `GET /api/users/profile` - Obter perfil do usuário autenticado
- `PUT /api/users/profile` - Atualizar perfil do usuário autenticado
- `DELETE /api/users/profile` - Excluir conta do usuário autenticado

### Times

- `POST /api/teams` - Criar um novo time (apenas admin)
- `GET /api/teams` - Listar todos os times
- `GET /api/teams/:id` - Obter um time específico
- `PUT /api/teams/:id` - Atualizar um time (apenas admin)
- `DELETE /api/teams/:id` - Excluir um time (apenas admin)
- `POST /api/teams/:teamId/members` - Adicionar membro ao time (apenas admin)
- `DELETE /api/teams/:teamId/members/:userId` - Remover membro do time (apenas admin)

### Tarefas

- `POST /api/tasks` - Criar uma nova tarefa
- `GET /api/tasks` - Listar todas as tarefas (filtros disponíveis)
- `GET /api/tasks/:id` - Obter uma tarefa específica
- `PUT /api/tasks/:id` - Atualizar uma tarefa
- `PATCH /api/tasks/:id/status` - Atualizar o status de uma tarefa
- `DELETE /api/tasks/:id` - Excluir uma tarefa

## Testes

Para executar os testes:

```bash
npm test
```

## Variáveis de Ambiente

- `PORT` - Porta em que o servidor irá rodar (padrão: 3000)
- `NODE_ENV` - Ambiente de execução (development, production, test)
- `DATABASE_URL` - URL de conexão com o banco de dados PostgreSQL
- `JWT_SECRET` - Chave secreta para assinatura dos tokens JWT
- `JWT_EXPIRES_IN` - Tempo de expiração dos tokens JWT (ex: 1d, 7d)
- `ADMIN_EMAIL` - E-mail do usuário administrador
- `ADMIN_PASSWORD` - Senha do usuário administrador

## Licença

Este projeto está licenciado sob a licença MIT.
