# Database Setup Guide

This guide will help you set up fresh migrations and seeders for both the Auth Service and Scholarship Service to ensure they match properly.

## 🚀 Quick Setup

### Option 1: Automated Setup (Recommended)

**For Windows:**

```bash
setup-databases.bat
```

**For Linux/Mac:**

```bash
./setup-databases.sh
```

### Option 2: Manual Setup

Follow the steps below to set up each service manually.

## 📋 Prerequisites

- PHP 8.1 or higher
- Composer
- MySQL or SQLite
- Laravel Artisan

## 🔐 Auth Service Setup

### 1. Navigate to Auth Service

```bash
cd microservices/auth_service
```

### 2. Clear Old Migrations

```bash
# Remove old migration files
rm database/migrations/0001_01_01_000000_create_users_table.php
rm database/migrations/0001_01_01_000001_create_cache_table.php
rm database/migrations/0001_01_01_000002_create_jobs_table.php
rm database/migrations/2025_09_10_191123_create_personal_access_tokens_table.php
```

### 3. Run Fresh Migrations

```bash
php artisan migrate:fresh --force
```

### 4. Seed the Database

```bash
php artisan db:seed --force
```

### 5. Start the Service

```bash
php artisan serve --port=8000
```

## 🎓 Scholarship Service Setup

### 1. Navigate to Scholarship Service

```bash
cd microservices/scholarship_service
```

### 2. Clear Old Migrations

```bash
# Remove old migration files
rm database/migrations/0001_01_01_000000_create_users_table.php
rm database/migrations/0001_01_01_000001_create_cache_table.php
rm database/migrations/0001_01_01_000002_create_jobs_table.php
```

### 3. Run Fresh Migrations

```bash
php artisan migrate:fresh --force
```

### 4. Seed the Database

```bash
php artisan db:seed --force
```

### 5. Start the Service

```bash
php artisan serve --port=8003
```

## 🗄️ Database Schema Overview

### Auth Service Tables

- `users` - User authentication and basic info
- `students` - Student profiles linked to users
- `personal_access_tokens` - API tokens for authentication

### Scholarship Service Tables

- `students` - Student profiles (linked to auth service)
- `addresses` - Student addresses (present, permanent, school)
- `family_members` - Family member information
- `financial_information` - Financial need assessment
- `schools` - Partner school database
- `academic_records` - Academic performance tracking
- `scholarship_categories` - Scholarship program categories
- `scholarship_subcategories` - Specific scholarship programs
- `scholarship_applications` - Application records
- `document_types` - Document type definitions
- `documents` - Document management
- `application_status_history` - Status change tracking
- `scholarship_awards` - Award management
- `payments` - Payment tracking

## 🌱 Seeded Data

### Auth Service

- **Admin User**: admin@caloocan.gov.ph / admin123
- **Staff User**: staff@caloocan.gov.ph / staff123
- **Test Student**: student@example.com / student123

### Scholarship Service

- **4 Scholarship Categories** with subcategories
- **10 Partner Schools** (LUCs, SUCs, Private)
- **8 Document Types** (personal, academic, financial)

## 🧪 Testing the Setup

### 1. Test Service Health

```bash
# Test Auth Service
curl http://localhost:8000/api/health

# Test Scholarship Service
curl http://localhost:8003/api/health
```

### 2. Test Frontend Integration

```bash
cd GSM
node test-scholarship-connection.js
```

### 3. Test Form Submission

1. Start the frontend: `npm run dev`
2. Navigate to the new application form
3. Fill out and submit a test application

## 🔧 Troubleshooting

### Common Issues

**1. Migration Errors**

- Ensure database is properly configured in `.env`
- Check if old migration files are completely removed
- Verify Laravel version compatibility

**2. Seeder Errors**

- Check if all required models exist
- Verify foreign key relationships
- Ensure database is empty before seeding

**3. Service Connection Issues**

- Verify services are running on correct ports
- Check firewall settings
- Ensure CORS is properly configured

**4. Frontend Integration Issues**

- Verify API endpoints are accessible
- Check browser console for errors
- Ensure all required environment variables are set

### Reset Everything

If you need to completely reset:

```bash
# Auth Service
cd microservices/auth_service
php artisan migrate:fresh --force
php artisan db:seed --force

# Scholarship Service
cd ../scholarship_service
php artisan migrate:fresh --force
php artisan db:seed --force
```

## 📊 Verification Checklist

- [ ] Auth Service running on port 8000
- [ ] Scholarship Service running on port 8003
- [ ] All migrations completed successfully
- [ ] All seeders executed without errors
- [ ] Health endpoints responding
- [ ] Frontend can connect to services
- [ ] Form submission works end-to-end

## 🎯 Next Steps

1. **Test the complete flow** from frontend to database
2. **Verify data integrity** across services
3. **Test authentication** flow
4. **Validate form submissions** create proper records
5. **Check API responses** match frontend expectations

## 📞 Support

If you encounter issues:

1. Check the logs in `storage/logs/`
2. Verify database connections
3. Ensure all services are running
4. Check for any missing dependencies
