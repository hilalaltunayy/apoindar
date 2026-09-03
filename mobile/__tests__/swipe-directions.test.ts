import { readFileSync } from "fs";
import { join } from "path";

/**
 * Guard for spec §7 / file 12 §7: swipe LEFT = interested, swipe RIGHT = skip.
 * These must never be reversed, so we assert the gesture handler wiring directly.
 */
describe("SwipeDeck gesture grammar", () => {
  const src = readFileSync(join(__dirname, "../src/components/SwipeDeck.tsx"), "utf8");

  it("maps a leftward swipe to the 'interested' action", () => {
    expect(src).toMatch(/translationX\s*<\s*-SWIPE_THRESHOLD[\s\S]*?fling\)\("left"\)/);
    expect(src).toMatch(/dir === "left"\) onInterested\(item\)/);
  });

  it("maps a rightward swipe to the 'skip' action", () => {
    expect(src).toMatch(/translationX\s*>\s*SWIPE_THRESHOLD[\s\S]*?fling\)\("right"\)/);
    expect(src).toMatch(/else onSkip\(item\)/);
  });
});
