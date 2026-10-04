import { api } from "./client";
import type { ApiResponse, RouletteDrinkDTO } from "../types/api";

export async function getPublicRouletteDrinks(): Promise<RouletteDrinkDTO[]> {
  const res = await api.get<ApiResponse<RouletteDrinkDTO[]>>("/roulette/public");
  return res.data.data;
}

export async function spinPublicRoulette(): Promise<{ selected: RouletteDrinkDTO; probability: number; pointsEarned: number }> {
  const res = await api.post<ApiResponse<{ result: RouletteDrinkDTO; meta?: { pointsEarned?: number } }>>("/roulette/public/spin");
  const selected = res.data.data.result;
  const probability = res.data.data.result.probability ?? 0;
  const pointsEarned = res.data.data.meta?.pointsEarned ?? 0;
  return { selected, probability, pointsEarned };
}

export interface GenerateTicketPayload {
  drinkId:   string;
  rarity:    string;
  drinkName: string;
  tableId?:  string | null;
}

export interface GenerateTicketResponse {
  ticket:    string;
  expiresAt: number;
}

export async function generateRouletteTicket(
  payload: GenerateTicketPayload,
): Promise<GenerateTicketResponse> {
  const res = await api.post<ApiResponse<GenerateTicketResponse>>(
    "/roulette/generate-ticket",
    payload,
  );
  return res.data.data;
}
