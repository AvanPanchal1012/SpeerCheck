import React from "react";
import type { Engineer } from "../data/engineerdata";

type Props = {
  isWithinCandidate: boolean;
  available: Engineer[];
  locked: boolean;
  selected: boolean;
  onClick?: () => void;
};

const SlotCell: React.FC<Props> = ({
  isWithinCandidate,
  available,
  locked,
  selected,
  onClick,
}) => {
  const overlap = isWithinCandidate && available.length > 0;
  return (
    <button
      disabled={locked || !overlap}
      onClick={onClick}
      className={[
        "h-10 w-full border border-gray-100 text-xs transition",
        "focus:outline-none focus:ring-2 focus:ring-speer-500",
        locked
          ? "bg-gray-200 cursor-not-allowed text-gray-500"
          : overlap
          ? selected
            ? "bg-speer-600 text-white"
            : "bg-speer-100 hover:bg-speer-500/20"
          : isWithinCandidate
          ? "bg-yellow-50 text-yellow-700"
          : "bg-white",
      ].join(" ")}
      title={
        locked
          ? "This time has been scheduled"
          : overlap
          ? `Available engineers: ${available.map((a) => a.name).join(", ")}`
          : isWithinCandidate
          ? "Within candidate window but no engineer free"
          : ""
      }
    >
      {overlap ? (
        <div className="flex items-center justify-center gap-1 flex-wrap">
          {available.slice(0, 3).map((e) => (
            <span
              key={e.id}
              className="px-2 py-0.5 rounded-full text-[10px]"
              style={{ backgroundColor: e.color + "22", color: "#111" }}
            >
              {e.name.split(" ")[0]}
            </span>
          ))}
          {available.length > 3 && <span>+{available.length - 3}</span>}
        </div>
      ) : null}
    </button>
  );
};

export default SlotCell;
