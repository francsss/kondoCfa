import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  fullWidth?: boolean;
};

const variants = {
  primary:
    "bg-kondo-blue text-white shadow-soft hover:bg-blue-700 focus:ring-kondo-blue",
  secondary:
    "border border-blue-100 bg-white text-kondo-navy hover:border-kondo-blue hover:text-kondo-blue focus:ring-kondo-blue",
  ghost: "text-kondo-navy hover:bg-kondo-sky focus:ring-kondo-blue",
  danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
};

export function Button({
  variant = "primary",
  fullWidth = false,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        "inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        fullWidth ? "w-full" : "",
        className
      ].join(" ")}
      {...props}
    />
  );
}
