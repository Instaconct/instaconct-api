# Use node:21-alpine as base image with build tools for bcrypt
FROM node:21-alpine


WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package.json pnpm-lock.yaml ./

# Copy Prisma schema
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

EXPOSE 3000

# Start the application in development mode
CMD ["npm", "run", "start:prod"]
