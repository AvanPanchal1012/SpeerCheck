import type { DayKey, TimeRange, Engineer } from "../data/engineers";

/** Minutes from "HH:mm" */
export const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/** "HH:mm" from minutes */
export const fromMin = (m: number) => {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
};

export const SLOT_STEP = 30; // base grid
export const DAYS: DayKey[] = ["Mon", "Tue", "Wed", "Thu", "Fri"];
export const DAY_START = toMin("09:00");
export const DAY_END = toMin("18:00");

/** Generate base grid slots (start-only) according to STEP */
export function generateSlots(step = SLOT_STEP) {
  const slots: number[] = [];
  for (let t = DAY_START; t + step <= DAY_END; t += step) {
    slots.push(t);
  }
  return slots;
}

/** Check if [start, start+dur] fully inside range {start,end} */
export function isInside(range: TimeRange, startMin: number, duration: number) {
  const rs = toMin(range.start);
  const re = toMin(range.end);
  return startMin >= rs && startMin + duration <= re;
}

/** Engineers available at specific day/time (duration considered) */
export function availableEngineersAt(
  engineers: Engineer[],
  day: DayKey,
  startMin: number,
  duration: number
) {
  return engineers.filter((e) =>
    e.availability[day]?.some((r) => isInside(r, startMin, duration))
  );
}

/** Candidate preferred single range for the week (e.g. Tue 14:00-17:00) */
export type CandidatePref = { day: DayKey; range: TimeRange };

/** is candidate ok at [start, dur]? */
export function candidateOK(
  pref: CandidatePref,
  day: DayKey,
  startMin: number,
  duration: number
) {
  if (day !== pref.day) return false;
  return isInside(pref.range, startMin, duration);
}

/** Intersection predicate: at least one engineer + candidate overlap */
export function intersectionOK(
  engineers: Engineer[],
  pref: CandidatePref,
  day: DayKey,
  startMin: number,
  duration: number
) {
  if (!candidateOK(pref, day, startMin, duration)) return false;
  return availableEngineersAt(engineers, day, startMin, duration).length > 0;
}

export function label(day: DayKey, startMin: number, duration: number) {
  const end = startMin + duration;
  return `${day}, ${formatAmPm(startMin)} – ${formatAmPm(end)}`;
}

export function formatAmPm(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = ((h + 11) % 12) + 1;
  return `${hr}:${String(m).padStart(2, "0")} ${ampm}`;
}

export function durationOptions() {
  return [15, 30, 60];
}
