export interface User {
  id: string;
  username: string;
  stars: number;
  pin?: string;
  role?: string;
  completed_stories: string[]; // Story IDs
  completed_games: string[]; // Game IDs
  created_at: string;
}

export interface Story {
  id: string;
  title: string;
  description: string;
  content: string[];
  question: {
    text: string;
    options: string[];
    correctAnswerIndex: number;
  };
}

export interface Game {
  id: string;
  title: string;
  description: string;
  icon?: string;
  href: string;
}

export interface ProgressState {
  stars: number;
  completed_stories: string[];
  completed_games: string[];
}
