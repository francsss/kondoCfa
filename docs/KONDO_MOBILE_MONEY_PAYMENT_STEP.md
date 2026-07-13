# Kondo Mobile Money Payment Step

## Purpose

The transfer flow now asks for the Cameroon Mobile Money number that will be charged after the sender chooses a payment method.

This number is the payer/sender Mobile Money number. It is not:

- the beneficiary phone number
- the Alipay ID
- the recipient contact number

## Flow

1. Sender enters amount and sees the live quote.
2. Sender chooses `Orange Money` or `MTN Mobile Money`.
3. Sender enters the Mobile Money number to debit.
4. Sender enters beneficiary details.
5. Sender confirms the transfer.

## Stored Fields

Transfers store:

- `payerCountryCode`
- `payerPhoneNational`
- `payerPhoneE164`
- `payerOperator`
- `paymentProviderRequestId`
- `paymentInitiatedAt`
- `paymentFailureReason`

For V1, the country code is fixed to:

```text
+237
```

## Validation

Frontend and backend validation require:

- `payerCountryCode` is `+237`
- national number contains digits only
- national number is a Cameroon mobile format, currently 9 digits starting with `6`
- operator matches selected payment method:
  - `MTN_MOMO` => `MTN`
  - `ORANGE_MONEY` => `ORANGE`

The frontend strips letters while typing. The backend still rejects letters if the API is bypassed.

## Future Provider Integration

The mock provider receives an API-ready request shape:

```ts
requestToPay({
  provider: "MTN_MOMO" | "ORANGE_MONEY",
  amountXaf,
  currency: "XAF",
  payerPhoneE164,
  transferReference
})
```

Kondo V1 remains mock/manual. No real MTN or Orange production API credentials are configured or invented.
