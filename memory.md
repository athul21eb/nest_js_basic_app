# Memory — Better Auth Integration with NestJS & Prisma

Last updated: 2026-08-21 03:16 IST

## What was built

- Installed `better-auth` and `@thallesp/nestjs-better-auth`
- Configured Better Auth instance in [`src/lib/auth/auth.ts`](src/lib/auth/auth.ts) using `prismaAdapter` with PostgreSQL provider
- Configured User `role` additional field with `defaultValue: "PARTICIPANT"` and `input: false` (strictly preventing client-side sign-up role modification)
- Configured `advanced: { disableCSRFCheck: true }` and `trustedOrigins` in [`src/lib/auth/auth.ts`](src/lib/auth/auth.ts) to permit Postman/curl requests
- Updated [`prisma/schema.prisma`](prisma/schema.prisma) with Better Auth models (`User`, `Session`, `Account`, `Verification`) and defined `Role` enum (`PARTICIPANT`, `ADMIN`) with `role Role @default(PARTICIPANT)` on `User`
- Created and executed Prisma migrations `20260820203734_add_better_auth`, `20260820204032_add_account_issuer`, and `20260820212000_change_role_to_enum`
- Regenerated Prisma client to `src/generated/prisma`
- Configured `bodyParser: false` in [`src/main.ts`](src/main.ts) for raw body handling
- Integrated `AuthModule.forRoot({ auth })` in [`src/app.module.ts`](src/app.module.ts)
- Applied `@AllowAnonymous()` decorator on public routes in [`src/app.controller.ts`](src/app.controller.ts)
- Created feature module `UserModule` in [`src/module/user/`](src/module/user/) with:
  - `GET /user/all`: Admin-only endpoint protected by `@UseGuards(AuthGuard)` and `@Roles([Role.ADMIN])`
  - `GET /user/:id`: Protected endpoint retrieving user by ID using `PrismaService` and throwing `NotFoundException` if not found
- Added comprehensive unit tests for `UserService` and `UserController` with ESM support

## Decisions made

- Role permissions: User role defaults to `PARTICIPANT`, with `input: false` ensuring clients cannot elevate privileges or set `ADMIN` during `sign-up` or client inputs.
- Auth infrastructure isolation: Better Auth is configured in `src/lib/auth/` using constructor/adapter injection with Prisma Postgres.
- Authentication strategy: Global `AuthGuard` active by default via `@thallesp/nestjs-better-auth`, protecting endpoints unless explicitly decorated with `@AllowAnonymous()`.
- User module authorization: Used `@UseGuards(AuthGuard)` and `@Roles([Role.ADMIN])` from `@thallesp/nestjs-better-auth` for system-level role enforcement.

## Problems solved

- Resolved Postman 403 `MISSING_OR_NULL_ORIGIN` by setting `advanced: { disableCSRFCheck: true }` in `auth.ts`.
- Added `issuer String?` to `Account` model in `schema.prisma` required by Better Auth 1.7.1 credential account linking.
- Handled raw body parsing requirements by passing `{ bodyParser: false }` to `NestFactory.create()`.
- Configured Jest ESM settings and `@jest/globals` for testing in `"type": "module"` environment.

## Current state

- End-to-end authentication verified:
  - `GET /api/auth/ok` -> `{ ok: true }`
  - `POST /api/auth/sign-up/email` -> Successfully registers user in Postman/curl without requiring manual Origin headers
  - `GET /api/auth/get-session` -> Returns active session and participant user object
- User endpoints active:
  - `GET /user/all` -> Restricted to `ADMIN` users
  - `GET /user/:id` -> Fetches user by ID, returns `404 NotFoundException` when user does not exist
- Full test suite (`pnpm test`) passes (3/3 test suites).
- Full build (`pnpm build`) succeeds with 0 errors.

## Next session starts with

- Implement additional domain feature modules in `src/module/<name>/`.

## Open questions

- What specific endpoints/actions will require `ADMIN` vs `PARTICIPANT` permissions in subsequent feature modules?
