"use client";

import { useReservationLogic } from "@/hooks/useReservationLogic";
import { NewReservationHero } from "./components/NewReservationHero";
import { NewDateSelector } from "./components/NewDateSelector";
import { NewGuestSelector } from "./components/NewGuestSelector";
import { NewTimeSlotSelector } from "./components/NewTimeSlotSelector";
import { NewReservationForm } from "./components/NewReservationForm";
import { NewReservationSummary } from "./components/NewReservationSummary";
import { NewReservationSuccess } from "./components/NewReservationSuccess";
import ui from "../cliente-ui.module.css";

export default function NewReservasPage() {
  const {
    state,
    setDate,
    setGuests,
    setFormValue,
    setStep,
    selectTimeSlot,
    submitReservation,
    resetReservation,
  } = useReservationLogic();

  const { date, startIso, endIso, guests, success, loading, error } = state;

  if (success) {
    return (
      <NewReservationSuccess
        date={date}
        time={startIso}
        guests={guests}
        onReset={resetReservation}
      />
    );
  }

  const showHero = !date && !startIso && !endIso;

  return (
    <>
      {showHero && <NewReservationHero />}

      <div className={ui.newReservationLayout}>
        <div className={ui.newReservationMain}>
          {!startIso && (
            <>
              <NewDateSelector
                value={date}
                onChange={setDate}
                minDate={new Date().toISOString().split("T")[0]}
              />
              
              {date && (
                <NewGuestSelector
                  value={guests}
                  onChange={setGuests}
                  min={1}
                  max={20}
                />
              )}
            </>
          )}

          {date && !startIso && (
            <NewTimeSlotSelector
              date={date}
              guests={guests}
              onSelect={selectTimeSlot}
            />
          )}

          {startIso && endIso && !success && (
            <NewReservationForm
              values={{
                customerName: state.customerName,
                customerPhone: state.customerPhone,
                customerEmail: state.customerEmail,
                notes: state.notes,
              }}
              onChange={setFormValue}
              onSubmit={() => setStep(3)}
              loading={loading}
            />
          )}

          {error && (
            <div className={ui.statePanelError}>
              <p>{error}</p>
            </div>
          )}
        </div>

        <div className={ui.newReservationSidebar}>
          <NewReservationSummary
            date={date}
            time={startIso}
            guests={guests}
            customerName={state.customerName}
            onConfirm={submitReservation}
            loading={loading}
            canConfirm={!!startIso && !!endIso && !!state.customerName && !!state.customerPhone}
          />
        </div>
      </div>
    </>
  );
}
