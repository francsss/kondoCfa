type AlertProps = {
  title?: string;
  children: React.ReactNode;
  tone?: "info" | "success" | "danger";
};

const tones = {
  info: "border-blue-100 bg-blue-50 text-kondo-navy",
  success: "border-emerald-100 bg-emerald-50 text-emerald-800",
  danger: "border-red-100 bg-red-50 text-red-800"
};

export function Alert({ title, children, tone = "info" }: AlertProps) {
  return (
    <div className={`rounded-lg border p-4 text-sm ${tones[tone]}`}>
      {title ? <div className="mb-1 font-bold">{title}</div> : null}
      <div>{children}</div>
    </div>
  );
}
