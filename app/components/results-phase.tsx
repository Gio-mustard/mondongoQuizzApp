'use client';

import { useEffect, useState } from 'react';
import { Button } from './buttons';

interface LeaderboardEntry {
  username: string;
  icon: string;
  score: number;
  finished: boolean;
  totalAnswered: number;
}

interface ResultsPhaseProps {
  quizName: string;
  username?: string;
  icon?: string;
  leaderboard: LeaderboardEntry[];
  sessionStatus: string;
  onGoHome?: () => void;
}

const ROW_HEIGHT = 76;

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
  const MEDALS = [
    <svg key="1st" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 inline-block fill-yellow-500 drop-shadow-sm" viewBox="0 0 24 24">
      <path d="m9.493,20.25l-3.401,3.296c-.932.911-2.504.374-2.683-.917l-.218-1.568-1.765-.182c-1.344-.139-1.911-1.785-.939-2.723l2.306-2.223c.5,1.388,1.65,2.486,3.076,2.894.735.211,1.505.247,2.231.105.36.534.84.963,1.393,1.318Zm14.019-2.094l-2.306-2.223c-.5,1.388-1.65,2.486-3.076,2.894-.735.211-1.505.247-2.231.105-.36.534-.84.963-1.393,1.318l3.401,3.296c.932.911,2.504.374,2.683-.917l.218-1.568,1.765-.182c1.344-.139,1.911-1.785.939-2.723Zm-9.241-.387c-.233.361-.564.679-.994.918-.782.433-1.771.433-2.553,0-.431-.239-.761-.557-.994-.918-.416-.644-1.181-.987-1.929-.817-.428.097-.896.091-1.38-.048-.859-.246-1.559-.946-1.805-1.805-.139-.484-.145-.953-.048-1.382.17-.748-.173-1.513-.817-1.928-.362-.233-.679-.564-.918-.995-.219-.394-.325-.842-.323-1.289-.002-.447.105-.894.323-1.289.239-.431.557-.761.918-.995.644-.416.987-1.181.817-1.928-.097-.429-.091-.897.048-1.381.246-.859.946-1.559,1.805-1.805.484-.139.952-.145,1.38-.048.748.17,1.513-.172,1.929-.817.233-.361.563-.679.994-.918.782-.433,1.772-.433,2.553,0,.431.239.761.557.994.918.416.644,1.181.987,1.929.817.428-.097.896-.091,1.38.048.859.246,1.559.946,1.805,1.805.139.484.145.953.048,1.381-.17.748.173,1.513.817,1.928.362.233.679.564.918.995.219.394.325.842.323,1.289.002.447-.105.894-.323,1.289-.239.431-.557.761-.918.995-.644.416-.987,1.181-.817,1.928.097.429.091.897-.048,1.382-.246.859-.946,1.559-1.805,1.805-.484.139-.952.145-1.38.048-.748-.17-1.513.172-1.929.817Zm-1.271-11.323c0-.586-.35-1.109-.892-1.334-.539-.226-1.158-.102-1.573.312l-1.242,1.242c-.391.391-.391,1.023,0,1.414s1.023.391,1.414,0l.293-.293v6.213c0,.553.447,1,1,1s1-.447,1-1v-7.555Z"/>
    </svg>,
    <svg key="2nd" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 inline-block fill-gray-400 drop-shadow-sm" viewBox="0 0 24 24">
      <path d="m9.493,20.25l-3.401,3.296c-.932.911-2.504.374-2.683-.917l-.218-1.568-1.765-.182c-1.344-.139-1.911-1.785-.939-2.723l2.306-2.223c.5,1.388,1.65,2.486,3.076,2.894.735.211,1.505.247,2.231.105.36.534.84.963,1.393,1.318Zm14.019-2.094l-2.306-2.223c-.5,1.388-1.65,2.486-3.076,2.894-.735.211-1.505.247-2.231.105-.36.534-.84.963-1.393,1.318l3.401,3.296c.932.911,2.504.374,2.683-.917l.218-1.568,1.765-.182c1.344-.139,1.911-1.785.939-2.723Zm-9.241-.387c-.233.361-.564.679-.994.918-.782.433-1.771.433-2.553,0-.431-.239-.761-.557-.994-.918-.416-.644-1.181-.987-1.929-.817-.428.097-.896.091-1.38-.048-.859-.246-1.559-.946-1.805-1.805-.139-.484-.145-.953-.048-1.382.17-.748-.173-1.513-.817-1.928-.362-.233-.679-.564-.918-.995-.219-.394-.325-.842-.323-1.289-.002-.447.105-.894.323-1.289.239-.431.557-.761.918-.995.644-.416.987-1.181.817-1.928-.097-.429-.091-.897.048-1.381.246-.859.946-1.559,1.805-1.805.484-.139.952-.145,1.38-.048.748.17,1.513-.172,1.929-.817.233-.361.563-.679.994-.918.782-.433,1.772-.433,2.553,0,.431.239.761.557.994.918.416.644,1.181.987,1.929.817.428-.097.896-.091,1.38.048.859.246,1.559.946,1.805,1.805.139.484.145.953.048,1.381-.17.748.173,1.513.817,1.928.362.233.679.564.918.995.219.394.325.842.323,1.289.002.447-.105.894-.323,1.289-.239.431-.557.761-.918.995-.644.416-.987,1.181-.817,1.928.097.429.091.897-.048,1.382-.246.859-.946,1.559-1.805,1.805-.484.139-.952.145-1.38.048-.748-.17-1.513.172-1.929.817Zm.729-3.768c0-.553-.447-1-1-1h-2.557c.069-.056.14-.113.212-.171,1.427-1.154,3.583-2.897,3.321-5.257-.165-1.467-1.444-2.572-2.977-2.572-1.654,0-3,1.346-3,3,0,.553.447,1,1,1s1-.447,1-1,.448-1,1-1c.505,0,.938.35.988.794.142,1.271-1.438,2.547-2.591,3.479-.307.248-.588.477-.815.682-.545.493-.727,1.252-.464,1.934.26.675.896,1.111,1.622,1.111h3.26c.553,0,1-.447,1-1Z"/>
    </svg>,
    <svg key="3rd" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 inline-block fill-amber-700 drop-shadow-sm" viewBox="0 0 24 24">
      <path d="m9.493,20.25l-3.401,3.296c-.932.911-2.504.374-2.683-.917l-.218-1.568-1.765-.182c-1.344-.139-1.911-1.785-.939-2.723l2.306-2.223c.5,1.388,1.65,2.486,3.076,2.894.735.211,1.505.247,2.231.105.36.534.84.963,1.393,1.318Zm14.019-2.094l-2.306-2.223c-.5,1.388-1.65,2.486-3.076,2.894-.735.211-1.505.247-2.231.105-.36.534-.84.963-1.393,1.318l3.401,3.296c.932.911,2.504.374,2.683-.917l.218-1.568,1.765-.182c1.344-.139,1.911-1.785.939-2.723Zm-9.241-.387c-.233.361-.564.679-.994.918-.782.433-1.771.433-2.553,0-.431-.239-.761-.557-.994-.918-.416-.644-1.181-.987-1.929-.817-.428.097-.896.091-1.38-.048-.859-.246-1.559-.946-1.805-1.805-.139-.484-.145-.953-.048-1.382.17-.748-.173-1.513-.817-1.928-.362-.233-.679-.564-.918-.995-.219-.394-.325-.842-.323-1.289-.002-.447.105-.894.323-1.289.239-.431.557-.761.918-.995.644-.416.987-1.181.817-1.928-.097-.429-.091-.897.048-1.381.246-.859.946-1.559,1.805-1.805.484-.139.952-.145,1.38-.048.748.17,1.513-.172,1.929-.817.233-.361.563-.679.994-.918.782-.433,1.772-.433,2.553,0,.431.239.761.557.994.918.416.644,1.181.987,1.929.817.428-.097.896-.091,1.38.048.859.246,1.559.946,1.805,1.805.139.484.145.953.048,1.381-.17.748.173,1.513.817,1.928.362.233.679.564.918.995.219.394.325.842.323,1.289.002.447-.105.894-.323,1.289-.239.431-.557.761-.918.995-.644.416-.987,1.181-.817,1.928.097.429.091.897-.048,1.382-.246.859-.946,1.559-1.805,1.805-.484.139-.952.145-1.38.048-.748-.17-1.513.172-1.929.817Zm1.396-5.768c0-.959-.461-1.805-1.163-2.354.312-.473.496-1.038.496-1.646,0-1.654-1.346-3-3-3h-2c-.552,0-1,.447-1,1s.448,1,1,1h2c.551,0,1,.448,1,1s-.449,1-1,1h-1c-.552,0-1,.447-1,1s.448,1,1,1h1.667c.551,0,1,.448,1,1s-.449,1-1,1h-2.667c-.552,0-1,.447-1,1s.448,1,1,1h2.667c1.655,0,3-1.346,3-3Z"/>
    </svg>,
  ];

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
            {username ? 'Esperando a que todos terminen...' : 'Sesión en progreso...'}
          </p>
        )}

        {username ? (
          /* Player view: shows their own rank and score */
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
        ) : (
          /* Admin view: shows session status chip */
          <div className={`rounded-2xl px-6 py-4 flex items-center justify-between shadow-lg ${
            sessionStatus === 'finished' ? 'bg-accent' : 'bg-secondary'
          }`}>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${
                sessionStatus === 'finished' ? 'bg-white' : 'bg-white animate-pulse'
              }`} />
              <span className="text-white font-bold text-sm">
                {sessionStatus === 'finished' ? 'Sesión finalizada' : 'Sesión en progreso'}
              </span>
            </div>
            <span className="text-white/80 font-semibold text-sm">
              {leaderboard.length} jugadores
            </span>
          </div>
        )}

        {onGoHome && (
          <button
            onClick={onGoHome}
            className="w-full text-center text-sm text-gray-400 hover:text-accent transition-colors py-2"
          >
            ← {username ? 'Volver al inicio' : 'Volver al panel admin'}
          </button>
        )}
      </div>
    </main>
  );
}
