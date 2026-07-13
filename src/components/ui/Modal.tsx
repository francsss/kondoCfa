"use client";

import { Button } from "@/components/ui/Button";

type ModalProps = {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
};

export function Modal({ open, title, children, onClose }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-kondo-ink/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-black text-kondo-navy">{title}</h2>
          <button
            aria-label="Fermer"
            className="rounded-full px-2 py-1 text-slate-500 hover:bg-slate-100"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>
        <div className="text-sm text-slate-600">{children}</div>
        <div className="mt-5 flex justify-end">
          <Button type="button" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
}
