export type RewardCategory = 'drink' | 'food' | 'experience' | 'discount';

export interface Reward {
  _id:             string;
  name:            string;
  description:     string;
  image:           string | null;
  pointsCost:      number;
  category:        RewardCategory;
  stock:           number;   // -1 = unlimited
  active:          boolean;
  validFrom:       string | null;
  validUntil:      string | null;
  discountPercent: number;
  deleted:         boolean;
  createdAt?:      string;
  updatedAt?:      string;
}

export type MovementType = 'earn' | 'redeem' | 'expire' | 'adjust';

export interface MovementEntry {
  type:        MovementType;
  amount:      number;
  description: string;
  createdAt:   string;
}

export interface UserPointsSummary {
  balance:       number;
  totalEarned:   number;
  totalRedeemed: number;
  movements:     MovementEntry[];
}

export interface RedeemResult {
  success:    boolean;
  newBalance: number;
  reward:     Reward;
}
