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

// Generate a pleasant sound with harmonics and smooth envelope
function generatePleasantSound(
  audioContext: AudioContext,
  frequency: number,
  duration: number,
  type: "hit" | "collect" | "fire" | "death" = "hit"
): AudioBuffer {
  const sampleRate = audioContext.sampleRate;
  const numSamples = Math.floor(sampleRate * duration);
  const buffer = audioContext.createBuffer(1, numSamples, sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const progress = t / duration;

    // Smooth, gentle envelope (softer attack and decay)
    let envelope = 1;
    if (type === "hit" || type === "fire") {
      // Very gentle attack and decay
      const attackTime = 0.08;
      const decayTime = 0.15;
      if (t < attackTime) {
        envelope = Math.sin(((t / attackTime) * Math.PI) / 2); // Smooth sine attack
      } else if (t < attackTime + decayTime) {
        const decayProgress = (t - attackTime) / decayTime;
        envelope = 1 - decayProgress * 0.6; // Gentle decay
      } else {
        envelope = 0.4 * Math.exp(-(t - attackTime - decayTime) * 5); // Smooth fade
      }
    } else if (type === "collect") {
      // Very smooth bell-like envelope
      const attackTime = 0.03;
      const sustainTime = 0.08;
      if (t < attackTime) {
        envelope = Math.sin(((t / attackTime) * Math.PI) / 2); // Smooth attack
      } else if (t < attackTime + sustainTime) {
        envelope = 1;
      } else {
        const releaseProgress =
          (t - attackTime - sustainTime) /
          (duration - attackTime - sustainTime);
        envelope = Math.cos((releaseProgress * Math.PI) / 2); // Smooth cosine release
      }
    } else {
      // Death sound - very gentle fade
      envelope = Math.exp(-t * 2) * (1 - progress * 0.3);
    }

    // Softer harmonics - less aggressive
    let sample = 0;
    if (type === "hit" || type === "fire") {
      // Softer sound with gentle harmonics
      sample = Math.sin(2 * Math.PI * frequency * t) * 0.7;
      sample += Math.sin(2 * Math.PI * frequency * 2 * t) * 0.2; // Reduced harmonics
      sample += Math.sin(2 * Math.PI * frequency * 3 * t) * 0.05; // Much less
    } else if (type === "collect") {
      // Gentle chime with soft harmonics
      sample = Math.sin(2 * Math.PI * frequency * t) * 0.6;
      sample += Math.sin(2 * Math.PI * frequency * 2 * t) * 0.25;
      sample += Math.sin(2 * Math.PI * frequency * 3 * t) * 0.1; // Softer third harmonic
    } else {
      // Death - very soft, low sound
      sample = Math.sin(2 * Math.PI * frequency * t) * 0.8;
      sample += Math.sin(2 * Math.PI * frequency * 0.5 * t) * 0.2; // Gentle subharmonic
    }

    data[i] = sample * envelope * 0.15; // Much lower volume for gentleness
  }

  return buffer;
}

// Generate a pleasant level-up sound with ascending notes
function generateLevelUpSound(audioContext: AudioContext): AudioBuffer {
  const sampleRate = audioContext.sampleRate;
  const duration = 0.6;
  const numSamples = Math.floor(sampleRate * duration);
  const buffer = audioContext.createBuffer(1, numSamples, sampleRate);
  const data = buffer.getChannelData(0);

  // Musical notes: C, E, G (major triad)
  const notes = [261.63, 329.63, 392.0]; // C4, E4, G4
  const noteDuration = duration / notes.length;

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const noteIndex = Math.floor(t / noteDuration);
    const noteTime = t - noteIndex * noteDuration;

    if (noteIndex < notes.length) {
      const frequency = notes[noteIndex];

      // Very smooth, gentle envelope for each note
      const attackTime = 0.08;
      const releaseTime = 0.12;
      let envelope = 1;

      if (noteTime < attackTime) {
        envelope = Math.sin(((noteTime / attackTime) * Math.PI) / 2); // Smooth sine attack
      } else if (noteTime > noteDuration - releaseTime) {
        const releaseProgress = (noteDuration - noteTime) / releaseTime;
        envelope = Math.sin((releaseProgress * Math.PI) / 2); // Smooth sine release
      }

      // Softer harmonics for gentler sound
      let sample = Math.sin(2 * Math.PI * frequency * noteTime) * 0.6;
      sample += Math.sin(2 * Math.PI * frequency * 2 * noteTime) * 0.25;
      sample += Math.sin(2 * Math.PI * frequency * 3 * noteTime) * 0.1; // Reduced third harmonic

      data[i] = sample * envelope * 0.2; // Lower volume
    } else {
      data[i] = 0;
    }
  }

  return buffer;
}

export async function loadSounds(): Promise<SoundManager> {
  // Create audio context
  const audioContext = createAudioContext();

  // Generate gentle, soft sound buffers with pleasant frequencies
  const enemyHitSound = generatePleasantSound(audioContext, 392, 0.1, "hit"); // G4 - softer, lower
  const enemyDeathSound = generatePleasantSound(
    audioContext,
    196,
    0.3,
    "death"
  ); // G3 - very low, gentle
  const playerHitSound = generatePleasantSound(audioContext, 294, 0.25, "hit"); // D4 - softer warning
  const xpCollectSound = generatePleasantSound(
    audioContext,
    440,
    0.15,
    "collect"
  ); // A4 - pleasant chime
  const levelUpSound = generateLevelUpSound(audioContext);
  const projectileFireSound = generatePleasantSound(
    audioContext,
    330,
    0.06,
    "fire"
  ); // E4 - softer snap
  const aoeActivateSound = generatePleasantSound(
    audioContext,
    165,
    0.35,
    "death"
  ); // E3 - very low, gentle
  const healthCollectSound = generatePleasantSound(
    audioContext,
    523.25,
    0.18,
    "collect"
  ); // C5 - gentle healing chime

  // Volume controls
  let sfxVolume = 0.5;

  // Helper function to resume audio context if suspended (required by browsers)
  const resumeAudioContext = async () => {
    if (audioContext.state === "suspended") {
      try {
        await audioContext.resume();
      } catch (_e) {
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
