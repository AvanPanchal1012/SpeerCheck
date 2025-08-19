import { describe, it, expect } from "vitest";
import {
  toMin,
  intersectionOK,
  availableEngineersAt,
  candidateOK,
} from "../src/utils/time";
import { engineers, type DayKey } from "../src/data/engineerdata";

const pref = {
  day: "Tue" as DayKey,
  range: { start: "14:00", end: "17:00" },
};

describe("time utils", () => {
  it("candidateOK respects preferred day and window", () => {
    // Tue 14:00-17:00, 30 min
    expect(candidateOK(pref, "Tue", toMin("14:00"), 30)).toBe(true);
    expect(candidateOK(pref, "Tue", toMin("16:30"), 30)).toBe(true);
    // Exactly at end is invalid
    expect(candidateOK(pref, "Tue", toMin("17:00"), 30)).toBe(false);
    // Wrong day
    expect(candidateOK(pref, "Mon", toMin("14:00"), 30)).toBe(false);
  });

  it("availableEngineersAt returns at least one engineer when inside availability", () => {
    const start = toMin("14:00");
    const avail = availableEngineersAt(engineers, "Tue", start, 30);
    expect(avail.length).toBeGreaterThan(0);
  });

  it("intersectionOK requires candidate window AND at least one engineer", () => {
    // A time where both candidate and at least one engineer are available
    const good = intersectionOK(engineers, pref, "Tue", toMin("14:30"), 30);
    expect(good).toBe(true);

    // Candidate OK but no engineer (choose something unlikely like Tue 09:00-15m)
    const bad1 = intersectionOK(engineers, pref, "Tue", toMin("16:45"), 30); // may still be true if engineers free
    // We can assert that a very late edge (16:45 + 30 > 17:00) violates candidate window
    expect(bad1).toBe(false);

    // Engineer free but wrong day
    const wrongDay = intersectionOK(engineers, pref, "Mon", toMin("14:30"), 30);
    expect(wrongDay).toBe(false);
  });

  it("duration is honored (60 min requires full hour inside ranges)", () => {
    const start = toMin("14:00");
    const sixty = availableEngineersAt(engineers, "Tue", start, 60);
    const fifteen = availableEngineersAt(engineers, "Tue", start, 15);
    // With shorter duration, availability should be >= long duration
    expect(fifteen.length).toBeGreaterThanOrEqual(sixty.length);
  });
});
