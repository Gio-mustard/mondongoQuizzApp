/** Estructura de una pregunta individual dentro de un quiz. */
export interface Question {
  title: string;
  type: "multiple-choice" | "true-false";
  options: string[];
  answer: number;
}

/** Documento de quiz almacenado en la colección `quizzes`. */
export interface Quiz {
  _id: string;
  name: string;
  slug: string;
  code: number;
  questions: Question[];
  active: boolean;
  createdAt: Date;
}

/** Respuesta individual de un jugador a una pregunta. `selectedOption = -1` cuando se agotó el tiempo. */
export interface PlayerAnswer {
  questionIndex: number;
  selectedOption: number;
  correct: boolean;
  timeMs: number;
}

/** Participante dentro de una sesión activa, con sus respuestas y score acumulado. */
export interface Participant {
  username: string;
  icon: string;
  joinedAt: Date;
  answers: PlayerAnswer[];
  score: number;
  finished: boolean;
}

/** Documento de sesión de juego almacenado en la colección `quiz_sessions`. */
export interface QuizSession {
  _id?: string;
  quizId: string;
  quizSlug: string;
  quizName: string;
  status: "lobby" | "in_progress" | "finished";
  totalQuestions: number;
  participants: Participant[];
  startedAt: Date | null;
  finishedAt: Date | null;
  duration: number | null;
  createdAt: Date;
}

/** Pregunta sin la respuesta correcta, segura para enviar al cliente. */
export interface SafeQuestion {
  title: string;
  type: "multiple-choice" | "true-false";
  options: string[];
  index: number;
}
