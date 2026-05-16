'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useAdminAuth } from '@/app/context/adminAuth';
import { getLatestSessionBySlug, getSessionById } from '@/app/actions/quiz';
import ResultsPhase from '@/app/components/results-phase';

interface LeaderboardEntry {
  username: string;
  icon: string;
  score: number;
  finished: boolean;
  totalAnswered: number;
}

interface SessionData {
  sessionId: string;
  status: string;
  quizName: string;
  quizSlug: string;
  participants: LeaderboardEntry[];
}

/**
 * Página de administrador para ver el leaderboard de una sesión.
 * Soporta:
 *  - /admin/[quiz-slug]          → muestra la sesión más reciente
 *  - /admin/[quiz-slug]?id=X     → muestra la sesión con ese ID;
 *                                   si está in_progress redirige a la ruta sin ?id
 */
export default function AdminSessionPage() {
  const router = useRouter();
  const params = useParams<{ 'quiz-slug': string }>();
  const searchParams = useSearchParams();
  const slug = params['quiz-slug'];
  const sessionId = searchParams.get('id');

  const { password, isAuthenticated } = useAdminAuth();

  const [data, setData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/admin');
    }
  }, [isAuthenticated, router]);

  const fetchData = async (): Promise<SessionData | null> => {
    if (sessionId) {
      const result = await getSessionById(password, sessionId);
      if (!result) return null;

      if (result.status === 'in_progress') {
        router.replace(`/admin/${slug}`);
        return null;
      }

      return {
        sessionId: result.sessionId,
        status: result.status,
        quizName: result.quizName,
        quizSlug: result.quizSlug,
        participants: result.participants,
      };
    } else {
      const result = await getLatestSessionBySlug(password, slug);
      if (!result) return null;

      return {
        sessionId: result.sessionId,
        status: result.status,
        quizName: result.quizName,
        quizSlug: result.quizSlug,
        participants: result.participants,
      };
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      const result = await fetchData();
      if (cancelled) return;

      if (!result) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setData(result);
      setLoading(false);

      if (result.status === 'in_progress') {
        pollingRef.current = setInterval(async () => {
          const updated = await fetchData();
          if (cancelled || !updated) return;
          setData(updated);

          if (updated.status !== 'in_progress') {
            clearInterval(pollingRef.current!);
            pollingRef.current = null;
          }
        }, 1000);
      }
    };

    load();

    return () => {
      cancelled = true;
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [isAuthenticated, slug, sessionId]);

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <main className="flex items-center justify-center flex-1 bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent" />
      </main>
    );
  }

  if (notFound || !data) {
    return (
      <main className="flex flex-col items-center justify-center flex-1 bg-background gap-4 p-8 text-center">
        <p className="text-4xl">📭</p>
        <h1 className="font-bold text-xl text-foreground">Sin sesiones</h1>
        <p className="text-gray-400 text-sm">No hay sesiones registradas para este quiz.</p>
        <button
          onClick={() => router.push('/admin')}
          className="mt-4 text-sm text-secondary hover:text-accent transition-colors"
        >
          ← Volver al panel admin
        </button>
      </main>
    );
  }

  return (
    <ResultsPhase
      quizName={data.quizName}
      leaderboard={data.participants}
      sessionStatus={data.status}
      onGoHome={() => router.push('/admin')}
    />
  );
}
