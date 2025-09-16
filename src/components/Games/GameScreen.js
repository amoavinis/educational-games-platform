import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { canStudentPlayGame } from "../../services/gameAttempts";
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
import ReactionTimeGame from "./ReactionTimeGame";

const GameScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [attemptsExceeded, setAttemptsExceeded] = useState(false);

  // Get data from router state, with fallback to sessionStorage if needed
  const routerState = location.state;
  const studentId = routerState?.studentId || sessionStorage.getItem('gameStudentId');
  const classId = routerState?.classId || sessionStorage.getItem('gameClassId');
  // const studentName = routerState?.studentName || sessionStorage.getItem('gameStudentName'); // Available if needed
  const gameId = parseInt(location.pathname.split("/").pop().split("game")[1]);
  const schoolId = localStorage.getItem("school");

  // Store in sessionStorage for page refresh scenarios
  useEffect(() => {
    if (routerState?.studentId) {
      sessionStorage.setItem('gameStudentId', routerState.studentId);
    }
    if (routerState?.classId) {
      sessionStorage.setItem('gameClassId', routerState.classId);
    }
    // Uncomment if studentName is needed in the future
    // if (routerState?.studentName) {
    //   sessionStorage.setItem('gameStudentName', routerState.studentName);
    // }
  }, [routerState]);

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
    // Clean up session storage
    sessionStorage.removeItem('gameStudentId');
    sessionStorage.removeItem('gameClassId');
    // sessionStorage.removeItem('gameStudentName'); // Uncomment if used
    navigate('/');
  };

  useEffect(() => {
    // Safety check: if no student data, redirect to home
    if (!studentId || !classId) {
      console.warn('Missing student data, redirecting to home');
      navigate('/');
      return;
    }

    // Check if student can play this game (has less than 2 attempts)
    const checkGameAttempts = async () => {
      const canPlay = await canStudentPlayGame(studentId, gameId);
      if (!canPlay) {
        setAttemptsExceeded(true);
        return;
      }
    };

    checkGameAttempts();

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
  }, [studentId, classId, gameId, navigate]);

  // If attempts exceeded, show blocking screen
  if (attemptsExceeded) {
    return (
      <div className="game-screen-fullscreen" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '2rem', borderRadius: '10px', textAlign: 'center', maxWidth: '500px' }}>
          <h2 style={{ marginBottom: '1rem' }}>⚠️ Έχετε ξεπεράσει τις επιτρεπόμενες προσπάθειες</h2>
          <p style={{ fontSize: '18px', marginBottom: '1.5rem' }}>
            Έχετε ήδη παίξει αυτό το παιχνίδι 2 φορές. Δεν επιτρέπονται περισσότερες προσπάθειες.
          </p>
          <button 
            onClick={handleGoHome}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              fontSize: '16px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            🏠 Επιστροφή στην Αρχική
          </button>
        </div>
      </div>
    );
  }

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
        {gameId === 16 && <ReactionTimeGame gameId={gameId} schoolId={schoolId} studentId={studentId} classId={classId} />}
      </div>
    </div>
  );
};

export default GameScreen;
