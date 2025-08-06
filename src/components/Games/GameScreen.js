import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
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

  const searchParams = new URLSearchParams(location.search);
  const studentId = searchParams.get("studentId");
  const classId = searchParams.get("classId");
  const gameId = parseInt(location.pathname.split("/").pop().split("game")[1]);
  const schoolId = localStorage.getItem("school");

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
        {gameId === 1 && <WordHighlightGame gameId={gameId} schoolId={schoolId} studentId={studentId} classId={classId} />}
        {gameId === 2 && <RootSuffixGame gameId={gameId} schoolId={schoolId} studentId={studentId} classId={classId} />}
        {gameId === 3 && <GreekReadingExercise gameId={gameId} schoolId={schoolId} studentId={studentId} classId={classId} />}
        {gameId === 4 && <WordEndingGame gameId={gameId} schoolId={schoolId} studentId={studentId} classId={classId} />}
        {gameId === 5 && <WordSeparationGame gameId={gameId} schoolId={schoolId} studentId={studentId} classId={classId} />}
        {gameId === 6 && <PrefixMatchingGame gameId={gameId} schoolId={schoolId} studentId={studentId} classId={classId} />}
        {gameId === 7 && <GreekPrefixGame gameId={gameId} schoolId={schoolId} studentId={studentId} classId={classId} />}
        {gameId === 8 && <GreekMorphologyGame gameId={gameId} schoolId={schoolId} studentId={studentId} classId={classId} />}
        {gameId === 9 && <PrefixSuffixHighlightGame gameId={gameId} schoolId={schoolId} studentId={studentId} classId={classId} />}
        {gameId === 10 && <SyllableReadingGame gameId={gameId} schoolId={schoolId} studentId={studentId} classId={classId} />}
        {gameId === 11 && <GreekCliticSuffixGame gameId={gameId} schoolId={schoolId} studentId={studentId} classId={classId} />}
        {gameId === 12 && <GreekVerbEndingGame gameId={gameId} schoolId={schoolId} studentId={studentId} classId={classId} />}
        {gameId === 13 && <GreekWordFormationGame gameId={gameId} schoolId={schoolId} studentId={studentId} classId={classId} />}
        {gameId === 14 && <GreekAdjectiveEndingGame gameId={gameId} schoolId={schoolId} studentId={studentId} classId={classId} />}
        {gameId === 15 && <GreekSuffixMarqueeGame gameId={gameId} schoolId={schoolId} studentId={studentId} classId={classId} />}
      </div>
    </div>
  );
};

export default GameScreen;
