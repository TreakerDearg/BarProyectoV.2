import { useState, useCallback } from "react";
import {
  createReservation,
  getAvailableReservationTables,
  checkReservationAvailability,
} from "@/lib/api/bartender";
import type { GuestDietaryEntry } from "@/lib/types/reservation";

export type AvailabilityStatus = "available" | "limited" | "unavailable" | "loading";
export type AvailabilityMap = Record<string, AvailabilityStatus>;

export interface ReservationState {
  // Selección
  date: string;
  startIso: string;
  endIso: string;
  guests: number;
  tableId?: string;

  // Datos del cliente
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  notes: string;

  // Restricciones por invitado
  guestDietaryRestrictions: GuestDietaryEntry[];

  // UI State
  currentStep: number;
  completedSteps: number[];
  loading: boolean;
  loadingTables: boolean;
  loadingAvailability: boolean;
  error: string | null;
  success: boolean;
  message: string | null;

  // Disponibilidad
  availability: AvailabilityMap;
  availableTables: any[];
}

const INITIAL_STATE: ReservationState = {
  date: "",
  startIso: "",
  endIso: "",
  guests: 2,
  tableId: undefined,
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  notes: "",
  guestDietaryRestrictions: [],
  currentStep: 0,
  completedSteps: [],
  loading: false,
  loadingTables: false,
  loadingAvailability: false,
  error: null,
  success: false,
  message: null,
  availability: {},
  availableTables: [],
};

export function useReservationLogic() {
  const [state, setState] = useState<ReservationState>(INITIAL_STATE);

  // ── Selectores ────────────────────────────────────────────────

  const setDate = useCallback((date: string) => {
    setState((prev) => ({ ...prev, date, startIso: "", endIso: "", currentStep: 0, completedSteps: [] }));
  }, []);

  const setGuests = useCallback((guests: number) => {
    setState((prev) => ({
      ...prev,
      guests,
      startIso: "",
      endIso: "",
      currentStep: 0,
      completedSteps: [],
      // Sincronizar cantidad de entradas de restricciones si ya había
      guestDietaryRestrictions: prev.guestDietaryRestrictions.slice(0, guests),
    }));
  }, []);

  const setFormValue = useCallback((field: string, value: string) => {
    setState((prev) => ({ ...prev, [field]: value }));
  }, []);

  const setStep = useCallback((step: number) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  }, []);

  const setTableId = useCallback((tableId: string | undefined) => {
    setState((prev) => ({ ...prev, tableId }));
  }, []);

  // ── Restricciones dietéticas ──────────────────────────────────

  const setGuestDietaryRestrictions = useCallback((restrictions: GuestDietaryEntry[]) => {
    setState((prev) => ({ ...prev, guestDietaryRestrictions: restrictions }));
  }, []);

  const updateGuestDietary = useCallback(
    (index: number, entry: GuestDietaryEntry) => {
      setState((prev) => {
        const list = [...prev.guestDietaryRestrictions];
        list[index] = entry;
        return { ...prev, guestDietaryRestrictions: list };
      });
    },
    []
  );

  // ── Disponibilidad ────────────────────────────────────────────

  const checkAvailability = useCallback(
    async (start: string, end: string) => {
      try {
        setState((prev) => ({ ...prev, loadingAvailability: true, error: null }));
        const data = await checkReservationAvailability({ start, end, guests: state.guests });
        return data.available;
      } catch (e) {
        setState((prev) => ({
          ...prev,
          error: e instanceof Error ? e.message : "Error al verificar disponibilidad",
        }));
        return false;
      } finally {
        setState((prev) => ({ ...prev, loadingAvailability: false }));
      }
    },
    [state.guests]
  );

  const selectTimeSlot = useCallback(
    async (start: string, end: string) => {
      setState((prev) => ({
        ...prev,
        startIso: start,
        endIso: end,
        loadingTables: true,
        availableTables: [],
        tableId: undefined,
        error: null,
      }));

      try {
        const tables = await getAvailableReservationTables({
          startTime: start,
          endTime: end,
          guests: state.guests,
        });

        setState((prev) => ({
          ...prev,
          availableTables: tables,
          currentStep: tables.length === 0 ? 2 : 1,
          completedSteps: tables.length === 0 ? [0, 1] : [0],
        }));
      } catch (e) {
        setState((prev) => ({
          ...prev,
          error: e instanceof Error ? e.message : "Error al cargar mesas disponibles",
        }));
      } finally {
        setState((prev) => ({ ...prev, loadingTables: false }));
      }
    },
    [state.guests]
  );

  // ── Submit ────────────────────────────────────────────────────

  const submitReservation = useCallback(async () => {
    if (!state.startIso || !state.endIso) {
      setState((prev) => ({ ...prev, error: "Debes seleccionar un horario antes de continuar" }));
      return;
    }
    if (!state.customerName || !state.customerPhone) {
      setState((prev) => ({ ...prev, error: "Debes completar nombre y teléfono" }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null, message: null }));

    try {
      await createReservation({
        customerName:              state.customerName,
        customerPhone:             state.customerPhone,
        customerEmail:             state.customerEmail,
        startTime:                 state.startIso,
        endTime:                   state.endIso,
        guests:                    state.guests,
        tableId:                   state.tableId,
        notes:                     state.notes || undefined,
        guestDietaryRestrictions:  state.guestDietaryRestrictions.filter(
          (g) => g.guestName.trim() && g.restrictions.length > 0
        ),
      });

      setState((prev) => ({
        ...prev,
        success: true,
        message: "¡Reserva confirmada! Te esperamos en Nebula.",
      }));
    } catch (e) {
      setState((prev) => ({
        ...prev,
        error: e instanceof Error ? e.message : "Error al crear la reserva",
      }));
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [state]);

  // ── Reset ─────────────────────────────────────────────────────

  const resetReservation = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  const editStep = useCallback((step: number) => {
    setState((prev) => ({
      ...prev,
      currentStep: step,
      completedSteps: prev.completedSteps.filter((s) => s < step),
    }));
  }, []);

  return {
    state,
    setDate,
    setGuests,
    setFormValue,
    setStep,
    setTableId,
    setGuestDietaryRestrictions,
    updateGuestDietary,
    checkAvailability,
    selectTimeSlot,
    submitReservation,
    resetReservation,
    editStep,
  };
}
