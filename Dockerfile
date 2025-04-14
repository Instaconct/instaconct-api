FROM node:23-slim

# Install OpenSSL and other required dependencies
RUN apt-get update -y && \
    apt-get install -y openssl ca-certificates && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

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
