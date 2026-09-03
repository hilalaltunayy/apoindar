import { describe, it, expect } from "vitest";
import { checkPassword, isValidPassword, PASSWORD_MIN_LENGTH } from "@/lib/domain/password-policy";

describe("password policy (12 §4.1)", () => {
  it("requires 8+ / lower / upper / number / symbol", () => {
    expect(PASSWORD_MIN_LENGTH).toBe(8);
    expect(isValidPassword("Apoindar1!")).toBe(true);
    expect(isValidPassword("apoindar1!")).toBe(false); // no upper
    expect(isValidPassword("APOINDAR1!")).toBe(false); // no lower
    expect(isValidPassword("Apoindarr!")).toBe(false); // no number
    expect(isValidPassword("Apoindar11")).toBe(false); // no symbol
    expect(isValidPassword("Ap1!")).toBe(false); // too short
  });

  it("reports which rules failed", () => {
    const c = checkPassword("short");
    expect(c.ok).toBe(false);
    expect(c.failed).toEqual(expect.arrayContaining(["length", "upper", "number", "symbol"]));
    expect(c.passed).toEqual(["lower"]);
  });

  it("accepts a range of symbols", () => {
    for (const s of [".", "!", "?", "@", "#", "$", "-", "_"]) {
      expect(isValidPassword(`Abcdef1${s}`)).toBe(true);
    }
  });
});
