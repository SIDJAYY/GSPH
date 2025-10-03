---

### 📂 `auth_service/README.md` (dev only)

````md
# Auth Service (Development Stub)

This is a **stubbed version of Central Auth** for development and testing only.

## Responsibilities

-   Issues JWT access tokens with `isCitizen` and `roles`.
-   Allows creating/updating users with `is_citizen` flag in local DB.

## Tech Stack

-   Laravel
-   MySQL

## Environment Variables

| Name        | Description            |
| ----------- | ---------------------- |
| DB_HOST     | 127.0.0.1              |
| DB_PORT     | 3306                   |
| DB_USER     | root                   |
| DB_PASSWORD |                        |
| DB_NAME     | auth_service           |
| JWT_SECRET  | Secret for signing JWT |

## Running Locally

```bash
composer install
php artisan serve
```
````
