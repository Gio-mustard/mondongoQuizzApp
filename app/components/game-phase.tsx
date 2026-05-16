'use client';

import type { SafeQuestion } from '@/app/types';

const MAX_SECONDS_PER_QUESTION = 60;
const OPTION_COLORS = [
  { bg: 'bg-red-500', hover: 'hover:bg-red-600' },
  { bg: 'bg-blue-500', hover: 'hover:bg-blue-600' },
  { bg: 'bg-yellow-500', hover: 'hover:bg-yellow-600' },
  { bg: 'bg-green-500', hover: 'hover:bg-green-600' },
];

interface GamePhaseProps {
  icon: string;
  score: number;
  timeLeft: number;
  currentIndex: number;
  questions: SafeQuestion[];
  selectedOption: number | null;
  answerResult: { correct: boolean; correctAnswer: number } | null;
  isSubmitting: boolean;
  onSubmit: (optionIndex: number) => void;
}

/**
 * Fase de juego: muestra la pregunta actual con su timer circular, barra de progreso,
 * opciones de respuesta con colores estilo Kahoot y feedback inmediato tras responder.
 */
export default function GamePhase({
  icon,
  score,
  timeLeft,
  currentIndex,
  questions,
  selectedOption,
  answerResult,
  isSubmitting,
  onSubmit,
}: GamePhaseProps) {
  const question = questions[currentIndex];
  const circumference = 2 * Math.PI * 18;
  const progress = (timeLeft / MAX_SECONDS_PER_QUESTION) * 100;
  const offset = circumference - (circumference * progress / 100);
  const showResult = answerResult !== null;

  return (
    <main className="flex flex-col p-6 md:p-8 flex-1">
      {/* Header */}
      <section className="flex justify-between items-center mb-6">
        <span className="text-sm text-gray-500 font-medium">
          Pregunta {currentIndex + 1}/{questions.length}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-accent">
            {icon} {score} pts
          </span>
          <div className="relative h-10 w-10">
            <svg className="absolute inset-0 transform -rotate-90" width="40" height="40">
              <circle cx="20" cy="20" r="18" stroke="#e5e7eb" strokeWidth="2" fill="none" />
              <circle
                className="transition-all duration-1000"
                cx="20" cy="20" r="18"
                stroke={timeLeft <= 5 ? '#ef4444' : '#6FCF97'}
                strokeWidth="4" fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
              />
            </svg>
            <div className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${
              timeLeft <= 5 ? 'text-red-500' : 'text-foreground'
            }`}>
              {timeLeft}
            </div>
          </div>
        </div>
      </section>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-8">
        <div
          className="bg-accent h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <h1 className="font-bold text-2xl md:text-3xl text-foreground mb-8">
        {question.title}
      </h1>

      {/* Options */}
      <div className={`grid gap-4 flex-1 ${question.type === 'true-false' ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2'}`}>
        {question.options.map((option, i) => {
          const colors = OPTION_COLORS[i % OPTION_COLORS.length];
          const isSelected = selectedOption === i;
          const isCorrectAnswer = answerResult?.correctAnswer === i;

          let buttonStyle = `${colors.bg} ${colors.hover} text-white`;
          if (showResult) {
            if (isCorrectAnswer) {
              buttonStyle = 'bg-green-500 text-white ring-4 ring-green-300 scale-105';
            } else if (isSelected && !answerResult!.correct) {
              buttonStyle = 'bg-red-800 text-white opacity-75';
            } else {
              buttonStyle = 'bg-gray-300 text-gray-500 opacity-50';
            }
          }

          return (
            <button
              key={i}
              onClick={() => !showResult && !isSubmitting && onSubmit(i)}
              disabled={showResult || isSubmitting}
              className={`p-6 rounded-xl font-bold text-lg md:text-xl transition-all duration-300 transform hover:scale-[1.02] disabled:cursor-not-allowed ${buttonStyle}`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {answerResult && (
        <div className={`mt-6 text-center text-lg font-bold ${answerResult.correct ? 'text-green-600' : 'text-red-600'}`}>
          {selectedOption === -1
            ? '⏰ ¡Se acabó el tiempo!'
            : answerResult.correct
              ? '✅ ¡Correcto!'
              : '❌ Incorrecto'
          }
        </div>
      )}
    </main>
  );
}
