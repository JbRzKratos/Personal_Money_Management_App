// ============================================
// Transaction Types
// ============================================
export const TRANSACTION_TYPES = {
  INCOME: "INCOME",
  EXPENSE: "EXPENSE",
  TRANSFER: "TRANSFER",
  INITIAL_BALANCE: "INITIAL_BALANCE",
} as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[keyof typeof TRANSACTION_TYPES];

// ============================================
// Goal Types
// ============================================
export const GOAL_TYPES = {
  PERMANENT: "PERMANENT",
  ONE_TIME: "ONE_TIME",
} as const;

export type GoalType = (typeof GOAL_TYPES)[keyof typeof GOAL_TYPES];

// ============================================
// Pagination
// ============================================
export const DEFAULT_PAGE_SIZE = 15;

// ============================================
// Chart Colors
// ============================================
export const CHART_COLORS = [
  "#2563eb",
  "#3b82f6",
  "#60a5fa",
  "#93c5fd",
  "#c084fc",
  "#a855f7",
  "#9333ea",
  "#7e22ce",
] as const;

// ============================================
// Currencies
// ============================================
export const CURRENCIES = [
  { code: "USD", symbol: "$", locale: "en-US", name: "US Dollar" },
  { code: "EUR", symbol: "€", locale: "de-DE", name: "Euro" },
  { code: "GBP", symbol: "£", locale: "en-GB", name: "British Pound" },
  { code: "INR", symbol: "₹", locale: "en-IN", name: "Indian Rupee" },
  { code: "JPY", symbol: "¥", locale: "ja-JP", name: "Japanese Yen" },
  { code: "AUD", symbol: "A$", locale: "en-AU", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", locale: "en-CA", name: "Canadian Dollar" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

// ============================================
// Store Keys
// ============================================
export const STORE_KEYS = {
  FINANCE: "finance-store",
  SETTINGS: "finance-settings",
} as const;
