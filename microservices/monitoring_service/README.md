---

### 📂 `monitoring_service/README.md`

````md
# Monitoring Service

Collects and analyzes data from other services for reporting and compliance.

## Responsibilities

-   Aggregates academic, demographic, and financial trends.
-   Generates education monitoring reports.
-   Exposes dashboards to authorized users.

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
| DB_NAME        | monitoring_service                       |
| JWT_PUBLIC_KEY | Public key to verify Central Auth tokens |

## Running Locally

```bash
composer install
php artisan serve
```
````
