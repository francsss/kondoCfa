export function Loader({ label = "Chargement..." }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-sm font-semibold text-kondo-muted">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-100 border-t-kondo-blue" />
      {label}
    </div>
  );
}
