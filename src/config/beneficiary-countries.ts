export const BENEFICIARY_COUNTRIES = [
  { value: "CN", label: "China", dialCode: "+86" },
  { value: "CM", label: "Cameroon", dialCode: "+237" },
  { value: "HK", label: "Hong Kong", dialCode: "+852" },
  { value: "MO", label: "Macao", dialCode: "+853" },
  { value: "TW", label: "Taiwan", dialCode: "+886" }
] as const;

export type BeneficiaryCountryCode =
  (typeof BENEFICIARY_COUNTRIES)[number]["value"];

export function getBeneficiaryCountry(value: string) {
  return (
    BENEFICIARY_COUNTRIES.find((country) => country.value === value) ??
    BENEFICIARY_COUNTRIES[0]
  );
}
