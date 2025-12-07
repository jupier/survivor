// Sound manager for loading and playing audio
// Uses Web Audio API to generate simple sounds programmatically

export interface SoundManager {
  playEnemyHit: () => void;
  playEnemyDeath: () => void;
  playPlayerHit: () => void;
  playXPCollect: () => void;
  playLevelUp: () => void;
  playProjectileFire: () => void;
  playAOEActivate: () => void;
  playHealthCollect: () => void;
  setSFXVolume: (volume: number) => void;
}

// Create a single AudioContext for all sounds
function createAudioContext(): AudioContext {
  return new (window.AudioContext || (window as any).webkitAudioContext)();
}

// Generate a simple beep sound using Web Audio API
function generateBeepSound(
  audioContext: AudioContext,
  frequency: number,
  duration: number
): AudioBuffer {
  const sampleRate = audioContext.sampleRate;
  const numSamples = Math.floor(sampleRate * duration);
  const buffer = audioContext.createBuffer(1, numSamples, sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // Apply envelope to avoid clicks
    const envelope = Math.min(1, t * 100) * Math.min(1, (duration - t) * 100);
    data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3;
  }

  return buffer;
}

// Generate a more complex sound (e.g., for level up)
function generateLevelUpSound(audioContext: AudioContext): AudioBuffer {
  const sampleRate = audioContext.sampleRate;
  const duration = 0.5;
  const numSamples = Math.floor(sampleRate * duration);
  const buffer = audioContext.createBuffer(1, numSamples, sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const envelope = Math.min(1, t * 20) * Math.min(1, (duration - t) * 10);
    // Ascending tone
    const frequency = 200 + (t / duration) * 400;
    data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3;
  }

  return buffer;
}

export async function loadSounds(): Promise<SoundManager> {
  // Create audio context
  const audioContext = createAudioContext();

  // Generate sound buffers
  const enemyHitSound = generateBeepSound(audioContext, 300, 0.1);
  const enemyDeathSound = generateBeepSound(audioContext, 200, 0.2);
  const playerHitSound = generateBeepSound(audioContext, 150, 0.3);
  const xpCollectSound = generateBeepSound(audioContext, 600, 0.15);
  const levelUpSound = generateLevelUpSound(audioContext);
  const projectileFireSound = generateBeepSound(audioContext, 400, 0.05);
  const aoeActivateSound = generateBeepSound(audioContext, 100, 0.4);
  const healthCollectSound = generateBeepSound(audioContext, 500, 0.2);

  // Volume controls
  let sfxVolume = 0.5;

  // Helper function to resume audio context if suspended (required by browsers)
  const resumeAudioContext = async () => {
    if (audioContext.state === "suspended") {
      try {
        await audioContext.resume();
      } catch (e) {
        // Silently fail
      }
    }
  };

  // Helper function to play a sound buffer
  const playSound = async (buffer: AudioBuffer, volume: number = sfxVolume) => {
    try {
      // Resume audio context if suspended (browser autoplay policy)
      await resumeAudioContext();
      
      const source = audioContext.createBufferSource();
      const gainNode = audioContext.createGain();
      
      source.buffer = buffer;
      gainNode.gain.value = volume;
      
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      source.start(0);
    } catch (e) {
      // Silently fail if audio context is not available
      console.warn("Could not play sound:", e);
    }
  };

  // Set SFX volume
  const setSFXVolume = (volume: number) => {
    sfxVolume = Math.max(0, Math.min(1, volume));
  };

  return {
    playEnemyHit: () => playSound(enemyHitSound),
    playEnemyDeath: () => playSound(enemyDeathSound),
    playPlayerHit: () => playSound(playerHitSound),
    playXPCollect: () => playSound(xpCollectSound),
    playLevelUp: () => playSound(levelUpSound),
    playProjectileFire: () => playSound(projectileFireSound, sfxVolume * 0.5), // Quieter
    playAOEActivate: () => playSound(aoeActivateSound),
    playHealthCollect: () => playSound(healthCollectSound),
    setSFXVolume,
  };
}

