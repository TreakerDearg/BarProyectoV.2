import { api } from "./client";
import type { ApiResponse, PromotionPublicDTO } from "../types/api";

export async function getPublicPromotions(): Promise<PromotionPublicDTO[]> {
  const res = await api.get<ApiResponse<PromotionPublicDTO[]>>("/promotions/public", {
    params: { audience: "app" },
  });
  return res.data.data;
}
