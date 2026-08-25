# TaskFlow

TaskFlow is a full-stack task management application built as a software engineering practice project.

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose

### Frontend
- React
- JavaScript

### DevOps
- Git
- GitHub
- Docker
- GitHub Actions

## Project Structure

```text
client/     Frontend application
server/     Backend API
docs/       Project documentation
```

## Features Implemented

### Authentication & Authorization
- User Registration & Password Hashing
- JWT-based Login and Session Management
- Protected routes using Authentication Middleware
- Role-based access control (Admin & User roles)
- Robust 401 & 403 error handling

### Task Management (CRUD)
- Create, Read, Update, and Delete tasks
- Tasks are strictly scoped to the authenticated user
- MongoDB integration via Mongoose with structured schemas
- Comprehensive Unit Testing using Jest (Full coverage on controllers and middleware)