export const currencies = ["INR", "USD", "EUR", "GBP"];

export const planStatuses = ["Planning", "Active", "Completed", "Cancelled"];

export const budgetCategories = ["Travel", "Stay", "Food", "Activities", "Shopping", "Misc"];

export const currencyRates = {
  INR: 1,
  USD: 83,
  EUR: 90,
  GBP: 105,
};

export const categoryStyles = {
  Travel: "bg-blue/10 text-blue",
  Stay: "bg-purple/10 text-purple",
  Food: "bg-green/10 text-green",
  Activities: "bg-amber/10 text-amber",
  Shopping: "bg-red/10 text-red",
  Misc: "bg-white/[0.04] text-[#94a3b8]",
};

export const statusStyles = {
  Planning: "bg-blue/10 text-blue",
  Active: "bg-green/10 text-green",
  Completed: "bg-purple/10 text-purple",
  Cancelled: "bg-red/10 text-red",
};

export const inputClass =
  "w-full bg-surface border border-white/[0.07] rounded-lg px-3.5 py-2.5 text-[14px] text-[#e2e8f0] outline-none focus:border-purple/60 transition-colors";

export const labelClass = "block text-[11px] font-semibold tracking-wide uppercase text-[#475569] mb-2";

export const primaryButton =
  "bg-purple text-white font-semibold text-[14px] py-2.5 px-5 rounded-lg hover:opacity-85 transition-opacity disabled:opacity-50";

export const secondaryButton =
  "bg-white/[0.04] border border-white/[0.07] text-[#94a3b8] font-medium text-[14px] py-2.5 px-5 rounded-lg hover:bg-white/[0.07]";

export const money = (value, currency = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

export const formatDate = (value) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString("en-GB");
};

export const makeShareToken = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(8)))
    .map((value) => value.toString(36).padStart(2, "0"))
    .join("")
    .slice(0, 10);

export const emptyCategoryLimits = () =>
  budgetCategories.reduce((limits, category) => ({ ...limits, [category]: "" }), {});

export const convertCurrency = (amount, fromCurrency, toCurrency) => {
  const fromRate = currencyRates[fromCurrency] || 1;
  const toRate = currencyRates[toCurrency] || 1;
  return ((Number(amount) || 0) * fromRate) / toRate;
};
