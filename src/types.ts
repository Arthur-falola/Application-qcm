export interface MCQ {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  subject: string;
}

export type Subject = 'Anatomie' | 'Biologie Humaine' | 'Physiologie' | 'Pathologie' | 'Biochimie';

export interface QuizState {
  currentQuestionIndex: number;
  score: number;
  answers: number[];
  isFinished: boolean;
  questions: MCQ[];
}
