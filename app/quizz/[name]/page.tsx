import { redirect } from 'next/navigation';
import { getPlayerCookie, getSessionStatus } from '@/app/actions/quiz';
import QuizClient from '@/app/components/quiz-client';

/**
 * Página del quiz. Server component que verifica la cookie del jugador
 * y su participación en la sesión antes de renderizar el cliente del juego.
 */
export default async function QuizzPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;

  const player = await getPlayerCookie();

  if (!player) {
    redirect('/');
  }

  const { sessionId, username, icon } = player;

  const session = await getSessionStatus(sessionId);

  if (!session) {
    redirect('/');
  }

  const isParticipant = session.participants.some(
    (p: { username: string }) => p.username === username
  );

  if (!isParticipant) {
    redirect('/');
  }

  return (
    <QuizClient
      sessionId={sessionId}
      username={username}
      icon={icon}
      initialStatus={session.status}
      quizName={name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
    />
  );
}