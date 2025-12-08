export interface Review {
  author: string;
  rating: number;
  title: string;
  content: string;
  version: string;
  date: string;
}

export interface AppData {
  research_info: {
    name: string;
    type: string;
    description?: string;
    version?: string;
  };
  scrape_info?: {
    timestamp: string;
    max_reviews: number;
    actual_reviews: number;
  };
  analysis?: {
    total_reviews: number;
    average_rating: number;
    rating_distribution: Record<string, number>;
    negative_reviews: number;
  };
  reviews: Review[];
}

export interface Persona {
  id: string;
  name: string;
  role: string;
  bio: string;
  frustrations: string[];
  goals: string[];
  matching_reviews?: string[]; // New: List of reviews assigned to this persona
  systemInstruction: string;
  color?: string; // For UI differentiation
  reflections: string[]; // New: List of accumulated insights from the conversation
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  personaId?: string; // If role is model, which persona sent it
  text: string;
  image?: string;
  timestamp: number;
}