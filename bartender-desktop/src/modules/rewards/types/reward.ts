export type RewardCategory = 'drink' | 'food' | 'experience' | 'discount';

export interface LinkedProduct {
  _id: string;
  name: string;
  price?: number;
  category?: string;
  image?: string;
  type?: string;
  isAvailable?: boolean;
}

export interface Reward {
  _id:             string;
  name:            string;
  description:     string;
  image:           string | null;
  pointsCost:      number;
  category:        RewardCategory;
  product?:        LinkedProduct | null;
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
  voucherCode?: string;
  reward:     Reward;
}

export interface VoucherValidationResult {
  valid: boolean;
  code: string;
  status: 'pending' | 'claimed' | 'cancelled';
  redeemedAt: string;
  claimedAt?: string | null;
  reward: {
    _id: string;
    name: string;
    category: RewardCategory;
    categoryLabel: string;
    pointsCost: number;
    image?: string | null;
    product?: LinkedProduct | null;
  };
  user: {
    _id?: string;
    name: string;
    email?: string;
    phone?: string;
    avatar?: string;
  };
}

export interface RedemptionRecord {
  redemptionId: string;
  code: string;
  status: 'pending' | 'claimed' | 'cancelled';
  redeemedAt: string;
  claimedAt?: string | null;
  orderId?: string | null;
  user: {
    _id?: string;
    name: string;
    email?: string;
    phone?: string;
    avatar?: string;
  };
  claimedBy?: {
    _id?: string;
    name: string;
    email?: string;
    role?: string;
  } | null;
  reward: {
    _id: string;
    name: string;
    pointsCost: number;
    category: RewardCategory;
    product?: LinkedProduct | null;
  };
}

export interface RewardsKPIs {
  totalActiveRewards: number;
  totalRewards: number;
  totalPointsInCirculation: number;
  totalPointsEarnedHistorical: number;
  totalPointsRedeemedHistorical: number;
  totalRedemptionsCount: number;
  claimedCount: number;
  pendingCount: number;
  topRewards: Array<{ name: string; count: number }>;
}
