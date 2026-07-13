import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={[
        "rounded-lg border border-slate-100 bg-white p-5 shadow-soft",
        className
      ].join(" ")}
      {...props}
    />
  );
}
