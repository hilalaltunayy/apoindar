/**
 * Shared password policy — the single source of truth for web, iOS and Android
 * (12 §4.1). Enforced in UI *and* server-side on signup, reset, and change.
 *
 * Rules: 8+ chars · 1 lowercase · 1 uppercase · 1 number · 1 symbol.
 */

export const PASSWORD_MIN_LENGTH = 8;

export type PasswordRuleId = "length" | "lower" | "upper" | "number" | "symbol";

export interface PasswordRule {
  id: PasswordRuleId;
  test: (pw: string) => boolean;
}

// Symbols intentionally broad; the spec lists `. ! ? @ #` as examples.
const SYMBOL_RE = /[^A-Za-z0-9\s]/;

export const PASSWORD_RULES: PasswordRule[] = [
  { id: "length", test: (pw) => pw.length >= PASSWORD_MIN_LENGTH },
  { id: "lower", test: (pw) => /[a-z]/.test(pw) },
  { id: "upper", test: (pw) => /[A-Z]/.test(pw) },
  { id: "number", test: (pw) => /[0-9]/.test(pw) },
  { id: "symbol", test: (pw) => SYMBOL_RE.test(pw) },
];

export interface PasswordCheck {
  ok: boolean;
  failed: PasswordRuleId[];
  passed: PasswordRuleId[];
}

export function checkPassword(pw: string): PasswordCheck {
  const failed: PasswordRuleId[] = [];
  const passed: PasswordRuleId[] = [];
  for (const rule of PASSWORD_RULES) (rule.test(pw) ? passed : failed).push(rule.id);
  return { ok: failed.length === 0, failed, passed };
}

export function isValidPassword(pw: string): boolean {
  return checkPassword(pw).ok;
}

/** English fallback copy for a rule; UIs should localize via `passwordPolicy.<id>`. */
export const PASSWORD_RULE_TEXT: Record<PasswordRuleId, string> = {
  length: `At least ${PASSWORD_MIN_LENGTH} characters`,
  lower: "One lowercase letter",
  upper: "One uppercase letter",
  number: "One number",
  symbol: "One symbol (. ! ? @ #)",
};
