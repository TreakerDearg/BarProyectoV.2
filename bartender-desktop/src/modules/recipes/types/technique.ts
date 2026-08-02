export interface Technique {
  _id?: string;
  name: string;
  description: string;
  category: 'shake' | 'stir' | 'build' | 'blend' | 'smoke' | 'layer' | 'roll' | 'muddle' | 'strain';
  icon?: string;
  instructions?: string;
  equipment?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  time?: number;
}

export interface Decoration {
  _id?: string;
  name: string;
  type: 'garnish' | 'glassware' | 'presentation' | 'aroma' | 'ice';
  description?: string;
  image?: string;
  icon?: string;
  category?: string;
  cost?: number;
}
