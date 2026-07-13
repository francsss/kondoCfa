# Kondo Admin Management

## 1. Role Model

Kondo V1 exposes only three roles:

- `SUPER_ADMIN`
- `ADMIN`
- `SENDER`

No OPS or compliance roles are used in V1.

## 2. Public Registration Creates Only SENDER

The public `/register` form has no role selector. The API route `POST /api/auth/register` always assigns `SENDER` on the server and ignores any role sent by the client payload.

## 3. Only SUPER_ADMIN Can Create ADMIN

Only users with role `SUPER_ADMIN` can access `/admin/admins` and call the admin-management APIs.

Supported APIs:

- `GET /api/admin/admins`
- `POST /api/admin/admins`
- `PATCH /api/admin/admins/[id]/status`

New admin users are created with role `ADMIN`. The UI does not create `SUPER_ADMIN` accounts.

## 4. ADMIN Cannot Create Other ADMIN Accounts

`ADMIN` users can access normal operations pages, but cannot see the Admins navigation item and receive `403` from admin-management endpoints.

`SENDER` users cannot access admin-management endpoints.

## 5. How To Create An Admin From The Dashboard

1. Log in as `superadmin@example.com`.
2. Open `/admin/admins`.
3. Fill first name, last name, email, optional phone/country, temporary password, and status.
4. Submit **Créer admin**.
5. The account is created as `ADMIN`.

For V1, the page also supports suspending and reactivating `ADMIN` accounts. It does not allow modifying a `SUPER_ADMIN`.

## 6. Transaction Traceability

Admin transfer actions store the acting admin and timestamp:

- Cameroon payment confirmation:
  - `paymentConfirmedById`
  - `paymentConfirmedAt`
- Alipay payout completion:
  - `alipayPayoutCompletedById`
  - `alipayPayoutCompletedAt`
  - `alipayPayoutReference`
- Cancellation:
  - `cancelledById`
  - `cancelledAt`
  - `cancelReason`

The admin transfer detail page shows these fields in **Traçabilité administrative**. Sender pages do not show internal admin identity or audit details.

## 7. Audited Admin Actions

The following actions write audit logs:

- `ADMIN_CREATED_BY_SUPER_ADMIN`
- `ADMIN_SUSPENDED_BY_SUPER_ADMIN`
- `ADMIN_REACTIVATED_BY_SUPER_ADMIN`
- `ADMIN_PAYMENT_MARKED_RECEIVED`
- `ADMIN_PAYOUT_COMPLETED`
- `TRANSFER_CANCELLED_BY_ADMIN`

## 8. Demo Accounts

All demo users use:

```text
ChangeMe123!
```

- `superadmin@example.com` - `SUPER_ADMIN`
- `admin@example.com` - `ADMIN`
- `sender@example.com` - `SENDER`
- `sender2@example.com` - `SENDER`
