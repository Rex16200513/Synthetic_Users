
export interface Review {
  author: string;
  rating: number;
  title: string;
  content: string;
  version: string;
  date: string;
}

export interface AppData {
  app_info: {
    name: string;
    id?: number;
    bundle_id?: string;
    version: string;
    price?: number;
  };
  scrape_info?: {
    timestamp: string;
    max_reviews: number;
    actual_reviews: number;
  };
  analysis: {
    total_reviews: number;
    average_rating: number;
    rating_distribution: Record<string, number>;
    negative_reviews: number;
  };
  reviews: Review[];
}

export type BigFiveTrait = 'Openness' | 'Conscientiousness' | 'Extraversion' | 'Agreeableness' | 'Neuroticism';
export type BigFiveLevel = 'Low' | 'Medium' | 'High';

export interface BigFiveConfig {
  Openness: BigFiveLevel;
  Conscientiousness: BigFiveLevel;
  Extraversion: BigFiveLevel;
  Agreeableness: BigFiveLevel;
  Neuroticism: BigFiveLevel;
}

export interface Persona {
  id: string;
  name: string;
  age: number; // Added Age
  role: string;
  bio: string;
  bigFive: BigFiveConfig;
  frustrations: string[];
  goals: string[];
  systemInstruction: string;
  color?: string; 
  reflections: string[]; 
  relevantReviews: string[]; // Stores the content of reviews matched via vector search
}

export interface ImpactMetrics {
  emotional_intensity: number; // E_mo: 1-5
  role_fit: number;            // S_persona: 0.5 - 1.5 (Multiplier)
  group_consensus: number;     // C_group: 0 or 0.5 or 1 (Bonus)
  memory_resonance: number;    // I_pain: 1-5 (Based on vector match)
  total_impact: number;        // Calculated E_impact
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  personaId?: string; 
  text: string;
  image?: string;
  timestamp: number;
  metrics?: ImpactMetrics; // New field for quantitative analysis
}
