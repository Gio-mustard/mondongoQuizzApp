'use client';

import { useState, useEffect } from 'react';
import { soundManager } from '../utils/soundManager';

export function MuteButton({ className = '' }: { className?: string }) {
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    // Inicializar estado basado en el manager (que lee de localStorage)
    setMuted(soundManager.isMuted());
  }, []);

  const toggleMute = () => {
    const newState = soundManager.toggleMute();
    setMuted(newState);
    if (!newState) {
      soundManager.play('click');
    }
  };

  return (
    <button
      onClick={toggleMute}
      className={`fixed top-4 left-4 z-50 p-3 rounded-full bg-white shadow-md text-gray-500 hover:text-accent transition-colors ${className}`}
      aria-label={muted ? 'Activar sonido' : 'Silenciar sonido'}
      title={muted ? 'Activar sonido' : 'Silenciar sonido'}
    >
      {muted ? (
        // Icono de volumen apagado (Mute)
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <line x1="23" y1="9" x2="17" y2="15"></line>
          <line x1="17" y1="9" x2="23" y2="15"></line>
        </svg>
      ) : (
        // Icono de volumen encendido
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
        </svg>
      )}
    </button>
  );
}
