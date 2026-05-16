'use client';

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Button } from "./buttons";
import { clearPlayerCookie, outQuiz } from "../actions/quiz";
import { soundManager } from "../utils/soundManager";

interface LobbyPhaseProps {
  quizName: string;
  username: string;
  participants: { username: string; icon: string }[];
}

/**
 * Fase de lobby: muestra la sala de espera con los jugadores conectados
 * en una grilla de pills, y un contador circular al fondo mientras el admin no inicia el quiz.
 */
export default function LobbyPhase({ quizName, username, participants }: LobbyPhaseProps) {
  const count = participants.length;
  const router = useRouter();
  const prevCount = useRef(count);

  useEffect(() => {
    if (count > prevCount.current) {
      soundManager.play('join');
    }
    prevCount.current = count;
  }, [count]);

  return (
    <main className="flex flex-col items-center p-8 flex-1 gap-6">

      {/* Header */}
      <div className="text-center pt-2">
        <h1 className="font-black text-2xl text-accent">{quizName}</h1>
        <p className="font-bold text-lg text-foreground mt-1">¡Ya estás dentro!</p>
      </div>

      {/* Player grid */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {participants.map(p => {
          const isMe = p.username === username;
          return (
            <div
              key={p.username}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full border-2 transition-colors ${
                isMe
                  ? 'border-main bg-white font-bold text-accent'
                  : 'border-gray-200 bg-white text-foreground font-medium'
              }`}
            >
              <span className="text-xl leading-none">{p.icon}</span>
              <span className="text-sm truncate">
                {isMe ? '(Tú) '+p.username : p.username}
              </span>
            </div>
          );
        })}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom — waiting indicator */}
      <div className="flex flex-col items-center gap-4 pb-4">
        <p className="text-secondary text-sm font-semibold">Esperando al anfitrión...</p>

        {/* Circular counter with pulse */}
        <div className="relative flex items-center justify-center w-24 h-24">
          {/* Ping ring */}
          <span className="absolute inline-flex w-full h-full rounded-full bg-main opacity-20 animate-ping" />

          {/* Static background ring */}
          <svg className="absolute inset-0 -rotate-90" width="96" height="96">
            <circle cx="48" cy="48" r="38" stroke="#e5e7eb" strokeWidth="6" fill="none" />
            <circle
              cx="48" cy="48" r="38"
              stroke="#6FCF97"
              strokeWidth="6"
              fill="none"
              strokeDasharray={2 * Math.PI * 38}
              strokeDashoffset={0}
              strokeLinecap="round"
            />
          </svg>

          {/* Inner white circle + count */}
          <div className="relative z-10 w-16 h-16 rounded-full bg-white flex flex-col items-center justify-center shadow-sm">
            <span className="font-black text-2xl text-accent leading-none">{count}</span>
            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Jugadores</span>
          </div>
        </div>
          <Button className="px-6 py-2 z-10" onClick={()=>{
            outQuiz()
            router.push('/')
            }}>
            Salir
          </Button>
          
      </div>


    </main>
  );
}
