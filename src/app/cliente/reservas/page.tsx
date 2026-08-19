"use client";

import { useState } from "react";
import {
  createReservation,
  getAvailableReservationTables,
} from "@/lib/api/bartender";

import ReservationHero from "./components/ReservationHero";
import ReservationStepper from "./components/ReservationStepper";
import GuestSelector from "./components/GuestSelector";
import ReservationDatePicker from "./components/ReservationDatePicker";
import { ReservationTimeSlots } from "./components/ReservationTimeSlots";
import { ReservationTables } from "./components/ReservationTables";
import { ReservationForm } from "./components/ReservationForm";
import ReservationSummary from "./components/ReservationSummary";
import ReservationSuccess from "./components/ReservationSuccess";
import MainContent from "@/components/cliente/layout/MainContent";
import Container from "@/components/cliente/layout/Container";
import ui from "../cliente-ui.module.css";

const STEPS = [
  { id: "date-guests", label: "Fecha y Personas" },
  { id: "time", label: "Horario" },
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
  const [showMobileSticky, setShowMobileSticky] = useState(false);

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
      
      // Skip table selection if not needed, go directly to form
      if (data.length === 0) {
        setCompletedSteps((prev) => [...prev, 0, 1]);
        setCurrentStep(2);
      } else {
        setCompletedSteps((prev) => [...prev, 0]);
        setCurrentStep(1);
      }
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
                <ReservationDatePicker
                  value={date}
                  onChange={setDate}
                  minDate={new Date().toISOString().split("T")[0]}
                />
              )}
            </div>
          )}

          {/* Step 2: Table Selection (only if tables exist) */}
          {currentStep === 1 && startIso && tables.length > 0 && (
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
                  onClick={() => handleStepEdit(0)}
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
            <div className={ui.statePanelError}>
              <p>{err}</p>
              <button
                onClick={() => {
                  setErr(null);
                  // Retry logic based on error type
                  if (err.includes("mesas") || err.includes("horarios")) {
                    // For availability errors, let user try again
                    if (date) {
                      // Refresh availability
                    }
                  }
                }}
                className={ui.btnGhost}
                style={{ marginTop: '0.75rem' }}
              >
                Intentar nuevamente
              </button>
            </div>
          )}
        </Container>
      </MainContent>

      {/* Mobile Sticky Summary for Step 3 */}
      {currentStep === 3 && (
        <div className={ui.mobileStickySummary}>
          <div className={ui.mobileStickySummaryContent}>
            <div className={ui.mobileStickySummaryInfo}>
              <span className={ui.mobileStickySummaryLabel}>
                {guests} {guests === 1 ? 'persona' : 'personas'} · {startIso ? new Date(startIso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : 'Horario'}
              </span>
              <span className={ui.mobileStickySummaryValue}>
                {date ? new Date(date + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Fecha'}
              </span>
            </div>
            <button
              onClick={() => handleSubmit()}
              disabled={loading}
              className={ui.mobileStickySummaryCTA}
            >
              {loading ? 'Confirmando...' : 'Confirmar reserva'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}