export interface CurrencyOption {
  code: string;
  label: string;
  symbol: string;
}

export const CURRENCY_OPTIONS: CurrencyOption[] = [
  { code: "EGP", label: "جنيه مصري (EGP)", symbol: "ج.م" },
  { code: "SAR", label: "ريال سعودي (SAR)", symbol: "ر.س" },
  { code: "AED", label: "درهم إماراتي (AED)", symbol: "د.إ" },
  { code: "KWD", label: "دينار كويتي (KWD)", symbol: "د.ك" },
  { code: "QAR", label: "ريال قطري (QAR)", symbol: "ر.ق" },
  { code: "BHD", label: "دينار بحريني (BHD)", symbol: "د.ب" },
  { code: "OMR", label: "ريال عماني (OMR)", symbol: "ر.ع" },
  { code: "JOD", label: "دينار أردني (JOD)", symbol: "د.أ" },
  { code: "IQD", label: "دينار عراقي (IQD)", symbol: "د.ع" },
  { code: "LBP", label: "ليرة لبنانية (LBP)", symbol: "ل.ل" },
  { code: "SYP", label: "ليرة سورية (SYP)", symbol: "ل.س" },
  { code: "YER", label: "ريال يمني (YER)", symbol: "ر.ي" },
  { code: "TND", label: "دينار تونسي (TND)", symbol: "د.ت" },
  { code: "DZD", label: "دينار جزائري (DZD)", symbol: "د.ج" },
  { code: "MAD", label: "درهم مغربي (MAD)", symbol: "د.م" },
  { code: "LYD", label: "دينار ليبي (LYD)", symbol: "د.ل" },
  { code: "SDG", label: "جنيه سوداني (SDG)", symbol: "ج.س" },
  { code: "SOS", label: "شلن صومالي (SOS)", symbol: "ش.ص" },
  { code: "MRU", label: "أوقية موريتانية (MRU)", symbol: "أ.م" },
  { code: "KMF", label: "فرنك قمري (KMF)", symbol: "ف.ق" },
  { code: "DJF", label: "فرنك جيبوتي (DJF)", symbol: "ف.ج" },
  { code: "USD", label: "دولار أمريكي (USD)", symbol: "$" },
  { code: "EUR", label: "يورو (EUR)", symbol: "€" },
  { code: "GBP", label: "جنيه إسترليني (GBP)", symbol: "£" },
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
