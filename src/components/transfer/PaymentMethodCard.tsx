"use client";

type PaymentMethodCardProps = {
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
};

export function PaymentMethodCard({
  title,
  description,
  selected,
  onClick
}: PaymentMethodCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full rounded-lg border bg-white p-4 text-left transition",
        selected
          ? "border-kondo-blue ring-2 ring-blue-100"
          : "border-slate-200 hover:border-kondo-blue"
      ].join(" ")}
    >
      <div className="font-black text-kondo-navy">{title}</div>
      <div className="mt-1 text-sm text-slate-600">{description}</div>
    </button>
  );
}
