import type { SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: { value: string; label: string }[];
  helper?: string;
  error?: string;
};

export function Select({
  label,
  options,
  helper,
  error,
  className = "",
  ...props
}: SelectProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-kondo-ink">
        {label}
      </span>
      <select
        className={[
          "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-kondo-ink outline-none transition focus:border-kondo-blue focus:ring-2 focus:ring-blue-100",
          error ? "border-red-300 focus:border-red-500 focus:ring-red-100" : "",
          className
        ].join(" ")}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {helper && !error ? (
        <span className="mt-1 block text-xs text-slate-500">{helper}</span>
      ) : null}
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </label>
  );
}
