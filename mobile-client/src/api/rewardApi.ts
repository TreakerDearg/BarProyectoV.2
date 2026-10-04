// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — rewardApi
// Wrappers around /rewards backend endpoints.
// ─────────────────────────────────────────────────────────────────────────────

import { api } from "./client";
import type { ApiResponse } from "../types/api";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Reward {
  _id:          string;
  name:         string;
  description?: string;
  image?:       string;
  pointsCost:   number;
  category:     string;
  stock:        number;
  active:       boolean;
}

export interface UserPointsSummary {
  balance:       number;
  totalEarned:   number;
  totalRedeemed: number;
  movements: Array<{
    type:        string;
    amount:      number;
    description: string;
    createdAt:   string;
  }>;
}

export interface RedeemResult {
  success:    boolean;
  newBalance: number;
  reward:     { name: string; description?: string };
}

// ── API calls ─────────────────────────────────────────────────────────────────

export async function getPublicRewards(): Promise<Reward[]> {
  const res = await api.get<ApiResponse<Reward[]>>("/rewards/public");
  return res.data.data ?? [];
}

export async function getMyPoints(): Promise<UserPointsSummary> {
  const res = await api.get<ApiResponse<UserPointsSummary>>("/rewards/my-points");
  return res.data.data;
}

export async function redeemReward(id: string): Promise<RedeemResult> {
  const res = await api.post<ApiResponse<RedeemResult>>(`/rewards/redeem/${id}`);
  return res.data.data;
}
