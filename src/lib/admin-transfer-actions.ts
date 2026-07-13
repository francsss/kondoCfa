export function buildPaymentReceivedUpdate(adminId: string, now = new Date()) {
  return {
    status: "IN_PROGRESS" as const,
    paymentProviderStatus: "CONFIRMED" as const,
    paymentConfirmedById: adminId,
    paymentConfirmedAt: now
  };
}

export function buildPayoutCompletedUpdate(args: {
  adminId: string;
  alipayPayoutReference: string;
  now?: Date;
}) {
  return {
    status: "SUCCESS" as const,
    paymentProviderStatus: "CONFIRMED" as const,
    alipayPayoutReference: args.alipayPayoutReference,
    alipayPayoutCompletedById: args.adminId,
    alipayPayoutCompletedAt: args.now ?? new Date()
  };
}

export function buildAdminCancelTransferUpdate(args: {
  adminId: string;
  reason: string;
  keepConfirmedPayment: boolean;
  now?: Date;
}) {
  return {
    status: "CANCELLED" as const,
    paymentProviderStatus: args.keepConfirmedPayment
      ? ("CONFIRMED" as const)
      : ("CANCELLED" as const),
    cancelReason: args.reason,
    cancelledById: args.adminId,
    cancelledAt: args.now ?? new Date()
  };
}
