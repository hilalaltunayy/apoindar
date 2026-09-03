import { checkPassword, isValidPassword, PASSWORD_RULES } from "@shared/domain/password-policy";

/** The mobile UI enforces the SAME policy object the server uses (spec §2). */
describe("shared password policy", () => {
  it("exposes 5 rules: length, lower, upper, number, symbol", () => {
    expect(PASSWORD_RULES.map((r) => r.id).sort()).toEqual(
      ["length", "lower", "number", "symbol", "upper"],
    );
  });

  it("rejects weak passwords", () => {
    expect(isValidPassword("short")).toBe(false);
    expect(isValidPassword("alllowercase1!")).toBe(false); // no uppercase
    expect(isValidPassword("NoNumbers!!")).toBe(false);
    expect(isValidPassword("NoSymbol123")).toBe(false);
  });

  it("accepts a compliant password", () => {
    expect(isValidPassword("Apoindar1!")).toBe(true);
    const c = checkPassword("Apoindar1!");
    expect(c.ok).toBe(true);
    expect(c.failed).toEqual([]);
  });
});
