FROM node:23-slim

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

COPY prisma ./prisma/

RUN npm install -g pnpm 

RUN pnpm install  \ 
    && pnpm approve-builds

COPY . .

RUN pnpx prisma generate \ 
    && pnpm run build

EXPOSE 3000

CMD ["pnpm", "run", "start:prod"]
