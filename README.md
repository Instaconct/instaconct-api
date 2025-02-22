# InstaConnect - Customer Support Chat System

[![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?logo=Prisma&logoColor=white)](https://www.prisma.io/)
[![MySQL](https://img.shields.io/badge/MySQL-005C84?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Redis](https://img.shields.io/badge/Redis-%23DD0031.svg?logo=redis&logoColor=white)](https://redis.io/)

InstaConnect is a modern customer support chat system designed to facilitate real-time communication between businesses and their customers. Built with NestJS, it features WebSocket-based chat, ticketing system, organization management, and robust authentication.

## Features

- **Real-time Messaging**: WebSocket-based chat with typing indicators
- **Ticket Management**: Create, track, and close support tickets
- **Authentication**:
  - JWT-based authentication with access/refresh tokens
  - Email verification and password reset flows
  - Role-based access control (RBAC)
- **Organization Management**: 
  - Multiple organizations with SDK integration
  - Team member management (Super Managers, Managers, Agents)
- **Email System**:
  - Queue-based email sending with retry logic
  - Templates for verification and password reset
- **WebSocket API**: Fully documented with AsyncAPI
- **Redis Integration**: Caching and queue management
- **Prisma ORM**: Type-safe database access

## Tech Stack

- **Backend**: NestJS
- **Database**: MySQL (Prisma ORM)
- **Cache/Queue**: Redis (BullMQ)
- **Auth**: JWT, bcrypt
- **Real-time**: Socket.io
- **Email**: Nodemailer with Handlebars templates
- **Validation**: class-validator, class-transformer
- **Testing**: Jest (unit/e2e)

## Getting Started

### Prerequisites

- Node.js v18+
- pnpm
- Docker & Docker Compose
- MySQL database

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Instaconct/instaconct-api.git
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp ENV_EXAMPLE .env
   ```
   Update the `.env` file with your credentials

4. Start dependencies:
   ```bash
   docker-compose up -d
   ```

5. Database setup:
   ```bash
   pnpm prisma migrate dev
   pnpm prisma db seed
   ```

### Running the Server

- Development mode:
  ```bash
  pnpm run start:dev
  ```

- Production mode:
  ```bash
  pnpm build
  pnpm start:prod
  ```

## API Documentation

### REST API
Explore API endpoints using Postman or Swagger (TBD)

### WebSocket API
AsyncAPI documentation available in `asyncapi.yaml`. Generate HTML docs using:
```bash
npx @asyncapi/generator asyncapi.yaml @asyncapi/html-template -o docs
```

## Environment Variables

| Variable                     | Description                                  |
|------------------------------|----------------------------------------------|
| `DATABASE_URL`               | MySQL connection string                     |
| `REDIS_HOST`                 | Redis host address                          |
| `REDIS_PORT`                 | Redis port                                  |
| `JWT_SECRET`                 | Secret for access tokens                   |
| `JWT_EXPIRATION_TIME`        | Access token expiration time               |
| `JWT_REFRESH_SECRET`         | Secret for refresh tokens                  |
| `JWT_REFRESH_EXPIRATION_TIME`| Refresh token expiration time              |
| `MAIL_HOST`                  | Email service provider                     |
| `USER_EMAIL`                 | Email account for sending messages         |
| `EMAIL_PASS`                 | Email account password/app-specific password|
| `DEFAULT_VERIFY_URL`         | Base URL for verification links            |

## Testing

Run unit tests:
```bash
pnpm test
```

Run e2e tests:
```bash
pnpm test:e2e
```

## Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Omar Sabra - [omarsabra509@gmail.com](mailto:omarsabra509@gmail.com)

Project Link: [https://github.com/yourusername/instaconnect](https://github.com/yourusername/instaconnect)
