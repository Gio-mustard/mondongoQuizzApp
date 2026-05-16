'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSessionStatus, getSessionQuestions, submitAnswer, getLeaderboard, clearPlayerCookie } from '@/app/actions/quiz';
import type { SafeQuestion } from '@/app/types';
import { useRouter } from 'next/navigation';
import LobbyPhase from './lobby-phase';
import GamePhase from './game-phase';
import ResultsPhase from './results-phase';

const MAX_SECONDS_PER_QUESTION = 60;

interface QuizClientProps {
  sessionId: string;
  username: string;
  icon: string;
  initialStatus: string;
  quizName: string;
}

interface LeaderboardEntry {
  username: string;
  icon: string;
  score: number;
  finished: boolean;
  totalAnswered: number;
}

type GamePhaseType = 'lobby' | 'game' | 'results';

/**
 * Orquestador principal del flujo de juego. Gestiona todo el estado compartido
 * y delega el render a LobbyPhase, GamePhase o ResultsPhase según la fase activa.
 */
export default function QuizClient({ sessionId, username, icon, initialStatus, quizName }: QuizClientProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<GamePhaseType>(initialStatus === 'in_progress' ? 'game' : 'lobby');

  // Lobby
  const [participants, setParticipants] = useState<{ username: string; icon: string }[]>([]);

  // Game
  const [questions, setQuestions] = useState<SafeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(MAX_SECONDS_PER_QUESTION);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answerResult, setAnswerResult] = useState<{ correct: boolean; correctAnswer: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [score, setScore] = useState(0);

  // Results
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [sessionStatus, setSessionStatus] = useState(initialStatus);

  /** Polling en lobby: detecta cuando el admin inicia el quiz y carga las preguntas. */
  useEffect(() => {
    if (phase !== 'lobby') return;

    const poll = async () => {
      const status = await getSessionStatus(sessionId);
      if (!status) return;

      setParticipants(status.participants);

      if (status.status === 'in_progress') {
        const qs = await getSessionQuestions(sessionId);
        if (qs) {
          setQuestions(qs);
          setQuestionStartTime(Date.now());
          setTimeLeft(MAX_SECONDS_PER_QUESTION);
          setPhase('game');
        }
      }
    };

    poll();
    const interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
  }, [phase, sessionId]);

  /** Carga las preguntas cuando la fase cambia a 'game' sin preguntas en estado. */
  useEffect(() => {
    if (phase === 'game' && questions.length === 0) {
      getSessionQuestions(sessionId).then(qs => {
        if (qs) {
          setQuestions(qs);
          setQuestionStartTime(Date.now());
        }
      });
    }
  }, [phase, questions.length, sessionId]);

  /** Timer de cuenta regresiva por pregunta. Al llegar a cero, auto-envía la respuesta con índice -1. */
  useEffect(() => {
    if (phase !== 'game' || selectedOption !== null) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit(-1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, currentIndex, selectedOption]);

  /** Polling en results: actualiza el leaderboard cada 3 segundos mientras otros jugadores terminan. */
  useEffect(() => {
    if (phase !== 'results') return;

    const poll = async () => {
      const data = await getLeaderboard(sessionId);
      if (data) {
        setLeaderboard(data.participants);
        setSessionStatus(data.status);
      }
    };

    poll();
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [phase, sessionId]);

  /** Envía la respuesta seleccionada al servidor y avanza a la siguiente pregunta o a resultados. */
  const handleSubmit = useCallback(async (optionIndex: number) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSelectedOption(optionIndex);

    const timeMs = Date.now() - questionStartTime;
    const result = await submitAnswer(sessionId, username, currentIndex, optionIndex, timeMs);

    if (result.success) {
      setAnswerResult({ correct: result.correct!, correctAnswer: result.correctAnswer! });
      if (result.correct) setScore(prev => prev + 1);

      setTimeout(() => {
        if (currentIndex + 1 >= questions.length) {
          setPhase('results');
        } else {
          setCurrentIndex(prev => prev + 1);
          setSelectedOption(null);
          setAnswerResult(null);
          setTimeLeft(MAX_SECONDS_PER_QUESTION);
          setQuestionStartTime(Date.now());
        }
        setIsSubmitting(false);
      }, 1500);
    } else {
      setIsSubmitting(false);
    }
  }, [isSubmitting, questionStartTime, sessionId, username, currentIndex, questions.length]);

  /** Limpia la cookie del jugador y redirige al inicio. */
  const handleGoHome = async () => {
    await clearPlayerCookie();
    router.push('/');
  };

  if (phase === 'lobby') {
    return (
      <LobbyPhase
        quizName={quizName}
        username={username}
        participants={participants}
      />
    );
  }

  if (phase === 'game' && questions.length > 0) {
    return (
      <GamePhase
        icon={icon}
        score={score}
        timeLeft={timeLeft}
        currentIndex={currentIndex}
        questions={questions}
        selectedOption={selectedOption}
        answerResult={answerResult}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />
    );
  }

  if (phase === 'results') {
    return (
      <ResultsPhase
        quizName={quizName}
        username={username}
        icon={icon}
        leaderboard={leaderboard}
        sessionStatus={sessionStatus}
        onGoHome={handleGoHome}
      />
    );
  }

  return (
    <main className="flex items-center justify-center flex-1">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent" />
    </main>
  );
}
