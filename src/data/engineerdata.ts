export type DayKey = "Mon" | "Tue" | "Wed" | "Thu" | "Fri";
export type TimeRange = { start: string; end: string }; // "HH:mm"

export type Engineer = {
  id: string;
  name: string;
  color: string; // for subtle badges
  availability: Record<DayKey, TimeRange[]>;
};

export const engineers: Engineer[] = [
  {
    id: "eng-1",
    name: "Alex Chen",
    color: "#22c55e",
    availability: {
      Mon: [
        { start: "09:00", end: "12:00" },
        { start: "14:00", end: "17:30" },
      ],
      Tue: [{ start: "10:00", end: "16:00" }],
      Wed: [
        { start: "09:00", end: "11:30" },
        { start: "13:00", end: "18:00" },
      ],
      Thu: [{ start: "09:00", end: "12:30" }],
      Fri: [{ start: "11:00", end: "16:00" }],
    },
  },
  {
    id: "eng-2",
    name: "Priya Singh",
    color: "#f59e0b",
    availability: {
      Mon: [{ start: "13:00", end: "18:00" }],
      Tue: [
        { start: "09:00", end: "12:00" },
        { start: "14:00", end: "18:00" },
      ],
      Wed: [{ start: "09:30", end: "15:00" }],
      Thu: [{ start: "12:00", end: "18:00" }],
      Fri: [
        { start: "09:00", end: "12:30" },
        { start: "14:00", end: "17:00" },
      ],
    },
  },
  {
    id: "eng-3",
    name: "Diego Morales",
    color: "#06b6d4",
    availability: {
      Mon: [
        { start: "09:00", end: "11:00" },
        { start: "15:00", end: "18:00" },
      ],
      Tue: [{ start: "11:00", end: "17:30" }],
      Wed: [
        { start: "10:00", end: "12:00" },
        { start: "14:00", end: "18:00" },
      ],
      Thu: [
        { start: "09:00", end: "10:30" },
        { start: "13:30", end: "18:00" },
      ],
      Fri: [{ start: "10:00", end: "15:30" }],
    },
  },
];
