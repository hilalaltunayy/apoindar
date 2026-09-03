import { en } from "@/i18n/en";
import { tr } from "@/i18n/tr";
import * as i18n from "@/i18n";

/** Flatten a nested dict to dotted keys. */
function keys(obj: Record<string, unknown>, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([k, v]) => {
    const path = prefix ? `${prefix}.${k}` : k;
    return v && typeof v === "object" ? keys(v as Record<string, unknown>, path) : [path];
  });
}

describe("i18n dictionaries", () => {
  it("Turkish and English expose exactly the same keys (no mixed-language UI, spec §4)", () => {
    const enKeys = keys(en).sort();
    const trKeys = keys(tr as unknown as Record<string, unknown>).sort();
    expect(trKeys).toEqual(enKeys);
  });

  it("has no empty Turkish strings for user-facing copy", () => {
    const flat = (obj: Record<string, unknown>, p = ""): [string, unknown][] =>
      Object.entries(obj).flatMap(([k, v]) => {
        const path = p ? `${p}.${k}` : k;
        return v && typeof v === "object" ? flat(v as Record<string, unknown>, path) : [[path, v]];
      });
    const empties = flat(tr as unknown as Record<string, unknown>)
      .filter(([key, v]) => v === "" && !key.startsWith("common.reducedMotionNote"))
      .map(([key]) => key);
    expect(empties).toEqual([]);
  });

  it("exposes the i18n provider", () => {
    expect(typeof i18n.I18nProvider).toBe("function");
  });
});
