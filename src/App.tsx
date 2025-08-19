import React, { useEffect, useMemo, useState } from "react";
import {
  engineers as ENGINEERS,
  type Engineer,
  type DayKey,
} from "./data/engineerdata";
import {
  availableEngineersAt,
  candidateOK,
  durationOptions,
  generateSlots,
  intersectionOK,
  label,
  toMin,
  DAYS,
} from "./utils/time";
import Calendar from "./components/Calendar";

type Candidate = { id: number; name: string };

type Booking = {
  candidateId: number;
  engineerId: string;
  day: DayKey;
  startMin: number;
  duration: number;
};

const fetchCandidates = async (): Promise<Candidate[]> => {
  // Senior add-on: use an API (JSONPlaceholder)
  const res = await fetch("https://jsonplaceholder.typicode.com/users");
  const users = await res.json();
  return users.slice(0, 6).map((u: any) => ({ id: u.id, name: u.name }));
};

export default function App() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(
    null
  );

  // Candidate single preferred range (for demo)
  // Example: "Tue 14:00-17:00"
  const [candidatePref, setCandidatePref] = useState<{
    day: DayKey;
    range: { start: string; end: string };
  }>({
    day: "Tue",
    range: { start: "14:00", end: "17:00" },
  });

  const [duration, setDuration] = useState<number>(30); // 15, 30, 60
  const [engineerFilter, setEngineerFilter] = useState<"all" | string>("all");

  const [selected, setSelected] = useState<{
    day: DayKey;
    startMin: number;
  } | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [chosenEngineer, setChosenEngineer] = useState<string>("");

  useEffect(() => {
    fetchCandidates()
      .then(setCandidates)
      .catch(() => {
        setCandidates([
          { id: 1, name: "Jane Doe" },
          { id: 2, name: "John Smith" },
          { id: 3, name: "Ava Patel" },
        ]);
      });
  }, []);

  const selectedCandidate =
    candidates.find((c) => c.id === selectedCandidateId) || null;

  const computeAvailable = (day: DayKey, startMin: number) =>
    availableEngineersAt(ENGINEERS, day, startMin, duration);

  const isWithinCandidate = (day: DayKey, startMin: number) =>
    candidateOK(candidatePref, day, startMin, duration);

  const canSchedule =
    selected &&
    intersectionOK(
      ENGINEERS,
      candidatePref,
      selected.day,
      selected.startMin,
      duration
    );

  // Prepare engineer choices for the confirmation dialog
  const engineerChoices = useMemo(() => {
    if (!selected) return [];
    return computeAvailable(selected.day, selected.startMin);
  }, [selected, duration]);

  function openConfirm() {
    if (!selected || !selectedCandidate) return;
    setChosenEngineer(engineerChoices[0]?.id ?? "");
    setConfirmOpen(true);
  }

  function confirmSchedule() {
    if (!selected || !selectedCandidate || !chosenEngineer) return;
    setBookings((prev) => [
      ...prev,
      {
        candidateId: selectedCandidate.id,
        engineerId: chosenEngineer,
        day: selected.day,
        startMin: selected.startMin,
        duration,
      },
    ]);
    setConfirmOpen(false);
    setSelected(null);
  }

  // Lock slot if any booking overlaps that time for this session
  const isLocked = (day: DayKey, startMin: number) =>
    bookings.some(
      (b) =>
        b.day === day &&
        startMin >= b.startMin &&
        startMin < b.startMin + b.duration
    );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">SpeerCheck</h1>
        <div className="text-sm text-gray-500">Live Interview Scheduler</div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="col-span-1 space-y-4">
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Candidate</h2>
            </div>
            <div className="mt-3 space-y-2">
              <select
                className="w-full border rounded-lg px-3 py-2"
                value={selectedCandidateId ?? ""}
                onChange={(e) => {
                  setSelectedCandidateId(Number(e.target.value));
                  setSelected(null);
                }}
              >
                <option value="" disabled>
                  Select a candidate
                </option>
                {candidates.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-gray-500">Day</label>
                  <select
                    className="w-full border rounded-lg px-2 py-1"
                    value={candidatePref.day}
                    onChange={(e) =>
                      setCandidatePref((p) => ({
                        ...p,
                        day: e.target.value as DayKey,
                      }))
                    }
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Start</label>
                  <input
                    type="time"
                    className="w-full border rounded-lg px-2 py-1"
                    value={candidatePref.range.start}
                    onChange={(e) =>
                      setCandidatePref((p) => ({
                        ...p,
                        range: { ...p.range, start: e.target.value },
                      }))
                    }
                    step={60 * 15}
                    min="09:00"
                    max="18:00"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">End</label>
                  <input
                    type="time"
                    className="w-full border rounded-lg px-2 py-1"
                    value={candidatePref.range.end}
                    onChange={(e) =>
                      setCandidatePref((p) => ({
                        ...p,
                        range: { ...p.range, end: e.target.value },
                      }))
                    }
                    step={60 * 15}
                    min="09:00"
                    max="18:00"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Candidate prefers <b>{candidatePref.day}</b>{" "}
                {candidatePref.range.start}–{candidatePref.range.end}
              </p>
            </div>
          </div>

          <div className="card p-4 space-y-3">
            <h2 className="font-semibold">Filters</h2>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500">Engineer</label>
                <select
                  className="w-full border rounded-lg px-2 py-1"
                  value={engineerFilter}
                  onChange={(e) => setEngineerFilter(e.target.value as any)}
                >
                  <option value="all">All engineers</option>
                  {ENGINEERS.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500">Duration</label>
                <select
                  className="w-full border rounded-lg px-2 py-1"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                >
                  {durationOptions().map((d) => (
                    <option key={d} value={d}>
                      {d} min
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded bg-yellow-100 border border-yellow-200"></span>
                <span>Candidate window</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded bg-speer-100 border border-speer-200"></span>
                <span>Overlap (clickable)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded bg-gray-200 border border-gray-300"></span>
                <span>Locked by scheduled interview</span>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <h2 className="font-semibold">Scheduled (this session)</h2>
            {bookings.length === 0 ? (
              <p className="text-sm text-gray-500">
                No interviews scheduled yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {bookings.map((b, i) => {
                  const engineer = ENGINEERS.find(
                    (e) => e.id === b.engineerId
                  )!;
                  const who =
                    candidates.find((c) => c.id === b.candidateId)?.name ??
                    "Candidate";
                  return (
                    <li
                      key={i}
                      className="text-sm flex items-center justify-between"
                    >
                      <span>
                        <b>{who}</b> with <b>{engineer.name}</b> —{" "}
                        {label(b.day, b.startMin, b.duration)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="col-span-1 lg:col-span-2 space-y-4">
          <Calendar
            engineers={ENGINEERS}
            candidatePref={candidatePref}
            engineerFilter={engineerFilter}
            duration={duration}
            selectedSlot={selected}
            onSelect={(s) => {
              setSelected(s);
            }}
            computeAvailable={(day, startMin) =>
              computeAvailable(day, startMin)
            }
            isWithinCandidate={(day, startMin) =>
              isWithinCandidate(day, startMin)
            }
            bookings={bookings}
          />

          <div className="card p-4 flex items-center justify-between">
            <div className="text-sm">
              {selected ? (
                <span>
                  Selected:{" "}
                  <b>{label(selected.day, selected.startMin, duration)}</b>
                </span>
              ) : (
                <span className="text-gray-500">
                  Select a slot to schedule.
                </span>
              )}
            </div>
            <button
              className="px-4 py-2 rounded-xl bg-speer-600 text-white disabled:opacity-50"
              disabled={!selectedCandidate || !selected || !canSchedule}
              onClick={openConfirm}
            >
              Schedule Interview
            </button>
          </div>
        </div>
      </section>

      {/* Confirmation Modal */}
      {confirmOpen && selected && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
          <div className="card p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-2">Confirm Interview</h3>
            <p className="text-sm text-gray-600 mb-4">
              {selectedCandidate ? (
                <>
                  Schedule <b>{selectedCandidate.name}</b> on{" "}
                  <b>{label(selected.day, selected.startMin, duration)}</b>.
                </>
              ) : (
                "Schedule interview."
              )}
            </p>
            <div className="space-y-2">
              <label className="text-xs text-gray-500">Engineer</label>
              <select
                className="w-full border rounded-lg px-3 py-2"
                value={chosenEngineer}
                onChange={(e) => setChosenEngineer(e.target.value)}
              >
                {engineerChoices.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                className="px-3 py-2 rounded-lg border"
                onClick={() => setConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-speer-600 text-white disabled:opacity-50"
                disabled={!chosenEngineer}
                onClick={confirmSchedule}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
