FROM node:22-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

COPY prisma ./prisma/

RUN npm install -g pnpm 
    
RUN pnpm approve-builds  \ 
    && pnpm install

COPY . .

RUN pnpx prisma generate \ 
    && pnpm run build

EXPOSE 3000

CMD ["pnpm", "run", "start:prod"]
