import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { canStudentPlayGame } from "../../services/gameAttempts";
import "../../styles/Game.css";
import Game1 from "./Game1";
import Game2 from "./Game2";
import Game3 from "./Game3";
import Game4 from "./Game4";
import Game5 from "./Game5";
import Game6 from "./Game6";
import Game7 from "./Game7";
import Game8 from "./Game8";
import Game9 from "./Game9";
import Game10 from "./Game10";
import Game11 from "./Game11";
import Game12 from "./Game12";
import Game13 from "./Game13";
import Game14 from "./Game14";
import Game15 from "./Game15";
import Game16 from "./Game16";

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
        {gameId === 1 && <Game1 gameId={gameId} schoolId={schoolId} studentId={studentId} classId={classId} />}
        {gameId === 2 && <Game2 gameId={gameId} schoolId={schoolId} studentId={studentId} classId={classId} />}
        {gameId === 3 && <Game3 gameId={gameId} schoolId={schoolId} studentId={studentId} classId={classId} />}
        {gameId === 4 && <Game4 gameId={gameId} schoolId={schoolId} studentId={studentId} classId={classId} />}
        {gameId === 5 && <Game5 gameId={gameId} schoolId={schoolId} studentId={studentId} classId={classId} />}
        {gameId === 6 && <Game6 gameId={gameId} schoolId={schoolId} studentId={studentId} classId={classId} />}
        {gameId === 7 && <Game7 gameId={gameId} schoolId={schoolId} studentId={studentId} classId={classId} />}
        {gameId === 8 && <Game8 gameId={gameId} schoolId={schoolId} studentId={studentId} classId={classId} />}
        {gameId === 9 && <Game9 gameId={gameId} schoolId={schoolId} studentId={studentId} classId={classId} />}
        {gameId === 10 && <Game10 gameId={gameId} schoolId={schoolId} studentId={studentId} classId={classId} />}
        {gameId === 11 && <Game11 gameId={gameId} schoolId={schoolId} studentId={studentId} classId={classId} />}
        {gameId === 12 && <Game12 gameId={gameId} schoolId={schoolId} studentId={studentId} classId={classId} />}
        {gameId === 13 && <Game13 gameId={gameId} schoolId={schoolId} studentId={studentId} classId={classId} />}
        {gameId === 14 && <Game14 gameId={gameId} schoolId={schoolId} studentId={studentId} classId={classId} />}
        {gameId === 15 && <Game15 gameId={gameId} schoolId={schoolId} studentId={studentId} classId={classId} />}
        {gameId === 16 && <Game16 gameId={gameId} schoolId={schoolId} studentId={studentId} classId={classId} />}
      </div>
    </div>
  );
};

export default GameScreen;
