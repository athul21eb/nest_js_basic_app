# Memory — Better Auth Integration with NestJS & Prisma

Last updated: 2026-08-21 03:16 IST

## What was built

- Installed `better-auth` and `@thallesp/nestjs-better-auth`
- Configured Better Auth instance in [`src/lib/auth/auth.ts`](src/lib/auth/auth.ts) using `prismaAdapter` with PostgreSQL provider
- Configured User `role` additional field with `defaultValue: "PARTICIPANT"` and `input: false` (strictly preventing client-side sign-up role modification)
- Configured `advanced: { disableCSRFCheck: true }` and `trustedOrigins` in [`src/lib/auth/auth.ts`](src/lib/auth/auth.ts) to permit Postman/curl requests
- Updated [`prisma/schema.prisma`](prisma/schema.prisma) with Better Auth models (`User`, `Session`, `Account`, `Verification`) and defined `Role` enum (`PARTICIPANT`, `ADMIN`) with `role Role @default(PARTICIPANT)` on `User`
- Created and executed Prisma migrations `20260820203734_add_better_auth`, `20260820204032_add_account_issuer`, and `20260820212000_change_role_to_enum`
- Updated [`prisma/schema.prisma`](prisma/schema.prisma) with:
  - `Hackathon`: `id` (UUID), `name`, `description?`, `startDate`, `endDate`, `isActive` (default `true`), `authorId` -> `User` (`onDelete: Cascade`), `participants` -> `HackathonParticipant[]`, `createdAt`, `updatedAt`, mapped to `hackathon`.
  - `HackathonParticipant`: `id` (UUID), `hackathonId` -> `Hackathon`, `userId` -> `User`, `joinedAt` (default `now()`), compound unique `@@unique([hackathonId, userId])`, mapped to `hackathon_participant`.
  - `User`: added `hackathons Hackathon[]` and `hackathonParticipants HackathonParticipant[]`.
- Created and executed Prisma migration `20260821110101_add_hackathon_and_participant`.
- Regenerated Prisma client to `src/generated/prisma`.
- Added scripts `"db:format"`, `"db:migrate"`, and `"db:generate"` to [`package.json`](package.json).
- Installed `class-validator` and `class-transformer` for DTO validation and transformation.
- Configured global `ValidationPipe` in [`src/main.ts`](src/main.ts) with `whitelist: true`, `transform: true`, and custom `exceptionFactory` returning `BadRequestException` with `{ property, message }[]` structure.
- Created `CreateHackathonDto` and `UpdateHackathonDto` in [`src/module/hackathon/dto/`](src/module/hackathon/dto/) with validation rules and date transformations.
- Implemented `HackathonService` in [`src/module/hackathon/hackathon.service.ts`](src/module/hackathon/hackathon.service.ts) with CRUD operations (`create`, `findAll`, `findById`, `update`, `delete`) and author/participant relation inclusion.
- Implemented `HackathonController` in [`src/module/hackathon/hackathon.controller.ts`](src/module/hackathon/hackathon.controller.ts) with:
  - `POST /hackathon`: Protected with `@Roles([Role.ADMIN])`, passes `session.user.id` as authorId, decorated with `@ResponseMessage('Hackathon created successfully')`
  - `POST /hackathon/:id/join`: Protected with `@Roles([Role.PARTICIPANT])`, verifies existence, `isActive`, `endDate`, and duplicate participation via `hackathonId_userId`, decorated with `@ResponseMessage('Successfully joined the hackathon')`
  - `GET /hackathon`: Public / readable by everyone (`@AllowAnonymous()`), decorated with `@ResponseMessage('All hackathons fetched successfully')`
  - `GET /hackathon/:id`: Public / readable by everyone (`@AllowAnonymous()`), decorated with `@ResponseMessage('Hackathon fetched successfully')`
  - `PATCH /hackathon/:id`: Protected with `@Roles([Role.ADMIN])`, decorated with `@ResponseMessage('Hackathon updated successfully')`
  - `DELETE /hackathon/:id`: Protected with `@Roles([Role.ADMIN])`, decorated with `@ResponseMessage('Hackathon deleted successfully')`
- Created `HackathonModule` in [`src/module/hackathon/hackathon.module.ts`](src/module/hackathon/hackathon.module.ts) and registered it in [`src/app.module.ts`](src/app.module.ts).
- Added comprehensive unit tests for `CreateHackathonDto`, `HackathonService` (including join logic & edge cases), and `HackathonController`.

## Decisions made

- Role permissions: User role defaults to `PARTICIPANT`, with `input: false` ensuring clients cannot elevate privileges or set `ADMIN` during `sign-up` or client inputs.
- Auth infrastructure isolation: Better Auth is configured in `src/lib/auth/` using constructor/adapter injection with Prisma Postgres.
- Authentication strategy: Global `AuthGuard` active by default via `@thallesp/nestjs-better-auth`, protecting endpoints unless explicitly decorated with `@AllowAnonymous()`.
- Hackathon authorization: Write endpoints (`POST`, `PATCH`, `DELETE`) are restricted to `Role.ADMIN`, join endpoint (`POST /hackathon/:id/join`) is restricted to `Role.PARTICIPANT`, while read endpoints (`GET /hackathon`, `GET /hackathon/:id`) are accessible to everyone via `@AllowAnonymous()`.
- Author & Participant identification: Injected `@Session() session: UserSession` to attach `session.user.id` as `authorId` or `userId`.
- Entity IDs: Used UUID defaults for `Hackathon` and `HackathonParticipant`.
- Participant constraint: Enforced unique participation per user per hackathon via `@@unique([hackathonId, userId])` and explicit service validation throwing `BadRequestException`.

## Problems solved

- Resolved Postman 403 `MISSING_OR_NULL_ORIGIN` by setting `advanced: { disableCSRFCheck: true }` in `auth.ts`.
- Added `issuer String?` to `Account` model in `schema.prisma` required by Better Auth 1.7.1 credential account linking.
- Handled raw body parsing requirements by passing `{ bodyParser: false }` to `NestFactory.create()`.
- Configured Jest ESM settings and `@jest/globals` for testing in `"type": "module"` environment.

## Current state

- Database schema and generated Prisma client fully in sync with `Hackathon` and `HackathonParticipant` models.
- End-to-end authentication verified.
- Full test suite (`pnpm test`) passes (7/7 test suites, 29 tests).
- Full build (`pnpm build`) succeeds with 0 errors.

## Next session starts with

- Implement leaderboard or project submission modules if required.

## Open questions

- Should participants be able to leave or cancel their hackathon participation?
