import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * Custom hook to manage audio playback with automatic cleanup on URL change
 * @param {string} audioSrc - The audio file source
 * @param {Object} options - Configuration options
 * @param {boolean} options.playOnMount - Whether to play audio when component mounts (default: false)
 * @param {number} options.playDelay - Delay in ms before playing (default: 0)
 * @param {Function} options.onPlaySuccess - Callback when audio starts playing successfully
 * @param {Function} options.onPlayError - Callback when audio fails to play
 * @returns {Object} - { audioRef, play, pause, stop }
 */
const useAudio = (audioSrc, options = {}) => {
  const {
    playOnMount = false,
    playDelay = 0,
    onPlaySuccess = null,
    onPlayError = null,
  } = options;

  const audioRef = useRef(null);
  const location = useLocation();
  const previousPathRef = useRef(location.pathname);

  // Stop audio when URL changes
  useEffect(() => {
    if (previousPathRef.current !== location.pathname) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
    previousPathRef.current = location.pathname;
  }, [location.pathname]);

  // Play audio on mount if requested
  useEffect(() => {
    if (playOnMount && audioRef.current) {
      const timer = setTimeout(() => {
        audioRef.current
          .play()
          .then(() => {
            if (onPlaySuccess) {
              onPlaySuccess();
            }
          })
          .catch((error) => {
            console.error("Error playing audio:", error);
            if (onPlayError) {
              onPlayError(error);
            }
          });
      }, playDelay);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [playOnMount, playDelay, onPlaySuccess, onPlayError]);

  // Cleanup on unmount
  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, []);

  // Manual control functions
  const play = () => {
    if (audioRef.current) {
      return audioRef.current.play();
    }
    return Promise.reject(new Error("Audio ref not available"));
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  return {
    audioRef,
    audioSrc,
    play,
    pause,
    stop,
  };
};

export default useAudio;
