# 🗂️ STRATIX - Task Manager API

<p align="center">
  <img src="https://img.shields.io/github/workflow/status/pedroavv1914/api-gerenciador-de-tarefas/CI" alt="Build Status" />
  <img src="https://img.shields.io/codecov/c/github/pedroavv1914/api-gerenciador-de-tarefas" alt="Coverage" />
  <img src="https://img.shields.io/github/license/pedroavv1914/api-gerenciador-de-tarefas" alt="License" />
  <img src="https://img.shields.io/github/package-json/v/pedroavv1914/api-gerenciador-de-tarefas" alt="Version" />
</p>

🔗 A robust, secure, and efficient RESTful API for managing tasks, built with Node.js, Express, TypeScript, and Prisma ORM. Designed to work seamlessly with the Task Manager Frontend.

---

![Architecture Diagram](https://user-images.githubusercontent.com/your-username/diagram-stratix-api.png)
<sub>*Client ↔️ API ↔️ Database — Secure JWT authentication, modular services, scalable design*</sub>

---

## 📋 Table of Contents
- [✨ Features](#features)
- [🛠️ Technologies Used](#technologies-used)
- [🏗️ Project Structure](#project-structure)
- [🚀 Getting Started](#getting-started)
- [🔐 Environment Variables](#environment-variables)
- [📡 API Endpoints](#api-endpoints)
- [📬 API Examples](#api-examples)
- [🔑 Authentication Flow](#authentication-flow)
- [📖 Swagger / OpenAPI](#swagger--openapi)
- [🧪 Running Tests](#running-tests)
- [❓ FAQ](#faq)
- [🗺️ Roadmap](#roadmap)
- [🙏 Credits & Thanks](#credits--thanks)
- [🤝 Contributing](#contributing)

## ✨ Features

- 📝 **Full CRUD for Tasks**
  - Create, read, update, and delete tasks with validation.
- 👤 **User Authentication & Authorization**
  - Secure registration and login with JWT.
  - Password hashing with bcrypt.
- 🔒 **Security**
  - Environment variable management, CORS, and input sanitization.
- 📅 **Advanced Task Features**
  - Due dates, priorities, and categories.
  - Filtering, sorting, and pagination.
- 📊 **Statistics & Analytics**
  - Endpoints for user and task statistics.
- 🧩 **Modular Architecture**
  - Separation of controllers, services, routes, and middlewares.
- 🐳 **Docker Support**
  - Dockerfile and docker-compose for easy setup and deployment.
- 🧪 **Testing**
  - Comprehensive unit and integration tests with Jest.

## 🛠️ Technologies Used

- ![Node.js](https://img.shields.io/badge/-Node.js-339933?logo=node.js&logoColor=white) **Node.js** — JavaScript runtime for scalable backend.
- ![Express](https://img.shields.io/badge/-Express-000000?logo=express&logoColor=white) **Express** — Minimal, flexible framework for robust APIs.
- ![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white) **TypeScript** — Type safety and modern JS features.
- ![Prisma ORM](https://img.shields.io/badge/-Prisma-2D3748?logo=prisma&logoColor=white) **Prisma** — Next-generation ORM for PostgreSQL, MySQL, SQLite, etc.
- ![JWT](https://img.shields.io/badge/-JWT-000000?logo=json-web-tokens&logoColor=white) **JWT** — Secure authentication tokens.
- ![Jest](https://img.shields.io/badge/-Jest-C21325?logo=jest&logoColor=white) **Jest** — Testing framework for robust code.
- ![Docker](https://img.shields.io/badge/-Docker-2496ED?logo=docker&logoColor=white) **Docker** — Containerization for easy deployment.
- ![ESLint](https://img.shields.io/badge/-ESLint-4B32C3?logo=eslint&logoColor=white) **ESLint & Prettier** — Code quality and formatting.

## 🏗️ Project Structure
```
backend/
├── prisma/                 # Prisma schema and migrations
├── scripts/                # Helper scripts
├── src/
│   ├── controllers/        # Route controllers
│   ├── middlewares/        # Express middlewares (auth, error, etc.)
│   ├── models/             # Prisma models
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── utils/              # Utility functions
│   ├── server.ts           # API entry point
│   └── ...
├── tests/                  # Jest test suite
├── docker-compose.yml      # Docker configuration
├── package.json            # Project metadata and dependencies
└── ...
```

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/pedroavv1914/api-gerenciador-de-tarefas.git
   cd api-gerenciador-de-tarefas/backend
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Configure environment variables**
   - Copy `.env.example` to `.env` and adjust as needed.
4. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```
5. **Start the development server**
   ```bash
   npm run dev
   ```
6. **API will be available at**
   ```
   http://localhost:3000
   ```

## 🔐 Environment Variables

The main environment variables required are:
```
DATABASE_URL=...         # Prisma database connection string
JWT_SECRET=...           # Secret for JWT authentication
PORT=3000                # API port (default: 3000)
```
See `.env.example` for all options.

## 📡 API Endpoints

- `POST   /auth/register` — Register a new user
- `POST   /auth/login` — Authenticate user and receive JWT
- `GET    /tasks` — List all tasks (with filters and pagination)
- `POST   /tasks` — Create a new task
- `GET    /tasks/:id` — Get task details
- `PUT    /tasks/:id` — Update a task
- `DELETE /tasks/:id` — Delete a task

> For full API documentation, see the OpenAPI/Swagger docs if available or check the `src/routes` folder.

---

## 📬 API Examples

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "Pedro",
  "email": "pedro@email.com",
  "password": "strongpassword"
}
```
**Response:**
```json
{
  "id": "clxyz...",
  "name": "Pedro",
  "email": "pedro@email.com"
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "pedro@email.com",
  "password": "strongpassword"
}
```
**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
}
```

### Get All Tasks (with JWT)
```http
GET /tasks
Authorization: Bearer <JWT_TOKEN>
```
**Response:**
```json
[
  {
    "id": 1,
    "title": "Finish README",
    "status": "in-progress",
    "dueDate": "2025-07-06",
    ...
  }
]
```

---

## 🔑 Authentication Flow

1. **User registers** via `/auth/register` → credentials stored securely (password hashed).
2. **User logs in** via `/auth/login` → receives JWT token.
3. **Frontend stores token** (localStorage/cookie).
4. **Authenticated requests**: Frontend sends `Authorization: Bearer <JWT_TOKEN>` header to access protected endpoints.
5. **Backend validates** token on every request, attaches user info to context.

```
[Client] → [POST /auth/login] → [API validates, returns JWT] → [Client stores JWT] → [Client requests /tasks with JWT] → [API validates JWT, returns data]
```

---

## 📖 Swagger / OpenAPI

- **Interactive API docs** available at: `http://localhost:3000/docs` (if enabled)
- Or generate docs with:
  ```bash
  npm run swagger:generate
  ```
- See `src/routes` and `src/docs` for OpenAPI definitions.

---

## ❓ FAQ

**Q: The API won't start, what should I check?**
- A: Ensure your `.env` is configured and the database is running (see `docker-compose.yml`).

**Q: How do I reset the database?**
- A: Run `npx prisma migrate reset` (this will erase all data).

**Q: How do I get a valid JWT token?**
- A: Register, then login via `/auth/login` and use the returned token in `Authorization` headers.

---

## 🗺️ Roadmap

- [x] CRUD for tasks
- [x] User authentication (JWT)
- [x] Docker support
- [x] Testing with Jest
- [ ] Email notifications
- [ ] Task attachments (files)
- [ ] Full OpenAPI docs
- [ ] Admin dashboard

---

## 🙏 Credits & Thanks

- [Express](https://expressjs.com/)
- [Prisma](https://www.prisma.io/)
- [TypeScript](https://www.typescriptlang.org/)
- [Jest](https://jestjs.io/)
- [Docker](https://www.docker.com/)
- [Shields.io](https://shields.io/) for badges
- Thanks to the open source community and all contributors!

---

## 🧪 Running Tests

- **Run all tests:**
  ```bash
  npm test
  ```
- **Watch mode:**
  ```bash
  npm run test:watch
  ```
- **Coverage report:**
  ```bash
  npm run test:coverage
  ```

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

Made with ❤️ by Pedro
