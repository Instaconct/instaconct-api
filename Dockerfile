# Use node:21-alpine as base image with build tools for bcrypt
FROM node:21-alpine

WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package.json pnpm-lock.yaml ./

# Copy Prisma schema
COPY prisma ./prisma/

RUN npm install -g pnpm 

RUN corepack enable && \
    pnpm config set allow-build bcrypt prisma @nestjs/core @prisma/engines
    
# Approve builds for dependencies that need to run scripts
RUN pnpm install --frozen-lockfile && \
    pnpm approve-builds

# Copy all source files
COPY . .

ENV NODE_OPTIONS="--max-old-space-size=4096"

# Generate Prisma client
RUN pnpx prisma generate

# Build the application
RUN pnpm run build

# Verify the build output exists
RUN ls -la dist/

EXPOSE 3000

# Make sure we're using the correct start command that matches your package.json
# If you want to use start:dev, keep this line
CMD ["pnpm", "run", "start:dev"]

# If you want to use start:prod, use this line instead
# CMD ["pnpm", "run", "start:prod"]
