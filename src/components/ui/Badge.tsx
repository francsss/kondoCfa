import { TRANSFER_STATUS_LABELS, type SimpleTransferStatus } from "@/lib/status";

type BadgeProps = {
  status?: SimpleTransferStatus | string;
  children?: React.ReactNode;
};

const statusClasses: Record<SimpleTransferStatus, string> = {
  CREATED: "bg-slate-100 text-slate-700",
  IN_PROGRESS: "bg-blue-50 text-kondo-blue",
  CANCELLED: "bg-red-50 text-red-700",
  SUCCESS: "bg-emerald-50 text-emerald-700"
};

export function Badge({ status, children }: BadgeProps) {
  const known = status && status in statusClasses ? (status as SimpleTransferStatus) : null;
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold",
        known ? statusClasses[known] : "bg-slate-100 text-slate-700"
      ].join(" ")}
    >
      {children ?? (known ? TRANSFER_STATUS_LABELS[known] : status)}
    </span>
  );
}
