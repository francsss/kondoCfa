import { formatXaf } from "@/lib/money";
import { PAYMENT_METHOD_LABELS } from "@/lib/status";

type TransferSummaryProps = {
  amountXaf: number;
  exchangeRate: string;
  feeXaf: number;
  totalXaf: number;
  payoutAmountCny: string;
  paymentMethod: keyof typeof PAYMENT_METHOD_LABELS;
  beneficiaryName: string;
  beneficiaryAlipayId: string;
};

export function TransferSummary(props: TransferSummaryProps) {
  const rows = [
    ["Montant", formatXaf(props.amountXaf)],
    ["Taux", props.exchangeRate],
    ["Frais", formatXaf(props.feeXaf)],
    ["Total à payer", formatXaf(props.totalXaf)],
    ["Montant CNY", `${props.payoutAmountCny} CNY`],
    ["Méthode", PAYMENT_METHOD_LABELS[props.paymentMethod]],
    ["Bénéficiaire", props.beneficiaryName],
    ["Alipay ID", props.beneficiaryAlipayId]
  ];

  return (
    <div className="divide-y divide-slate-100 rounded-lg border border-slate-100 bg-white">
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-center justify-between gap-4 p-3">
          <span className="text-sm text-slate-500">{label}</span>
          <span className="text-right text-sm font-bold text-kondo-navy">{value}</span>
        </div>
      ))}
    </div>
  );
}
