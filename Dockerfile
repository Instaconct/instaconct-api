# Use node:21-alpine as base image with build tools for bcrypt
FROM node:21-alpine

# Install dependencies required for bcrypt
RUN apk add --no-cache python3 make g++ gcc

WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package.json pnpm-lock.yaml ./

# Copy Prisma schema
COPY prisma ./prisma/

RUN npm install -g pnpm 

RUN pnpm install --frozen-lockfile && pnpm approve-builds


# Copy all source files
COPY . .

# Generate Prisma client
RUN pnpx prisma generate

# Build the application
RUN pnpm run build


EXPOSE 3000

# Start the application
CMD ["pnpm", "run", "start:prod"]
