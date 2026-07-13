export function formatDateTime(value: Date | string | null | undefined) {
  if (!value) return "N/A";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value);
}
