# API Integration TODO

## Orange Money API TODO

- Confirm merchant account requirements and contract terms.
- Implement payment initiation request.
- Add provider reference mapping.
- Verify payment status from Orange backend.
- Implement signed webhook validation.
- Add retry and timeout handling.

## MTN MoMo API TODO

- Confirm collection product and market availability.
- Implement token acquisition and rotation.
- Implement collection request.
- Verify transaction status from MTN backend.
- Implement callback signature validation.
- Add reconciliation reports.

## Webhook Callback TODO

- Add dedicated webhook routes per provider.
- Require signature validation before database writes.
- Make webhook processing idempotent.
- Store raw provider event metadata where legally appropriate.
- Add audit logs for callback-driven changes.

## Alipay Payout Partner TODO

- Identify licensed payout partner or direct Alipay business integration.
- Add payout initiation only after legal and provider approval.
- Store payout references and reconciliation status.
- Add payout failure handling and reversal workflows.

## Security TODO

- Rotate JWT secret and provider secrets through a managed secret store.
- Add rate limiting on auth and quote APIs.
- Add CSRF strategy for state-changing form actions.
- Add device/session management.
- Add production logging, alerting, and anomaly detection.

## Legal And Compliance TODO

- Complete regulatory assessment for Cameroon and China corridors.
- Define KYC, AML, sanctions screening, and transaction monitoring.
- Establish provider contracts and settlement procedures.
- Add privacy policy, terms, data retention policy, and dispute process.
