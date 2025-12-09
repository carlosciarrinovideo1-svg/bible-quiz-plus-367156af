import { useCallback, useRef, useEffect } from 'react';

interface AudioFeedbackOptions {
  volume?: number;
  enabled?: boolean;
}

export const useAudioFeedback = (options: AudioFeedbackOptions = {}) => {
  const { volume = 0.5, enabled = true } = options;
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine') => {
    if (!enabled) return;

    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }, [enabled, volume, getAudioContext]);

  const playCorrect = useCallback(() => {
    playTone(523.25, 0.15, 'sine'); // C5
    setTimeout(() => playTone(659.25, 0.15, 'sine'), 100); // E5
    setTimeout(() => playTone(783.99, 0.2, 'sine'), 200); // G5
  }, [playTone]);

  const playIncorrect = useCallback(() => {
    playTone(200, 0.3, 'sawtooth');
  }, [playTone]);

  const playClick = useCallback(() => {
    playTone(800, 0.05, 'square');
  }, [playTone]);

  const playSuccess = useCallback(() => {
    const notes = [523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77, 1046.5];
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.1, 'sine'), i * 80);
    });
  }, [playTone]);

  const playGameOver = useCallback(() => {
    playTone(400, 0.3, 'sine');
    setTimeout(() => playTone(350, 0.3, 'sine'), 200);
    setTimeout(() => playTone(300, 0.4, 'sine'), 400);
  }, [playTone]);

  return {
    playCorrect,
    playIncorrect,
    playClick,
    playSuccess,
    playGameOver,
  };
};
