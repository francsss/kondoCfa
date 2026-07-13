# Kondo V1 Product Spec

## Business Model

Kondo V1 is a web MVP for money transfer operations between Cameroon and China.

1. A sender in Cameroon creates a transfer.
2. The sender pays in FCFA using Orange Money or MTN Mobile Money.
3. Kondo receives or confirms the Cameroon-side payment.
4. An admin manually sends the CNY amount to the recipient through Alipay outside the platform.
5. The admin records the Alipay reference and marks the transfer as successful.
6. The sender sees the updated status automatically.

Kondo V1 is a prototype/demo MVP. A real launch requires legal review, provider contracts, regulatory assessment, KYC/AML controls, reconciliation, monitoring, and production-grade payment integrations.

## Roles

- `SUPER_ADMIN`: full admin capabilities.
- `ADMIN`: operations dashboard, settings, audit logs, and transfer actions.
- `SENDER`: own dashboard, own transfers, and new transfer flow.

No OPS or compliance roles exist in V1.

## Statuses

- `CREATED` / Créé: transfer exists and awaits payment confirmation.
- `IN_PROGRESS` / En cours: payment is confirmed and admin payout is pending.
- `CANCELLED` / Annulé: payment failed, was cancelled, or admin cancelled the transfer.
- `SUCCESS` / Réussi: admin completed the Alipay payout.

No legacy complex statuses are used.

## Sender Flow

1. Register or log in.
2. Open the sender dashboard.
3. Start **Nouveau transfert**.
4. Enter FCFA amount and receive a live quote.
5. Choose Orange Money or MTN Mobile Money.
6. Enter beneficiary name, Alipay ID, optional phone, and optional purpose.
7. Review confirmation summary.
8. Confirm payment.
9. Mock payment provider confirms by default.
10. Transfer becomes `IN_PROGRESS`.
11. Sender detail page polls every 5 seconds for status updates.
12. Sender sees `Réussi` after admin payout completion.

## Admin Flow

1. Log in as `admin@example.com` or `superadmin@example.com`.
2. Open `/admin`.
3. Review totals, recent transfers, and the manual operations queue.
4. Open a transfer.
5. Optionally mark Cameroon payment received.
6. Complete payout by entering the Alipay reference.
7. Transfer becomes `SUCCESS`.
8. Audit logs record the action.

Admins can also cancel transfers with a reason.

## Payment Provider Abstraction

The V1 code defines:

- `PaymentProvider`
- `OrangeMoneyMockProvider`
- `MtnMomoMockProvider`

Provider statuses:

- `PENDING`
- `CONFIRMED`
- `FAILED`
- `CANCELLED`

Real provider integrations should replace the mock internals while keeping the same interface:

- `initiatePayment()`
- `checkPaymentStatus()`
- `handleWebhook()`
- `cancelPayment()`

## Future API Integration Notes

- Add provider credentials via secret management.
- Validate webhook signatures before state changes.
- Verify payment status from provider backend before marking confirmed.
- Store provider payloads safely for reconciliation.
- Add idempotency keys for callbacks and admin actions.
- Add production monitoring and alerting.
