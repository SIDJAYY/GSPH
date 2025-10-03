# GSM Scholarship Management System - Module Description

## System Architecture Overview

The GSM (Government Scholarship Management) system is built using a microservices architecture with a React.js frontend and multiple PHP-based backend services. The system is designed to handle scholarship applications, management, and distribution for the City Government of Caloocan.

## Frontend Module (GSM/)

### Core Components

- **React Application**: Built with Vite, TypeScript, and Tailwind CSS
- **Routing**: React Router for navigation and protected routes
- **State Management**: Zustand for global state management
- **UI Components**: Custom reusable components with Lucide React icons

### Key Pages

- **GatewayLogin**: Main entry point for students
- **Portal**: Student dashboard after login
- **NewApplicationForm**: Scholarship application form
- **RenewalForm**: Application renewal process
- **ScholarshipDashboard**: Application status and tracking
- **Admin Panel**: Administrative interface for staff

### Authentication System

- **v1authStore**: Primary authentication store using Zustand
- **ProtectedRoute**: Route protection component
- **Role-based Access**: Student, Admin, and Staff roles

## Backend Microservices

### 1. Auth Registry Service (`microservices/auth_registry/`)

**Purpose**: User authentication and student registration management

**Key Features**:

- User registration and login
- Student profile management
- Role-based access control
- JWT token generation and validation
- Student database operations

**Technology Stack**:

- PHP Laravel framework
- MySQL database
- Sanctum for API authentication
- CORS configuration for cross-origin requests

**API Endpoints**:

- `/api/register` - User registration
- `/api/login` - User authentication
- `/api/students` - Student management
- `/api/profile` - User profile operations

### 2. Partner School Service (`microservices/partner_school/`)

**Purpose**: Management of partner educational institutions

**Key Features**:

- School registration and management
- School-student relationship tracking
- Institution verification
- School performance metrics

**Technology Stack**:

- PHP Laravel framework
- SQLite database
- RESTful API design
- School data validation

**API Endpoints**:

- `/api/schools` - School management
- `/api/partnerships` - Partnership tracking
- `/api/verification` - School verification

### 3. School Aid Service (`microservices/school_aid/`)

**Purpose**: Financial aid distribution and management

**Key Features**:

- Scholarship fund allocation
- Payment processing
- Disbursement tracking
- Financial reporting
- Application status management

**Technology Stack**:

- PHP Laravel framework
- MySQL database
- Payment gateway integration
- Financial transaction logging

**API Endpoints**:

- `/api/applications` - Application management
- `/api/payments` - Payment processing
- `/api/disbursements` - Fund distribution
- `/api/reports` - Financial reporting

## API Integration Module (`GSM/api/`)

### Chatbot Service

**Purpose**: AI-powered customer support using Google Dialogflow

**Key Features**:

- Natural language processing
- Automated responses to common queries
- Fallback handling for unrecognized queries
- Integration with scholarship database

**Technology Stack**:

- Node.js with Express
- Google Dialogflow API
- Google Cloud credentials
- CORS middleware

**API Endpoints**:

- `/api/chat` - Chatbot interaction
- `/api/fallback` - Fallback responses

## Database Schema

### Auth Registry Database

- **users**: User authentication data
- **students**: Student profile information
- **roles**: User role definitions
- **permissions**: Access control permissions

### Partner School Database

- **schools**: Educational institution data
- **partnerships**: School-student relationships
- **verifications**: School verification status

### School Aid Database

- **applications**: Scholarship applications
- **payments**: Financial transactions
- **disbursements**: Fund distribution records
- **programs**: Scholarship program definitions

## Configuration Management

### Frontend Configuration

- **Vite Config**: Build and development settings
- **Tailwind Config**: CSS framework configuration
- **TypeScript Config**: Type checking and compilation
- **ESLint Config**: Code quality and style rules

### Backend Configuration

- **Laravel Config**: Framework and service configuration
- **Database Config**: Connection and migration settings
- **API Config**: Endpoint and authentication settings
- **CORS Config**: Cross-origin request handling

## Security Implementation

### Authentication & Authorization

- JWT token-based authentication
- Role-based access control (RBAC)
- Session management and timeout
- Password hashing and validation

### Data Protection

- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF token validation
- Encrypted data transmission (HTTPS)

### API Security

- Rate limiting
- Request validation
- Error handling without information leakage
- Secure headers configuration

## Deployment Architecture

### Frontend Deployment

- **Vercel**: Primary hosting platform
- **Build Process**: Vite-based production builds
- **CDN**: Global content delivery
- **Environment Variables**: Secure configuration management

### Backend Deployment

- **Microservices**: Independent deployment units
- **Database**: Separate database instances per service
- **API Gateway**: Centralized API management
- **Load Balancing**: High availability configuration

## Integration Points

### Frontend-Backend Communication

- RESTful API calls using Axios
- JWT token management
- Error handling and user feedback
- Real-time status updates

### Microservice Communication

- HTTP-based service-to-service communication
- Shared authentication tokens
- Data consistency across services
- Event-driven architecture for updates

### External Integrations

- Google Dialogflow for AI chatbot
- Email services for notifications
- Payment gateways for financial transactions
- School information systems

## Development Workflow

### Frontend Development

- Component-based architecture
- TypeScript for type safety
- Tailwind CSS for styling
- React Router for navigation
- Zustand for state management

### Backend Development

- Laravel framework for rapid development
- Eloquent ORM for database operations
- API resource classes for data formatting
- Middleware for cross-cutting concerns
- Service classes for business logic

### Testing Strategy

- Unit tests for individual components
- Integration tests for API endpoints
- End-to-end tests for user workflows
- Performance testing for scalability
- Security testing for vulnerability assessment
