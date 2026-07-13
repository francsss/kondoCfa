import Link from "next/link";

type KondoLogoProps = {
  href?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "full" | "wordmark" | "mark";
  showTagline?: boolean;
};

const sizeClasses = {
  sm: { image: "h-10 w-10", text: "text-2xl", tagline: "text-[10px]" },
  md: { image: "h-12 w-12", text: "text-3xl", tagline: "text-xs" },
  lg: { image: "h-16 w-16", text: "text-4xl", tagline: "text-sm" },
  xl: { image: "h-20 w-20", text: "text-5xl", tagline: "text-sm" }
};

export function KondoLogo({
  href = "/",
  size = "md",
  variant = "wordmark",
  showTagline = false
}: KondoLogoProps) {
  const resolvedVariant = showTagline ? "full" : variant;
  const classes = sizeClasses[size];
  const content = (
    <div
      className={[
        "inline-flex items-center",
        resolvedVariant === "mark" ? "" : "gap-3"
      ].join(" ")}
      aria-label="Kondo"
    >
      <img
        src="/kondo-logo.png"
        alt="Kondo"
        className={`${classes.image} rounded-2xl object-contain`}
      />
      {resolvedVariant !== "mark" ? (
        <div className="leading-none">
          <div
            className={`${classes.text} font-black tracking-tight text-kondo-navy`}
          >
            Kondo
          </div>
          {resolvedVariant === "full" ? (
            <div
              className={`${classes.tagline} mt-2 font-semibold uppercase tracking-[0.22em] text-kondo-blue`}
            >
              Transférez. Envoyez. En toute confiance.
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  return <Link href={href}>{content}</Link>;
}
