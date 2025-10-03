---

### 📂 `scholarship_service/README.md`

````md
# Scholarship Service

A comprehensive scholarship management system that handles scholarship applications, student registry, school affiliation validation, and financial tracking for the City Government of Caloocan.

## Responsibilities

-   **Student Management**: Complete student profiles with personal, academic, and financial information
-   **Scholarship Applications**: New and renewal application processing with comprehensive form fields
-   **School Validation**: Partner school database and validation system
-   **Document Management**: Secure file upload and verification system
-   **Financial Tracking**: Award management and payment processing
-   **Status Tracking**: Complete audit trail of application status changes

## Features

### Student Management

-   Comprehensive personal information (demographics, contact, family)
-   Multiple address types (present, permanent, school)
-   Family member information with income tracking
-   Financial information and need assessment
-   Academic records and performance tracking

### Scholarship Applications

-   New and renewal application types
-   Multiple scholarship categories and subcategories
-   Comprehensive form fields matching the original system
-   Status workflow (draft → submitted → under_review → approved/rejected)
-   Application number generation and tracking

### Document Management

-   Secure file upload and storage
-   Document type categorization
-   Verification workflow
-   Required document tracking

### School Management

-   Partner school database
-   School classification system
-   Contact and location information

## Database Schema

The service includes the following main tables:

-   `students` - Student personal information
-   `addresses` - Multiple address types per student
-   `family_members` - Family member information
-   `financial_information` - Financial need assessment
-   `schools` - Partner school database
-   `academic_records` - Academic performance tracking
-   `scholarship_categories` - Scholarship program categories
-   `scholarship_subcategories` - Specific scholarship programs
-   `scholarship_applications` - Application records
-   `documents` - Document management
-   `document_types` - Document type definitions
-   `application_status_history` - Status change tracking
-   `scholarship_awards` - Award management
-   `payments` - Payment tracking

## Tech Stack

-   **Backend**: Laravel 12
-   **Database**: MySQL 8.0+
-   **Authentication**: JWT tokens from auth service
-   **File Storage**: Laravel Storage (configurable)

## Environment Variables

| Name            | Description                              |
| --------------- | ---------------------------------------- |
| DB_HOST         | 127.0.0.1                                |
| DB_PORT         | 3306                                     |
| DB_USER         | root                                     |
| DB_PASSWORD     |                                          |
| DB_NAME         | scholarship_service                      |
| JWT_PUBLIC_KEY  | Public key to verify Central Auth tokens |
| FILESYSTEM_DISK | public (for file storage)                |

## API Endpoints

### Public Endpoints

-   `GET /api/public/schools` - Get list of partner schools
-   `GET /api/public/scholarship-categories` - Get scholarship categories
-   `GET /api/public/document-types` - Get document types
-   `GET /api/public/required-documents` - Get required documents

### Student Management

-   `GET /api/students` - List students
-   `POST /api/students` - Create student
-   `GET /api/students/{id}` - Get student details
-   `PUT /api/students/{id}` - Update student
-   `DELETE /api/students/{id}` - Delete student

### Scholarship Applications

-   `GET /api/applications` - List applications
-   `POST /api/applications` - Create application
-   `GET /api/applications/{id}` - Get application details
-   `PUT /api/applications/{id}` - Update application
-   `DELETE /api/applications/{id}` - Delete application
-   `POST /api/applications/{id}/submit` - Submit application
-   `POST /api/applications/{id}/approve` - Approve application
-   `POST /api/applications/{id}/reject` - Reject application

### Form Integration

-   `POST /api/forms/new-application` - Complete new application form
-   `POST /api/forms/renewal-application` - Complete renewal application form
-   `POST /api/forms/upload-document` - Upload document

### Statistics

-   `GET /api/stats/overview` - System overview statistics
-   `GET /api/stats/applications/by-status` - Application status counts
-   `GET /api/stats/applications/by-type` - Application type counts

## Running Locally

1. **Install Dependencies**

    ```bash
    composer install
    ```

2. **Environment Setup**

    ```bash
    cp .env.example .env
    php artisan key:generate
    ```

3. **Database Setup**

    ```bash
    # Create database
    mysql -u root -p -e "CREATE DATABASE scholarship_service;"

    # Run migrations
    php artisan migrate

    # Seed initial data
    php artisan db:seed
    ```

4. **Start Server**
    ```bash
    php artisan serve
    ```

## Testing

The service includes comprehensive API endpoints that can be tested using tools like Postman or curl. All endpoints return JSON responses with consistent success/error formatting.

## Integration

This service integrates with:

-   **Auth Service**: For user authentication and authorization
-   **Aid Service**: For financial disbursement after approval
-   **Monitoring Service**: For reporting and analytics

## System Flow

Based on the BPA diagram, the system follows this flow:

1. Student applies through Scholarship Application Portal
2. Student profile is created/retrieved in Student Registry
3. School affiliation is validated against Partner School Database
4. Application is processed and status tracked
5. Approved applications are sent to Aid Service for disbursement
6. All activities are monitored and reported
````
