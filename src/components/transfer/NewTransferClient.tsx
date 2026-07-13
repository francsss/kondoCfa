"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { PaymentMethodCard } from "@/components/transfer/PaymentMethodCard";
import { TransferSummary } from "@/components/transfer/TransferSummary";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Loader } from "@/components/ui/Loader";
import { Select } from "@/components/ui/Select";
import {
  BENEFICIARY_COUNTRIES,
  getBeneficiaryCountry,
  type BeneficiaryCountryCode
} from "@/config/beneficiary-countries";
import {
  CAMEROON_MOBILE_MONEY_COUNTRY_CODE,
  getPayerOperatorForPaymentMethod,
  validateCameroonPayerPhone
} from "@/config/mobile-money";
import { formatXaf } from "@/lib/money";
import { shouldInitiatePaymentForStep } from "@/lib/payment-flow";
import type { QuoteDto } from "@/types/api";

type PaymentMethod = "ORANGE_MONEY" | "MTN_MOMO";
const beneficiaryNameRegex = /^(?![\d\s]+$)[\p{L}\p{M}'’ -]{2,}$/u;

function sanitizeDangerousText(value: string) {
  return value.replace(/[<>{}[\]\\]/g, "").replace(/\s+/g, " ");
}

export function NewTransferClient() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [amountXaf, setAmountXaf] = useState("");
  const [quote, setQuote] = useState<QuoteDto | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("ORANGE_MONEY");
  const [payerPhoneNational, setPayerPhoneNational] = useState("");
  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [beneficiaryCountry, setBeneficiaryCountry] =
    useState<BeneficiaryCountryCode>("CN");
  const [beneficiaryAlipayId, setBeneficiaryAlipayId] = useState("");
  const [beneficiaryPhoneNumber, setBeneficiaryPhoneNumber] = useState("");
  const [purpose, setPurpose] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const numericAmount = useMemo(() => Number(amountXaf), [amountXaf]);
  const selectedCountry = useMemo(
    () => getBeneficiaryCountry(beneficiaryCountry),
    [beneficiaryCountry]
  );
  const beneficiaryPhone = beneficiaryPhoneNumber
    ? `${selectedCountry.dialCode}${beneficiaryPhoneNumber}`
    : "";
  const payerOperator = getPayerOperatorForPaymentMethod(paymentMethod);
  const payerPhoneValidation = validateCameroonPayerPhone({
    paymentMethod,
    payerCountryCode: CAMEROON_MOBILE_MONEY_COUNTRY_CODE,
    payerPhoneNational,
    payerOperator
  });
  const payerPhoneError =
    payerPhoneNational && !payerPhoneValidation.valid
      ? payerPhoneValidation.error
      : "";
  const paymentMethodCopy =
    paymentMethod === "MTN_MOMO"
      ? {
          title: "MTN Mobile Money",
          label: "Numéro MTN Mobile Money à débiter",
          helper:
            "Entrez le numéro MTN Mobile Money qui recevra la demande de paiement.",
          placeholder: "670000000"
        }
      : {
          title: "Orange Money",
          label: "Numéro Orange Money à débiter",
          helper:
            "Entrez le numéro Orange Money qui recevra la demande de paiement.",
          placeholder: "690000000"
        };

  const beneficiaryErrors = useMemo(() => {
    const errors: {
      name?: string;
      alipayId?: string;
      phone?: string;
      purpose?: string;
    } = {};

    const cleanName = beneficiaryName.trim();
    const cleanAlipayId = beneficiaryAlipayId.trim();

    if (cleanName && !beneficiaryNameRegex.test(cleanName)) {
      errors.name =
        "Utilisez au moins 2 lettres, espaces, apostrophes ou tirets.";
    }

    if (cleanAlipayId && cleanAlipayId.length < 4) {
      errors.alipayId = "L'identifiant Alipay doit contenir au moins 4 caractères.";
    }

    if (beneficiaryPhoneNumber && beneficiaryPhoneNumber.length < 6) {
      errors.phone = "Entrez au moins 6 chiffres après l'indicatif.";
    }

    if (purpose.length > 140) {
      errors.purpose = "La référence ne doit pas dépasser 140 caractères.";
    }

    return errors;
  }, [beneficiaryAlipayId, beneficiaryName, beneficiaryPhoneNumber, purpose]);

  useEffect(() => {
    if (!amountXaf) {
      setQuote(null);
      return;
    }

    const timer = window.setTimeout(async () => {
      setQuoteLoading(true);
      const response = await fetch("/api/quotes/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountXaf: numericAmount })
      });
      setQuote(await response.json());
      setQuoteLoading(false);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [amountXaf, numericAmount]);

  async function confirmPayment(event: FormEvent) {
    event.preventDefault();
    if (!quote?.valid) return;
    if (!shouldInitiatePaymentForStep(step)) return;
    setSubmitting(true);
    setSubmitError("");

    const response = await fetch("/api/payments/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amountXaf: quote.amountXaf,
        paymentMethod,
        payerCountryCode: CAMEROON_MOBILE_MONEY_COUNTRY_CODE,
        payerPhoneNational,
        payerOperator,
        beneficiaryName,
        beneficiaryCountry,
        beneficiaryAlipayId,
        beneficiaryPhone,
        purpose
      })
    });
    const data = await response.json();
    setSubmitting(false);

    if (!response.ok) {
      setSubmitError(data.error ?? "Transfert impossible.");
      return;
    }

    router.push(data.redirectUrl ?? `/transfers/${data.transfer.id}/payment`);
    router.refresh();
  }

  const canContinueAmount = quote?.valid === true;
  const canContinuePayerPhone = payerPhoneValidation.valid;
  const canContinueBeneficiary =
    beneficiaryNameRegex.test(beneficiaryName.trim()) &&
    beneficiaryAlipayId.trim().length >= 4 &&
    !beneficiaryErrors.phone &&
    !beneficiaryErrors.purpose;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-kondo-navy">Nouveau transfert</h1>
        <p className="mt-2 text-slate-600">
          Étape {step} sur 5. Le devis se met à jour automatiquement.
        </p>
      </div>

      <form onSubmit={confirmPayment}>
        {step === 1 ? (
          <Card>
            <Input
              label="Montant à envoyer en FCFA"
              inputMode="numeric"
              min={0}
              name="amountXaf"
              onChange={(event) => setAmountXaf(event.target.value)}
              placeholder="50000"
              required
              type="number"
              value={amountXaf}
            />
            <div className="mt-5">
              {quoteLoading ? <Loader label="Calcul du devis..." /> : null}
              {quote?.valid === false ? (
                <Alert tone="danger">{quote.error}</Alert>
              ) : null}
              {quote?.valid ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Card className="shadow-none">
                    <div className="text-sm text-slate-500">Taux appliqué</div>
                    <div className="text-2xl font-black text-kondo-navy">
                      {quote.exchangeRate}
                    </div>
                    <div className="text-xs text-slate-500">{quote.appliedTier}</div>
                  </Card>
                  <Card className="shadow-none">
                    <div className="text-sm text-slate-500">Reçu en Chine</div>
                    <div className="text-2xl font-black text-kondo-navy">
                      {quote.payoutAmountCny} CNY
                    </div>
                    <div className="text-xs text-slate-500">
                      Total à payer: {formatXaf(quote.totalXaf)}
                    </div>
                  </Card>
                </div>
              ) : null}
            </div>
            <div className="mt-6 flex justify-end">
              <Button
                type="button"
                disabled={!canContinueAmount}
                onClick={() => setStep(2)}
              >
                Continuer
              </Button>
            </div>
          </Card>
        ) : null}

        {step === 2 ? (
          <Card>
            <h2 className="text-xl font-black text-kondo-navy">Méthode de paiement</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <PaymentMethodCard
                title="Orange Money"
                description="Paiement FCFA par Orange Money Cameroun."
                selected={paymentMethod === "ORANGE_MONEY"}
                onClick={() => setPaymentMethod("ORANGE_MONEY")}
              />
              <PaymentMethodCard
                title="MTN Mobile Money"
                description="Paiement FCFA par MTN MoMo Cameroun."
                selected={paymentMethod === "MTN_MOMO"}
                onClick={() => setPaymentMethod("MTN_MOMO")}
              />
            </div>
            <div className="mt-6 flex justify-between">
              <Button type="button" variant="secondary" onClick={() => setStep(1)}>
                Retour
              </Button>
              <Button type="button" onClick={() => setStep(3)}>
                Continuer
              </Button>
            </div>
          </Card>
        ) : null}

        {step === 3 ? (
          <Card>
            <h2 className="text-xl font-black text-kondo-navy">
              Numéro Mobile Money à débiter
            </h2>
            <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50 p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-kondo-blue">
                Opérateur sélectionné
              </div>
              <div className="mt-1 text-lg font-black text-kondo-navy">
                {paymentMethodCopy.title}
              </div>
              <p className="mt-1 text-sm text-slate-600">
                Pour changer d'opérateur, revenez à l'étape précédente.
              </p>
            </div>
            <div className="mt-5">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-kondo-ink">
                  {paymentMethodCopy.label}
                </span>
                <div className="flex rounded-lg border border-slate-200 bg-white focus-within:border-kondo-blue focus-within:ring-2 focus-within:ring-blue-100">
                  <span className="flex items-center border-r border-slate-200 px-3.5 text-sm font-bold text-kondo-navy">
                    {CAMEROON_MOBILE_MONEY_COUNTRY_CODE}
                  </span>
                  <input
                    className="min-w-0 flex-1 rounded-r-lg px-3.5 py-2.5 text-sm text-kondo-ink outline-none placeholder:text-slate-400"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder={paymentMethodCopy.placeholder}
                    value={payerPhoneNational}
                    onChange={(event) =>
                      setPayerPhoneNational(
                        event.target.value.replace(/\D/g, "").slice(0, 9)
                      )
                    }
                    required
                  />
                </div>
                {payerPhoneError ? (
                  <span className="mt-1 block text-xs text-red-600">
                    {payerPhoneError}
                  </span>
                ) : (
                  <span className="mt-1 block text-xs text-slate-500">
                    {paymentMethodCopy.helper}
                  </span>
                )}
              </label>
            </div>
            <div className="mt-6 flex justify-between">
              <Button type="button" variant="secondary" onClick={() => setStep(2)}>
                Retour
              </Button>
              <Button
                type="button"
                disabled={!canContinuePayerPhone}
                onClick={() => setStep(4)}
              >
                Continuer
              </Button>
            </div>
          </Card>
        ) : null}

        {step === 4 ? (
          <Card>
            <h2 className="text-xl font-black text-kondo-navy">Bénéficiaire</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Input
                label="Nom complet du bénéficiaire"
                value={beneficiaryName}
                onChange={(event) =>
                  setBeneficiaryName(sanitizeDangerousText(event.target.value))
                }
                error={beneficiaryErrors.name}
                helper="Lettres, espaces, apostrophes et tirets uniquement."
                required
              />
              <Input
                label="Alipay ID / numéro Alipay"
                value={beneficiaryAlipayId}
                onChange={(event) =>
                  setBeneficiaryAlipayId(
                    sanitizeDangerousText(event.target.value)
                  )
                }
                error={beneficiaryErrors.alipayId}
                helper="Entrez le numéro, email ou identifiant Alipay du bénéficiaire."
                required
              />
              <Select
                label="Pays du bénéficiaire"
                value={beneficiaryCountry}
                onChange={(event) =>
                  setBeneficiaryCountry(
                    event.target.value as BeneficiaryCountryCode
                  )
                }
                options={BENEFICIARY_COUNTRIES.map((country) => ({
                  value: country.value,
                  label: `${country.label} ${country.dialCode}`
                }))}
                helper={`Indicatif utilisé: ${selectedCountry.dialCode}`}
              />
              <Input
                label="Numéro de téléphone du bénéficiaire"
                value={beneficiaryPhoneNumber}
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="13800000000"
                onChange={(event) =>
                  setBeneficiaryPhoneNumber(
                    event.target.value.replace(/\D/g, "").slice(0, 15)
                  )
                }
                error={beneficiaryErrors.phone}
                helper={`Chiffres uniquement. Le numéro sera enregistré avec ${selectedCountry.dialCode}.`}
              />
              <Input
                label="Objet / référence"
                value={purpose}
                maxLength={140}
                onChange={(event) =>
                  setPurpose(sanitizeDangerousText(event.target.value))
                }
                error={beneficiaryErrors.purpose}
                helper={`${purpose.length}/140 caractères. Optionnel.`}
              />
            </div>
            <div className="mt-6 flex justify-between">
              <Button type="button" variant="secondary" onClick={() => setStep(3)}>
                Retour
              </Button>
              <Button
                type="button"
                disabled={!canContinueBeneficiary}
                onClick={() => setStep(5)}
              >
                Continuer
              </Button>
            </div>
          </Card>
        ) : null}

        {step === 5 && quote?.valid ? (
          <Card>
            <h2 className="text-xl font-black text-kondo-navy">Confirmation</h2>
            <div className="mt-5">
              <TransferSummary
                amountXaf={quote.amountXaf}
                exchangeRate={quote.exchangeRate}
                feeXaf={quote.feeXaf}
                totalXaf={quote.totalXaf}
                payoutAmountCny={quote.payoutAmountCny}
                paymentMethod={paymentMethod}
                beneficiaryName={beneficiaryName}
                beneficiaryAlipayId={beneficiaryAlipayId}
              />
              <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm">
                <div className="font-black text-kondo-navy">
                  Paiement Mobile Money
                </div>
                <div className="mt-2 flex justify-between gap-4">
                  <span className="text-slate-600">Opérateur</span>
                  <strong className="text-right text-kondo-navy">
                    {paymentMethodCopy.title}
                  </strong>
                </div>
                <div className="mt-2 flex justify-between gap-4">
                  <span className="text-slate-600">Numéro à débiter</span>
                  <strong className="text-right text-kondo-navy">
                    {CAMEROON_MOBILE_MONEY_COUNTRY_CODE}
                    {payerPhoneNational}
                  </strong>
                </div>
                <p className="mt-3 rounded-md bg-white/70 p-3 text-xs font-semibold text-kondo-blue">
                  Mode simulation : aucun vrai paiement ne sera effectué. Vous allez
                  recevoir une demande de confirmation sur votre téléphone.
                </p>
              </div>
            </div>
            {submitting ? (
              <div className="mt-5">
                <Loader label="Lancement du paiement..." />
              </div>
            ) : null}
            {submitError ? (
              <div className="mt-5">
                <Alert tone="danger">{submitError}</Alert>
              </div>
            ) : null}
            <div className="mt-6 flex justify-between">
              <Button type="button" variant="secondary" onClick={() => setStep(4)}>
                Retour
              </Button>
              <Button type="submit" disabled={submitting}>
                Confirmer et lancer le paiement
              </Button>
            </div>
          </Card>
        ) : null}
      </form>
    </div>
  );
}
