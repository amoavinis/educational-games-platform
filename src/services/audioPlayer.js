let currentAudio = null;

/**
 * Plays an audio file from the assets/sounds directory
 * @param {string} fileName - Name of the audio file to play (can include subdirectory path)
 * @returns {Promise<HTMLAudioElement>} - Resolves when audio starts playing, rejects on error
 *
 * @example
 * // Play a file from a game subdirectory
 * play('01/1.Βρες τη βάση.mp3')
 *
 * @example
 * // Play a file from the general directory
 * play('general/success.mp3')
 *
 * @example
 * // Play a file from the root sounds directory
 * play('Μπράβο.mp3')
 */
export const play = async (fileName) => {
  if (!fileName) {
    throw new Error('Audio file name is required');
  }

  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }

  try {
    const audioPath = require(`../assets/sounds/${fileName}`);
    currentAudio = new Audio(audioPath);

    currentAudio.onended = () => {
      currentAudio = null;
    };

    currentAudio.onerror = (error) => {
      console.error('Error playing audio:', error);
      currentAudio = null;
    };

    await currentAudio.play();
    return currentAudio;
  } catch (error) {
    console.error('Error loading audio file:', error);
    currentAudio = null;
    throw new Error(`Audio file not found or failed to load: ${fileName}`);
  }
};

/**
 * Stops the currently playing audio
 */
export const stop = () => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
};

/**
 * Pauses the currently playing audio
 */
export const pause = () => {
  if (currentAudio) {
    currentAudio.pause();
  }
};

/**
 * Resumes the paused audio
 */
export const resume = async () => {
  if (currentAudio && currentAudio.paused) {
    await currentAudio.play();
  }
};

/**
 * Gets the current playback state
 * @returns {Object} Current audio state
 */
export const getState = () => {
  if (!currentAudio) {
    return {
      isPlaying: false,
      currentTime: 0,
      duration: 0,
    };
  }

  return {
    isPlaying: !currentAudio.paused,
    currentTime: currentAudio.currentTime,
    duration: currentAudio.duration || 0,
  };
};

/**
 * Sets the volume for audio playback
 * @param {number} level - Volume level (0.0 to 1.0)
 */
export const setVolume = (level) => {
  const volume = Math.max(0, Math.min(1, level));
  if (currentAudio) {
    currentAudio.volume = volume;
  }
};
