import { Card } from "@/components/ui/Card";

type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
};

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <Card>
      <div className="text-sm font-semibold text-kondo-muted">{label}</div>
      <div className="mt-2 text-3xl font-black text-kondo-navy">{value}</div>
      {hint ? <div className="mt-2 text-xs text-slate-500">{hint}</div> : null}
    </Card>
  );
}
