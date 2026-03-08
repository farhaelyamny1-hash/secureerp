export interface CurrencyOption {
  code: string;
  label: string;
  symbol: string;
}

export const CURRENCY_OPTIONS: CurrencyOption[] = [
  { code: "EGP", label: "جنيه مصري (EGP)", symbol: "ج.م" },
  { code: "SAR", label: "ريال سعودي (SAR)", symbol: "ر.س" },
  { code: "AED", label: "درهم إماراتي (AED)", symbol: "د.إ" },
  { code: "USD", label: "دولار أمريكي (USD)", symbol: "$" },
  { code: "EUR", label: "يورو (EUR)", symbol: "€" },
];

export const getCurrencyOption = (currencyCode?: string | null): CurrencyOption => {
  const code = (currencyCode || "EGP").toUpperCase();
  return CURRENCY_OPTIONS.find((option) => option.code === code) || CURRENCY_OPTIONS[0];
};

export const formatCurrencyAmount = (value: number | string | null | undefined, currencyCode?: string | null) => {
  const amount = Number(value || 0);
  const { symbol } = getCurrencyOption(currencyCode);

  return `${amount.toLocaleString("ar-EG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${symbol}`;
};
