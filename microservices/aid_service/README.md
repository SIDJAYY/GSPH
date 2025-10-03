# Aid Service

Handles disbursement of approved scholarships and records fund usage.

## Responsibilities

-   Receives details of approved scholars from Scholarship Service.
-   Updates disbursement records linked to `citizenID`.
-   Provides data for Monitoring Service.

## Tech Stack

-   Laravel
-   MySQL

## Environment Variables

| Name           | Description                              |
| -------------- | ---------------------------------------- |
| DB_HOST        | 127.0.0.1                                |
| DB_PORT        | 3306                                     |
| DB_USER        | root                                     |
| DB_PASSWORD    |                                          |
| DB_NAME        | aid_service                              |
| JWT_PUBLIC_KEY | Public key to verify Central Auth tokens |

## Running Locally

```bash
composer install
php artisan serve
```
