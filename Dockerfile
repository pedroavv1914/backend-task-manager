# Etapa de construção
FROM node:18-alpine AS builder

WORKDIR /app

# Instala as dependências de produção e desenvolvimento
COPY package*.json ./
RUN npm ci

# Copia o restante do código
COPY . .

# Gera o cliente Prisma
RUN npx prisma generate

# Compila o TypeScript
RUN npm run build

# Remove as dependências de desenvolvimento
RUN npm prune --production

# Etapa de produção
FROM node:18-alpine

WORKDIR /app

# Copia as dependências de produção e o código compilado
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Expõe a porta da aplicação
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["node", "dist/server.js"]
