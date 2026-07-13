"use client";

import { useEffect, useState } from "react";

const slides = [
  {
    title: "Envoyez du FCFA vers le Yuan",
    text: "Créez un transfert clair, rapide et suivi depuis votre tableau de bord."
  },
  {
    title: "Payez avec Orange Money ou MTN",
    text: "Choisissez votre méthode de paiement locale et suivez l’état du paiement."
  },
  {
    title: "Bénéficiaire payé via Alipay",
    text: "L’admin traite le paiement Alipay et vous voyez le statut mis à jour."
  }
];

export function HeroSlider() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 4_500);

    return () => window.clearInterval(timer);
  }, []);

  const activeSlide = slides[activeIndex];

  return (
    <div className="rounded-lg border border-white/15 bg-white/10 p-5 text-white shadow-soft backdrop-blur md:p-6">
      <div className="mb-4 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-blue-100">
        Flux Kondo
      </div>
      <h2 className="text-2xl font-black tracking-tight md:text-3xl">
        {activeSlide.title}
      </h2>
      <p className="mt-3 min-h-14 text-sm leading-6 text-blue-50 md:text-base">
        {activeSlide.text}
      </p>
      <div className="mt-6 flex items-center gap-2">
        {slides.map((slide, index) => (
          <button
            key={slide.title}
            type="button"
            aria-label={`Afficher le slide ${index + 1}`}
            aria-current={activeIndex === index}
            className={[
              "h-2.5 rounded-full transition-all",
              activeIndex === index ? "w-8 bg-white" : "w-2.5 bg-white/40"
            ].join(" ")}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}
