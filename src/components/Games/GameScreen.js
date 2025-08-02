import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
// import { sendReport } from "../../services/reports";
// import { games as allGames } from "../games";
import "../../styles/Game.css";
import WordHighlightGame from "./WordHighlightGame";
import RootSuffixGame from "./RootSuffixGame";
import GreekReadingExercise from "./GreekReadingExercise";
import WordEndingGame from "./WordEndingGame";
import WordSeparationGame from "./WordSeparationGame";
import PrefixMatchingGame from "./PrefixMatchingGame";
import GreekPrefixGame from "./GreekPrefixGame";
import GreekMorphologyGame from "./GreekMorphologyGame";
import PrefixSuffixHighlightGame from "./PrefixSuffixHighlightGame";
import SyllableReadingGame from "./SyllableReadingGame";
import GreekCliticSuffixGame from "./GreekCliticSuffixGame";
import GreekVerbEndingGame from "./GreekVerbEndingGame";
import GreekWordFormationGame from "./GreekWordFormationGame";
import GreekAdjectiveEndingGame from "./GreekAdjectiveEndingGame";
import GreekSuffixMarqueeGame from "./GreekSuffixMarqueeGame";

const GameScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // const searchParams = new URLSearchParams(location.search);
  // const studentId = searchParams.get("studentId");
  // const studentName = searchParams.get("studentName");
  const gameId = parseInt(location.pathname.split("/").pop().split("game")[1]);
  // const games = allGames;
  // const game = games.find((g) => g.id === gameId);

  const enterFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        await document.documentElement.webkitRequestFullscreen();
      } else if (document.documentElement.msRequestFullscreen) {
        await document.documentElement.msRequestFullscreen();
      }
    } catch (error) {
      console.log("Fullscreen request failed:", error);
    }
  };

  const exitFullscreen = () => {
    const isFullscreen = document.fullscreenElement || 
                         document.webkitFullscreenElement || 
                         document.msFullscreenElement;
    
    if (!isFullscreen) {
      return;
    }
    
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  };

  const handleGoHome = () => {
    exitFullscreen();
    navigate('/');
  };

  useEffect(() => {
    let timeoutId;
    
    // Delay the fullscreen request slightly to avoid issues with React StrictMode
    timeoutId = setTimeout(() => {
      enterFullscreen();
    }, 100);
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      exitFullscreen();
    };
  }, []);

  /* const reportFn = async (data) => {
    let payload = {
      studentId: studentId,
      studentName: studentName,
      gameData: data,
    };

    const uploadRecording = async (blob) => {
      const storageRef = ref(storage, `recordings/${Date.now()}.webm`);
      await uploadBytes(storageRef, blob, { contentType: "audio/webm" });
      return getDownloadURL(storageRef);
    };

    sendReport(payload);
  }; */

  return (
    <div className="game-screen-fullscreen">
      <button 
        className="home-button-kids" 
        onClick={handleGoHome}
        title="Πίσω στην αρχική"
      >
        🏠
      </button>
      
      <div className="game-body-fullscreen">
        {gameId === 1 && <WordHighlightGame />}
        {gameId === 2 && <RootSuffixGame />}
        {gameId === 3 && <GreekReadingExercise />}
        {gameId === 4 && <WordEndingGame />}
        {gameId === 5 && <WordSeparationGame />}
        {gameId === 6 && <PrefixMatchingGame />}
        {gameId === 7 && <GreekPrefixGame />}
        {gameId === 8 && <GreekMorphologyGame />}
        {gameId === 9 && <PrefixSuffixHighlightGame />}
        {gameId === 10 && <SyllableReadingGame />}
        {gameId === 11 && <GreekCliticSuffixGame />}
        {gameId === 12 && <GreekVerbEndingGame />}
        {gameId === 13 && <GreekWordFormationGame />}
        {gameId === 14 && <GreekAdjectiveEndingGame />}
        {gameId === 15 && <GreekSuffixMarqueeGame />}
      </div>
    </div>
  );
};

export default GameScreen;
