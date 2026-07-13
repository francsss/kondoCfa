export const TRANSFER_STATUSES = [
  "CREATED",
  "IN_PROGRESS",
  "CANCELLED",
  "SUCCESS"
] as const;

export type SimpleTransferStatus = (typeof TRANSFER_STATUSES)[number];

export const TRANSFER_STATUS_LABELS: Record<SimpleTransferStatus, string> = {
  CREATED: "Créé",
  IN_PROGRESS: "En cours",
  CANCELLED: "Annulé",
  SUCCESS: "Réussi"
};

export const TRANSFER_STATUS_HELP: Record<SimpleTransferStatus, string> = {
  CREATED: "Votre transfert a été créé et attend la confirmation du paiement.",
  IN_PROGRESS: "Paiement reçu. Votre transfert est en cours de traitement.",
  CANCELLED: "Paiement échoué ou annulé.",
  SUCCESS: "Réussi."
};

export const PAYMENT_PROVIDER_STATUS_LABELS = {
  PENDING: "En attente",
  CONFIRMED: "Confirmé",
  FAILED: "Échoué",
  CANCELLED: "Annulé"
} as const;

export const PAYMENT_ATTEMPT_STATUS_LABELS = {
  CREATED: "Créé",
  PENDING: "Paiement en attente",
  SUCCESS: "Paiement reçu",
  FAILED: "Paiement échoué"
} as const;

export const PAYMENT_METHOD_LABELS = {
  ORANGE_MONEY: "Orange Money",
  MTN_MOMO: "MTN Mobile Money"
} as const;
