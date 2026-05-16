'use client';

import { useEffect, useState } from 'react';

interface LeaderboardEntry {
  username: string;
  icon: string;
  score: number;
  finished: boolean;
  totalAnswered: number;
}

interface ResultsPhaseProps {
  quizName: string;
  username: string;
  icon: string;
  leaderboard: LeaderboardEntry[];
  sessionStatus: string;
  onGoHome: () => void;
}

const ROW_HEIGHT = 76;
const MEDALS = ['🥇', '🥈', '🥉'];

/**
 * Fase de resultados con leaderboard animado.
 * Cada fila tiene posición absoluta (top = rank * ROW_HEIGHT) con transición CSS,
 * por lo que cuando cambia el ranking los jugadores se deslizan a su nueva posición.
 * Las barras horizontales crecen/se reducen con transition:width al actualizarse el score.
 */
export default function ResultsPhase({
  quizName,
  username,
  icon,
  leaderboard,
  sessionStatus,
  onGoHome,
}: ResultsPhaseProps) {
  const [barsReady, setBarsReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setBarsReady(true), 80);
    return () => clearTimeout(t);
  }, []);

  const maxScore = Math.max(...leaderboard.map(p => p.score), 1);
  const playerEntry = leaderboard.find(p => p.username === username);
  const playerRank = leaderboard.findIndex(p => p.username === username) + 1;

  return (
    <main className="flex flex-col items-center flex-1 bg-background overflow-hidden">

      {/* Header */}
      <div className="text-center pt-8 pb-4 px-6 shrink-0">
        <h1 className="font-bold text-2xl text-accent">{quizName}</h1>
        <p className="text-gray-400 text-sm mt-1">Resultados Finales</p>
      </div>

      {/* Animated leaderboard */}
      <div className="w-full max-w-sm px-4 flex-1 overflow-hidden">
        <div
          className="relative w-full"
          style={{ height: `${leaderboard.length * ROW_HEIGHT}px` }}
        >
          {leaderboard.map((player, rank) => {
            const isMe = player.username === username;
            const barPct = barsReady ? (player.score / maxScore) * 100 : 0;
            const entryDelay = barsReady ? 0 : rank * 60;

            return (
              <div
                key={player.username}
                className="absolute w-full"
                style={{
                  top: `${rank * ROW_HEIGHT}px`,
                  transition: 'top 0.65s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  transitionDelay: '0ms',
                }}
              >
                {/* Row card */}
                <div
                  className={`flex items-center gap-3 rounded-2xl px-3 py-2 mx-1 transition-colors duration-300 ${
                    isMe ? 'bg-main/15 shadow-sm' : 'bg-white/60'
                  }`}
                  style={{
                    opacity: barsReady ? 1 : 0,
                    transform: barsReady ? 'translateX(0)' : 'translateX(-16px)',
                    transition: `opacity 0.4s ease ${entryDelay}ms, transform 0.4s ease ${entryDelay}ms`,
                  }}
                >
                  {/* Rank medal / number */}
                  <span className="w-8 text-center text-base shrink-0">
                    {rank < 3 ? MEDALS[rank] : (
                      <span className="font-bold text-sm text-gray-400">{rank + 1}</span>
                    )}
                  </span>

                  {/* Avatar bubble */}
                  <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-xl bg-white shrink-0 shadow-sm ${
                    isMe ? 'border-main' : 'border-gray-200'
                  }`}>
                    {player.icon}
                  </div>

                  {/* Name + animated bar */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold truncate flex items-center gap-1 ${isMe ? 'text-accent' : 'text-gray-600'}`}>
                      {player.username}
                      {!player.finished && (
                        <span className="inline-block w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                      )}
                    </p>
                    <div className="mt-1.5 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isMe ? 'bg-main' : 'bg-secondary/40'}`}
                        style={{
                          width: `${barPct}%`,
                          transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                      />
                    </div>
                  </div>

                  {/* Score */}
                  <span className={`text-sm font-black tabular-nums shrink-0 ${isMe ? 'text-accent' : 'text-gray-400'}`}>
                    {player.score * 1000}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="w-full px-4 pb-6 pt-4 space-y-3 shrink-0">
        {sessionStatus !== 'finished' && (
          <p className="text-center text-xs text-amber-600 flex items-center justify-center gap-1">
            <span className="inline-block w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
            Esperando a que todos terminen...
          </p>
        )}

        <div className="bg-main rounded-2xl px-6 py-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-lg bg-white rounded-full w-8 h-8 p-1 flex items-center justify-center">{icon}</span>
            <span className="text-white font-bold text-sm">
              {playerRank > 0 ? `Lugar ${playerRank}` : 'Sin resultado'}
            </span>
          </div>
          {playerEntry && (
            <span className="text-white font-black text-base">
              {playerEntry.score * 1000} pts
            </span>
          )}
        </div>

        <button
          onClick={onGoHome}
          className="w-full text-center text-sm text-gray-400 hover:text-accent transition-colors py-2"
        >
          ← Volver al inicio
        </button>
      </div>
    </main>
  );
}
