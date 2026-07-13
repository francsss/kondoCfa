import { TRANSFER_STATUS_LABELS, type SimpleTransferStatus } from "@/lib/status";

const steps: { key: SimpleTransferStatus | "PAYMENT"; label: string }[] = [
  { key: "CREATED", label: "Créé" },
  { key: "PAYMENT", label: "Paiement en cours" },
  { key: "IN_PROGRESS", label: "Traitement admin" },
  { key: "SUCCESS", label: "Réussi" }
];

export function Timeline({ status }: { status: SimpleTransferStatus }) {
  const activeIndex =
    status === "SUCCESS"
      ? 3
      : status === "IN_PROGRESS"
        ? 2
        : status === "CANCELLED"
          ? 1
          : 0;

  return (
    <div className="grid gap-3 sm:grid-cols-4">
      {steps.map((step, index) => {
        const active = index <= activeIndex;
        return (
          <div
            key={step.key}
            className={[
              "rounded-lg border p-3",
              active
                ? "border-kondo-blue bg-blue-50 text-kondo-navy"
                : "border-slate-100 bg-white text-slate-500"
            ].join(" ")}
          >
            <div className="text-xs font-bold uppercase tracking-wide">
              Étape {index + 1}
            </div>
            <div className="mt-1 font-black">
              {step.key === "CREATED" ? TRANSFER_STATUS_LABELS.CREATED : step.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
