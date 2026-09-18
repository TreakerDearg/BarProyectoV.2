"use client";

import { useState } from "react";
import { createReservation } from "@/lib/api/bartender";
import styles from "./AppReservationForm.module.css";

export function AppReservationForm() {
  const [form, setForm] = useState({ date: "", time: "", guests: "2", name: "", phone: "", notes: "" });
  const [status, setStatus] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const update = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const startTime = new Date(`${form.date}T${form.time}`).toISOString();
      const end = new Date(new Date(`${form.date}T${form.time}`).getTime() + 90 * 60 * 1000).toISOString();
      await createReservation({
        customerName: form.name,
        customerPhone: form.phone,
        startTime,
        endTime: end,
        guests: Number(form.guests),
        notes: form.notes || undefined,
        source: "app",
      });
      setStatus({ type: "ok", text: "Reserva solicitada. Te contactaremos para confirmarla." });
      setForm((current) => ({ ...current, notes: "" }));
    } catch (error) {
      setStatus({ type: "error", text: error instanceof Error ? error.message : "No se pudo solicitar la reserva." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      {status && <p className={status.type === "ok" ? styles.feedback : styles.error} role="status">{status.text}</p>}
      <div className={styles.row}>
        <label className={styles.field}><span className={styles.label}>Fecha</span><input className={styles.input} type="date" value={form.date} onChange={(event) => update("date", event.target.value)} required /></label>
        <label className={styles.field}><span className={styles.label}>Hora</span><input className={styles.input} type="time" value={form.time} onChange={(event) => update("time", event.target.value)} required /></label>
      </div>
      <label className={styles.field}><span className={styles.label}>Personas</span><select className={styles.select} value={form.guests} onChange={(event) => update("guests", event.target.value)}>{[2, 3, 4, 5, 6, 7, 8].map((value) => <option key={value} value={value}>{value} personas</option>)}</select></label>
      <label className={styles.field}><span className={styles.label}>Nombre</span><input className={styles.input} value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Tu nombre" required /></label>
      <label className={styles.field}><span className={styles.label}>Teléfono</span><input className={styles.input} type="tel" value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder="11 1234 5678" required /></label>
      <label className={styles.field}><span className={styles.label}>Nota opcional</span><textarea className={styles.textarea} value={form.notes} onChange={(event) => update("notes", event.target.value)} placeholder="Alguna preferencia para tu visita" /></label>
      <button className={styles.submit} type="submit" disabled={saving}>{saving ? "Solicitando..." : "Solicitar reserva"}</button>
    </form>
  );
}
