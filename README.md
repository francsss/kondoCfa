# Kondo V1 Clean

Kondo is a clean Next.js 14 MVP for Cameroon-to-China money transfer operations. Senders pay in FCFA through mock Orange Money or MTN Mobile Money providers. Admins manually complete the equivalent CNY payout through Alipay outside the platform, then mark the transfer as successful.

## Tech Stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL with Docker Compose
- Zod validation
- bcryptjs password hashing
- Custom JWT auth with httpOnly cookies
- Vitest unit tests

## Local Setup

Use Node.js 20 or newer.

```bash
cd kondo-v1-clean
cp .env.example .env
# set JWT_SECRET to a long random value
docker compose up -d
npm install
npx prisma generate
npx prisma db push --force-reset
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo Accounts

All demo users use:

```text
ChangeMe123!
```

- `sender@example.com` - SENDER
- `sender2@example.com` - SENDER
- `admin@example.com` - ADMIN
- `superadmin@example.com` - SUPER_ADMIN

`SUPER_ADMIN` users can create and manage `ADMIN` accounts from `/admin/admins`.

## Demo Flow

1. Log in as `sender@example.com`.
2. Open **Nouveau transfert**.
3. Enter an FCFA amount. The quote preview updates automatically after a short debounce.
4. Choose Orange Money or MTN Mobile Money.
5. Enter beneficiary name and Alipay ID.
6. Confirm payment. The mock provider confirms by default and the transfer becomes `IN_PROGRESS`.
7. Log in as `admin@example.com`.
8. Open `/admin/operations`.
9. Open the transfer, enter an Alipay reference, and click **Marquer comme réussi**.
10. The sender detail page polls every 5 seconds and shows `Réussi`.

## Transfer Statuses

Kondo V1 intentionally uses only four statuses:

- `CREATED` - Créé
- `IN_PROGRESS` - En cours
- `CANCELLED` - Annulé
- `SUCCESS` - Réussi

## Roles

- `SENDER`: can register, log in, create transfers, and view/manage only their own transfers.
- `ADMIN`: can access admin dashboards, view all transfers, mark payment received, complete Alipay payout, cancel transfers, update settings, and view audit logs.
- `SUPER_ADMIN`: can do everything an admin can do.

## Useful Commands

```bash
npm test
npm run typecheck
npm run build
```

## Configuration

Default quote settings live in `src/config/rate-tiers.ts` and are seeded into the `AppSetting` table. Admins can edit the active settings from `/admin/settings`.

The provided logo is available at `public/kondo-logo.png`. Replacing that file updates the `KondoLogo` component across the app.
