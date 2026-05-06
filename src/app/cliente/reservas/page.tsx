"use client";

import { useState } from "react";
import {
  createReservation,
  getAvailableReservationTables,
} from "@/lib/api/bartender";

import { ReservationHeader } from "./components/ReservationHeader";
import { ReservationTimeStep } from "./components/ReservationTimeStep";
import { ReservationTables } from "./components/ReservationTables";
import { ReservationForm } from "./components/ReservationForm";
import { ReservationStatus } from "./components/ReservationStatus";

import styles from "./Reservas.module.css";

export default function ReservasPage() {
  const [startIso, setStartIso] = useState("");
  const [endIso, setEndIso] = useState("");

  const [guests, setGuests] = useState(2);

  const [tables, setTables] = useState<any[]>([]);
  const [selected, setSelected] = useState<string>();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    notes: "",
  });

  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingTables, setLoadingTables] = useState(false);

  //  Cargar mesas cuando seleccionan slot
  async function handleSelectSlot(start: string, end: string) {
    setStartIso(start);
    setEndIso(end);

    setLoadingTables(true);
    setTables([]);
    setSelected(undefined);

    try {
      const data = await getAvailableReservationTables({
        startTime: start,
        endTime: end,
        guests,
      });

      setTables(data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error al cargar mesas");
    } finally {
      setLoadingTables(false);
    }
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();

    if (!startIso || !endIso) {
      setErr("Seleccioná un horario antes de continuar");
      return;
    }

    setLoading(true);
    setErr(null);
    setMsg(null);

    try {
      await createReservation({
        customerName: form.name,
        customerPhone: form.phone,
        customerEmail: form.email || undefined,
        startTime: startIso,
        endTime: endIso,
        guests,
        notes: form.notes || undefined,
        tableId: selected,
      });

      setMsg("Reserva confirmada 🎉");

      // reset UX
      setStartIso("");
      setEndIso("");
      setSelected(undefined);
      setTables([]);

      setForm({
        name: "",
        phone: "",
        email: "",
        notes: "",
      });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error al reservar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.pageContainer}>

      {/* HEADER */}
      <div className={styles.pageHeader}>
        <ReservationHeader />
      </div>

      {/* STEP 1 */}
      <div className={styles.pageSection}>
        <div className={styles.sectionContent}>
          <ReservationTimeStep
            guests={guests}
            onGuestsChange={(d: number) =>
              setGuests((g) => Math.max(1, Math.min(20, g + d)))
            }
            onSelectSlot={handleSelectSlot}
          />
        </div>
      </div>

      {/* STEP 2 - MESAS */}
      {startIso && (
        <div className={styles.pageSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              2. Elegí tu mesa
            </h2>
          </div>

          <div className={styles.sectionContent}>
            {loadingTables ? (
              <p className="text-sm text-white/60">
                Buscando mesas disponibles...
              </p>
            ) : (
              <ReservationTables
                tables={tables}
                selected={selected}
                onSelect={setSelected}
              />
            )}
          </div>
        </div>
      )}

      {/* STEP 3 - FORM */}
      <div className={styles.pageSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            3. Tus datos
          </h2>
        </div>

        <div className={styles.sectionContent}>
          <ReservationForm
            values={form}
            onChange={(k: string, v: string) =>
              setForm((f) => ({ ...f, [k]: v }))
            }
            onSubmit={handleSubmit}
            loading={loading}
          />
        </div>
      </div>

      {/* STATUS */}
      <ReservationStatus msg={msg} err={err} />
    </div>
  );
}