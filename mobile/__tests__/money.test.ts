import { toMajor, formatMoney } from "@/lib/money";

describe("money", () => {
  it("converts minor units to major", () => {
    expect(toMajor(12345)).toBeCloseTo(123.45);
    expect(toMajor(0)).toBe(0);
  });

  it("formats a lira amount without throwing", () => {
    const s = formatMoney(29900);
    expect(typeof s).toBe("string");
    expect(s).toMatch(/299/);
  });
});
