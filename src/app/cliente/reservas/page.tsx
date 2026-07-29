"use client";

import { useState } from "react";
import {
  createReservation,
  getAvailableReservationTables,
} from "@/lib/api/bartender";

import ReservationHero from "./components/ReservationHero";
import ReservationStepper from "./components/ReservationStepper";
import GuestSelector from "./components/GuestSelector";
import { ReservationTimeSlots } from "./components/ReservationTimeSlots";
import { ReservationTables } from "./components/ReservationTables";
import { ReservationForm } from "./components/ReservationForm";
import ReservationSummary from "./components/ReservationSummary";
import ReservationSuccess from "./components/ReservationSuccess";
import MainContent from "@/components/cliente/layout/MainContent";
import Container from "@/components/cliente/layout/Container";

const STEPS = [
  { id: "date-time", label: "Fecha y Horario" },
  { id: "table", label: "Mesa" },
  { id: "details", label: "Tus Datos" },
  { id: "summary", label: "Resumen" },
];

export default function ReservasPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const [date, setDate] = useState("");
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
  const [reservationSuccess, setReservationSuccess] = useState(false);

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
      setCompletedSteps((prev) => [...prev, 0]);
      setCurrentStep(1);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error al cargar mesas");
    } finally {
      setLoadingTables(false);
    }
  }

  async function handleSubmit(e?: React.SyntheticEvent) {
    if (e) {
      e.preventDefault();
    }

    if (!startIso || !endIso) {
      setErr("Seleccioná un horario antes de continuar");
      return;
    }

    setLoading(true);
    setErr(null);
    setMsg(null);

    try {
      const result = await createReservation({
        customerName: form.name,
        customerPhone: form.phone,
        customerEmail: form.email,
        startTime: startIso,
        endTime: endIso,
        guests,
        notes: form.notes || undefined,
        tableId: selected,
      });

      setReservationSuccess(true);
      setMsg("Reserva confirmada 🎉");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error al reservar");
    } finally {
      setLoading(false);
    }
  }

  const handleReset = () => {
    setReservationSuccess(false);
    setCurrentStep(0);
    setCompletedSteps([]);
    setStartIso("");
    setEndIso("");
    setSelected(undefined);
    setTables([]);
    setDate("");
    setGuests(2);
    setForm({
      name: "",
      phone: "",
      email: "",
      notes: "",
    });
    setMsg(null);
    setErr(null);
  };

  const handleStepEdit = (step: number) => {
    setCurrentStep(step);
    setCompletedSteps((prev) => prev.filter((s) => s < step));
  };

  if (reservationSuccess) {
    return (
      <MainContent containerSize="narrow">
        <ReservationSuccess
          reservationId={msg && msg.includes("🎉") ? undefined : msg || undefined}
          date={startIso}
          time={startIso}
          guests={guests}
          onReset={handleReset}
        />
      </MainContent>
    );
  }

  return (
    <>
      {/* Hero Section */}
      {!startIso && !date && currentStep === 0 && <ReservationHero />}

      <MainContent containerSize="narrow">
        <Container size="narrow">
          {/* Stepper */}
          {(date || startIso) && (
            <ReservationStepper
              steps={STEPS}
              currentStep={currentStep}
              completedSteps={completedSteps}
            />
          )}

          {/* Step 1: Date, Time & Guests */}
          {currentStep === 0 && (
            <div className="reservation-step-container" data-reservation-form>
              <GuestSelector
                value={guests}
                onChange={setGuests}
                min={1}
                max={20}
              />

              {date && (
                <ReservationTimeSlots
                  date={date}
                  guests={guests}
                  onSelect={handleSelectSlot}
                />
              )}

              {!date && (
                <div className="reservation-date-input">
                  <label className="reservation-form-label">Seleccionar Fecha</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="reservation-form-input"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 2: Table Selection */}
          {currentStep === 1 && startIso && (
            <div className="reservation-step-container">
              <div className="reservation-step-header">
                <h3 className="reservation-step-title">Elegí tu Mesa</h3>
                <button
                  onClick={() => handleStepEdit(0)}
                  className="reservation-step-back"
                >
                  ← Volver
                </button>
              </div>

              {loadingTables ? (
                <p className="text-sm text-white/60">
                  Buscando mesas disponibles...
                </p>
              ) : (
                <ReservationTables
                  tables={tables}
                  selected={selected}
                  onSelect={(tableId: string) => {
                    setSelected(tableId);
                    setCompletedSteps((prev) => [...prev, 1]);
                    setCurrentStep(2);
                  }}
                />
              )}
            </div>
          )}

          {/* Step 3: Form */}
          {currentStep === 2 && (
            <div className="reservation-step-container">
              <div className="reservation-step-header">
                <h3 className="reservation-step-title">Tus Datos</h3>
                <button
                  onClick={() => handleStepEdit(1)}
                  className="reservation-step-back"
                >
                  ← Volver
                </button>
              </div>

              <ReservationForm
                values={form}
                onChange={(k: string, v: string) =>
                  setForm((f) => ({ ...f, [k]: v }))
                }
                onSubmit={(e) => {
                  e.preventDefault();
                  setCompletedSteps((prev) => [...prev, 2]);
                  setCurrentStep(3);
                }}
                loading={loading}
              />
            </div>
          )}

          {/* Step 4: Summary */}
          {currentStep === 3 && (
            <div className="reservation-step-container">
              <div className="reservation-step-header">
                <h3 className="reservation-step-title">Resumen</h3>
                <button
                  onClick={() => handleStepEdit(2)}
                  className="reservation-step-back"
                >
                  ← Volver
                </button>
              </div>

              <ReservationSummary
                date={startIso}
                time={startIso}
                guests={guests}
                table={selected}
                customerName={form.name}
                customerPhone={form.phone}
                notes={form.notes}
                onEdit={handleStepEdit}
                onConfirm={() => handleSubmit()}
                loading={loading}
              />
            </div>
          )}

          {/* Status Messages */}
          {err && (
            <div className="alert-error">
              {err}
            </div>
          )}
        </Container>
      </MainContent>
    </>
  );
}