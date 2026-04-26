import { Play, Clock, Users } from "lucide-react";

/* =========================
   SAFE TIME STATUS
========================= */
function getTimeStatus(startTime?: string) {
  if (!startTime) return "unknown";

  const date = new Date(startTime);
  if (isNaN(date.getTime())) return "unknown";

  const diff = (date.getTime() - Date.now()) / 60000;

  if (diff < -10) return "late";
  if (diff < 0) return "arriving";
  if (diff < 30) return "soon";
  return "future";
}

/* =========================
   SAFE FORMAT TIME
========================= */
function formatTime(startTime?: string) {
  if (!startTime) return "--:--";

  const d = new Date(startTime);
  if (isNaN(d.getTime())) return "--:--";

  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* =========================
   STATUS COLORS
========================= */
const timeStyles = {
  late: "border-red-500 bg-red-500/10 text-red-400",
  arriving: "border-yellow-400 bg-yellow-400/10 text-yellow-300",
  soon: "border-blue-400 bg-blue-400/10 text-blue-300",
  future: "border-obsidian bg-obsidian/30 text-gray-300",
  unknown: "border-gray-700 bg-gray-800 text-gray-400",
};

export default function ReservationCard({
  r,
  onSeat,
}: {
  r: any;
  onSeat?: (id: string) => void;
}) {
  if (!r) return null;

  const timeStatus = getTimeStatus(r.startTime);
  const timeLabel = formatTime(r.startTime);

  const customer = r.customerName || "UNKNOWN";
  const guests = r.guests ?? 0;
  const tableNumber =
    typeof r.table === "object"
      ? r.table?.number
      : r.table ?? "TBD";

  const isSeated = r.status === "seated";

  return (
    <div
      className={`p-4 rounded-xl border transition-all duration-200 hover:scale-[1.01]
        ${timeStyles[timeStatus]}
      `}
    >
      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <p className="font-bold text-lg tracking-tight">
            {customer}
          </p>

          <div className="flex items-center gap-2 text-xs opacity-80 mt-1">
            <Users size={12} />
            {guests} pax
          </div>
        </div>

        <div className="text-right">
          <p className="text-sm font-bold flex items-center gap-1 justify-end">
            <Clock size={12} />
            {timeLabel}
          </p>

          <p className="text-[10px] uppercase opacity-70">
            {timeStatus}
          </p>
        </div>
      </div>

      {/* INFO */}
      <div className="flex justify-between items-center mt-4">

        <span className="text-xs opacity-70">
          Table: {tableNumber}
        </span>

        {/* ACTION */}
        {!isSeated && onSeat && r._id && (
          <button
            onClick={() => onSeat(r._id)}
            className="flex items-center gap-1 text-green-400 hover:text-green-300 text-xs"
          >
            <Play size={14} />
            SEAT
          </button>
        )}

        {isSeated && (
          <span className="text-xs text-green-400 font-bold">
            SEATED
          </span>
        )}
      </div>
    </div>
  );
}