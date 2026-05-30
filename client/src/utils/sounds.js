// Simple sound effects using Web Audio API
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playTone(frequency, duration, type = "sine", volume = 0.1) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

  gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
}

export const sounds = {
  correct: () => {
    playTone(523.25, 0.1, "sine", 0.15); // C5
    setTimeout(() => playTone(659.25, 0.1, "sine", 0.15), 100); // E5
    setTimeout(() => playTone(783.99, 0.2, "sine", 0.15), 200); // G5
  },
  wrong: () => {
    playTone(200, 0.2, "sawtooth", 0.1);
    setTimeout(() => playTone(150, 0.3, "sawtooth", 0.1), 150);
  },
  click: () => {
    playTone(800, 0.05, "sine", 0.05);
  },
  success: () => {
    playTone(523.25, 0.1, "sine", 0.1);
    setTimeout(() => playTone(659.25, 0.1, "sine", 0.1), 100);
    setTimeout(() => playTone(783.99, 0.1, "sine", 0.1), 200);
    setTimeout(() => playTone(1046.50, 0.3, "sine", 0.1), 300); // C6
  },
  achievement: () => {
    const melody = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
    melody.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.15, "sine", 0.12), i * 100);
    });
  },
};
