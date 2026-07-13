# Kondo MTN/Orange Mock Integration

## Principe

Le paiement Mobile Money est lancé uniquement quand le sender clique sur le bouton final :

`Confirmer et lancer le paiement`

Les étapes précédentes servent seulement à choisir Orange Money ou MTN MoMo, saisir le numéro payeur +237, renseigner le bénéficiaire et vérifier le résumé.

## Transfer Status vs PaymentAttempt Status

Les statuts globaux du transfert restent inchangés :

- `CREATED`
- `IN_PROGRESS`
- `CANCELLED`
- `SUCCESS`

Les statuts de tentative de paiement Mobile Money sont séparés :

- `CREATED`
- `PENDING`
- `SUCCESS`
- `FAILED`

Mapping principal :

- `PaymentAttempt.CREATED` : tentative créée côté Kondo.
- `PaymentAttempt.PENDING` : demande envoyée au mock provider, confirmation attendue sur téléphone.
- `PaymentAttempt.SUCCESS` : paiement Cameroun reçu, le transfert passe à `IN_PROGRESS`.
- `PaymentAttempt.FAILED` : paiement échoué, le transfert ne passe jamais à `SUCCESS`.

## Mock Providers

Les providers mock sont dans `src/services/payments/mock-providers.ts`.

- `MockMtnMomoProvider`
- `MockOrangeMoneyProvider`

Chaque `requestToPay` retourne :

- `providerRequestId`
- `status: PENDING`
- `rawResponse`

Préfixes mock :

- MTN : `MOCK-MTN-...`
- Orange : `MOCK-ORANGE-...`

## Webhooks Mock

Routes :

- `POST /api/webhooks/mock/mtn`
- `POST /api/webhooks/mock/orange`

Header requis :

`x-kondo-mock-secret: dev_mock_secret`

Payload SUCCESS :

```json
{
  "providerRequestId": "MOCK-MTN-123",
  "status": "SUCCESS",
  "amountXaf": 50000,
  "currency": "XAF"
}
```

Payload FAILED :

```json
{
  "providerRequestId": "MOCK-MTN-123",
  "status": "FAILED",
  "failureReason": "User cancelled payment"
}
```

Un webhook déjà traité en `SUCCESS` ou `FAILED` est idempotent. Il ne modifie plus la base et écrit `PAYMENT_WEBHOOK_DUPLICATE`.

## Simulation Admin

En mode mock seulement, la page détail admin d’un transfert affiche des boutons si la dernière tentative est `PENDING` :

- `Simuler paiement MTN/Orange réussi`
- `Simuler paiement MTN/Orange échoué`

Ces boutons appellent :

- `POST /api/payments/mock/[paymentAttemptId]/success`
- `POST /api/payments/mock/[paymentAttemptId]/fail`

Ils écrivent `PAYMENT_SIMULATED_SUCCESS` ou `PAYMENT_SIMULATED_FAILED`, puis déclenchent la même logique que les webhooks mock.

## Page Sender

Après confirmation finale, le sender est redirigé vers :

`/transfers/[id]/payment`

La page affiche le provider, le numéro payeur, le montant XAF, la référence transfert et le statut paiement. Elle poll `/api/payments/[paymentAttemptId]/status` toutes les 4 secondes.

## Variables d’environnement

```env
PAYMENT_MODE="mock"
MOCK_PAYMENT_WEBHOOK_SECRET="dev_mock_secret"

MTN_MOMO_ENV="sandbox"
MTN_MOMO_BASE_URL=""
MTN_MOMO_SUBSCRIPTION_KEY=""
MTN_MOMO_API_USER=""
MTN_MOMO_API_KEY=""
MTN_MOMO_CALLBACK_SECRET=""

ORANGE_MONEY_ENV="sandbox"
ORANGE_MONEY_BASE_URL=""
ORANGE_MONEY_CLIENT_ID=""
ORANGE_MONEY_CLIENT_SECRET=""
ORANGE_MONEY_MERCHANT_KEY=""
ORANGE_MONEY_CALLBACK_SECRET=""
```

## Future intégration réelle

Pour passer en production, remplacer les providers mock par des clients réels MTN/Orange qui conservent la même interface :

- `requestToPay(input)`
- `checkStatus(providerRequestId)`
- `handleWebhook(payload)`

Les webhooks réels devront valider les signatures/callback secrets provider avant de faire confiance au payload.
