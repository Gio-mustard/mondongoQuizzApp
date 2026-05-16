'use client';

type SoundName = 'click' | 'correct' | 'incorrect' | 'join' | 'game-over';

class SoundManager {
  private muted: boolean = false;
  private audioContext: AudioContext | null = null;
  private buffers: Map<string, AudioBuffer | null> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem('mondongo_muted');
      if (savedMute === 'true') {
        this.muted = true;
      }
    }
  }

  private initContext() {
    if (!this.audioContext && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
      }
    }
  }

  public isMuted() {
    return this.muted;
  }

  public toggleMute() {
    this.muted = !this.muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('mondongo_muted', String(this.muted));
    }
    return this.muted;
  }

  public async play(sound: SoundName) {
    if (this.muted) return;
    this.initContext();
    if (!this.audioContext) return;

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    try {
      // 1. Intentar cargar y reproducir el archivo desde /sounds/
      let buffer = this.buffers.get(sound);
      if (buffer === undefined) {
        const response = await fetch(`/sounds/${sound}.mp3`);
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          buffer = await this.audioContext.decodeAudioData(arrayBuffer);
          this.buffers.set(sound, buffer);
        } else {
          this.buffers.set(sound, null); // Archivo no encontrado
          buffer = null;
        }
      }

      if (buffer) {
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(this.audioContext.destination);
        source.start(0);
        return;
      }
      
    } catch (e) {
      // Fetch o decode falló
      this.buffers.set(sound, null);
    }

    // 2. Fallback: Sonidos generados (Mejor que Base64 porque no pesa y suena nativo)
    this.playFallback(sound);
  }

  private playFallback(sound: SoundName) {
    if (!this.audioContext) return;
    const osc = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    const now = this.audioContext.currentTime;

    switch (sound) {
      case 'click':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      case 'correct':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now); // A4
        osc.frequency.setValueAtTime(554.37, now + 0.1); // C#5
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
      case 'incorrect':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(200, now + 0.3);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
      case 'join':
        osc.type = 'square';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.setValueAtTime(600, now + 0.1);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
      case 'game-over':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(330, now + 0.2);
        osc.frequency.setValueAtTime(220, now + 0.4);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
        break;
    }
  }
}

export const soundManager = new SoundManager();
