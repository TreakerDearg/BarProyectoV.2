"use client";

import { Clock, CalendarDays } from "lucide-react";
import { useState } from "react";
import { ReservationTimeSlots } from "./ReservationTimeSlots";

export function ReservationTimeStep({
  guests,
  onGuestsChange,
  onSelectSlot,
}: {
  guests: number;
  onGuestsChange: (delta: number) => void;
  onSelectSlot: (startIso: string, endIso: string) => void;
}) {
  const [date, setDate] = useState("");

  return (
    <section className="bg-white/[0.04] backdrop-blur-xl rounded-2xl p-6 ring-1 ring-white/10 space-y-6">

      {/* HEADER */}
      <div className="flex items-center gap-2 text-white">
        <Clock className="h-5 w-5 text-yellow-400" />
        <h2 className="font-medium text-lg">Elegí fecha y personas</h2>
      </div>

      {/* FECHA */}
      <div className="space-y-2">
        <label className="text-sm text-white/60 flex items-center gap-2">
          <CalendarDays className="h-4 w-4" />
          Fecha
        </label>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input-nebula"
        />
      </div>

      {/* PERSONAS */}
      <div className="space-y-2">
        <label className="text-sm text-white/60">
          Cantidad de personas
        </label>

        <div className="flex items-center gap-4">

          <button
            onClick={() => onGuestsChange(-1)}
            disabled={guests <= 1}
            className="h-10 w-10 rounded-lg bg-white/10 hover:bg-white/20 transition"
          >
            -
          </button>

          <span className="text-white text-xl font-semibold w-10 text-center">
            {guests}
          </span>

          <button
            onClick={() => onGuestsChange(1)}
            disabled={guests >= 20}
            className="h-10 w-10 rounded-lg bg-white/10 hover:bg-white/20 transition"
          >
            +
          </button>

          <span className="text-white/50 text-sm">personas</span>
        </div>
      </div>

      {/* SLOTS */}
      {date && (
        <ReservationTimeSlots
          date={date}
          guests={guests}
          onSelect={onSelectSlot}
        />
      )}
    </section>
  );
}