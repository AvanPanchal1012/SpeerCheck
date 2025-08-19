import React from "react";
import {
  DAYS,
  generateSlots,
  durationOptions,
  formatAmPm,
} from "../utils/time";
import type { DayKey, Engineer } from "../data/engineerdata";
import SlotCell from "./SlotCell";

type Booking = {
  candidateId: number;
  engineerId: string;
  day: DayKey;
  startMin: number;
  duration: number;
};

type Props = {
  engineers: Engineer[];
  candidatePref: { day: DayKey; range: { start: string; end: string } };
  engineerFilter: string | "all";
  duration: number; // minutes
  selectedSlot: { day: DayKey; startMin: number } | null;
  onSelect: (s: { day: DayKey; startMin: number }) => void;
  computeAvailable: (day: DayKey, startMin: number) => Engineer[];
  isWithinCandidate: (day: DayKey, startMin: number) => boolean;
  bookings: Booking[];
};

const Calendar: React.FC<Props> = ({
  engineers,
  candidatePref,
  engineerFilter,
  duration,
  selectedSlot,
  onSelect,
  computeAvailable,
  isWithinCandidate,
  bookings,
}) => {
  const slots = generateSlots(30);
  const header = (
    <div className="grid grid-cols-6 sticky top-0 z-10 bg-gray-50 border-b">
      <div className="p-3 text-xs font-medium text-gray-500">Time</div>
      {DAYS.map((d) => (
        <div key={d} className="p-3 text-xs font-medium text-gray-500">
          {d}{" "}
          {d === candidatePref.day && (
            <span className="ml-1 text-[10px] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
              Candidate Pref: {candidatePref.range.start}–
              {candidatePref.range.end}
            </span>
          )}
        </div>
      ))}
    </div>
  );

  const rows = slots.map((start) => (
    <div key={start} className="grid grid-cols-6">
      <div className="p-2 text-xs text-right pr-3 border-r bg-white">
        {formatAmPm(start)}
      </div>
      {DAYS.map((day) => {
        const available = computeAvailable(day, start).filter(
          (e) => engineerFilter === "all" || e.id === engineerFilter
        );
        const within = isWithinCandidate(day, start);
        const locked = bookings.some(
          (b) =>
            b.day === day &&
            start >= b.startMin &&
            start < b.startMin + b.duration
        );
        const selected =
          !!selectedSlot &&
          selectedSlot.day === day &&
          selectedSlot.startMin === start;

        return (
          <div key={`${day}-${start}`} className="border-l">
            <SlotCell
              isWithinCandidate={within}
              available={available}
              locked={locked}
              selected={selected}
              onClick={() => onSelect({ day, startMin: start })}
            />
          </div>
        );
      })}
    </div>
  ));

  return (
    <div className="card">
      <div className="p-4 flex items-center justify-between gap-2 border-b">
        <div className="font-semibold">Weekly Calendar</div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Duration</label>
          <select
            className="px-2 py-1 border rounded-lg"
            value={duration}
            onChange={() => {}}
            // duration selection lives in parent; UI here is static label only
            disabled
          >
            {durationOptions().map((d) => (
              <option key={d} value={d}>
                {d} min
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="overflow-auto">
        {header}
        <div className="divide-y">{rows}</div>
      </div>
    </div>
  );
};

export default Calendar;
