import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { canStudentPlayGame } from "../../services/gameAttempts";
import { getExerciseSet } from "../../services/users";
import { isGameInSet } from "../games";
import "../../styles/Game.css";
import Footer from "../Footer";
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

// Every playable exercise, keyed by its game id. Set B (17-31) is added here as
// each component lands; the set a user may reach is decided by games.js.
const gameComponents = {
  1: Game1,
  2: Game2,
  3: Game3,
  4: Game4,
  5: Game5,
  6: Game6,
  7: Game7,
  8: Game8,
  9: Game9,
  10: Game10,
  11: Game11,
  12: Game12,
  13: Game13,
  14: Game14,
  15: Game15,
  16: Game16,
};

const GameScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [attemptsExceeded, setAttemptsExceeded] = useState(false);

  // Get data from router state, with fallback to sessionStorage if needed
  const routerState = location.state;
  const studentId = routerState?.studentId || sessionStorage.getItem("gameStudentId");
  const classId = routerState?.classId || sessionStorage.getItem("gameClassId");
  const fromNavigation = routerState?.fromNavigation ?? false;
  // const studentName = routerState?.studentName || sessionStorage.getItem('gameStudentName'); // Available if needed
  const gameId = parseInt(location.pathname.split("/").pop().split("game")[1]);
  const schoolId = localStorage.getItem("school");
  const CurrentGame = gameComponents[gameId];
  // Guards direct URL access to an exercise outside the account's set
  const gameAllowed = Boolean(CurrentGame) && isGameInSet(gameId, getExerciseSet());

  // Store in sessionStorage for page refresh scenarios
  useEffect(() => {
    if (routerState?.studentId) {
      sessionStorage.setItem("gameStudentId", routerState.studentId);
    }
    if (routerState?.classId) {
      sessionStorage.setItem("gameClassId", routerState.classId);
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
    const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;

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
    sessionStorage.removeItem("gameStudentId");
    sessionStorage.removeItem("gameClassId");
    // sessionStorage.removeItem('gameStudentName'); // Uncomment if used
    navigate("/");
  };

  useEffect(() => {
    // Safety check: if no student data, redirect to home
    if (!studentId || !classId) {
      console.warn("Missing student data, redirecting to home");
      navigate("/");
      return;
    }

    // Safety check: the exercise must exist and belong to this account's set
    if (!gameAllowed) {
      console.warn(`Game ${gameId} is not available for this account, redirecting to home`);
      navigate("/");
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

    if (!fromNavigation) {
      checkGameAttempts();
    }

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
  }, [studentId, classId, gameId, navigate, fromNavigation, gameAllowed]);

  // If attempts exceeded, show blocking screen
  if (attemptsExceeded) {
    return (
      <div
        className="game-screen-fullscreen"
        style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem" }}
      >
        <div style={{ backgroundColor: "#f8d7da", color: "#721c24", padding: "2rem", borderRadius: "10px", textAlign: "center", maxWidth: "500px" }}>
          <h2 style={{ marginBottom: "1rem" }}>⚠️ Έχετε ξεπεράσει τις επιτρεπόμενες προσπάθειες</h2>
          <p style={{ fontSize: "18px", marginBottom: "1.5rem" }}>Έχετε ήδη παίξει αυτό το παιχνίδι 2 φορές. Δεν επιτρέπονται περισσότερες προσπάθειες.</p>
          <button
            onClick={handleGoHome}
            style={{
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              padding: "12px 24px",
              fontSize: "16px",
              borderRadius: "5px",
              cursor: "pointer",
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
      <button className="home-button-kids" onClick={handleGoHome} title="Πίσω στην αρχική">
        🏠
      </button>

      <div className="game-body-fullscreen">
        {CurrentGame && gameAllowed && <CurrentGame gameId={gameId} schoolId={schoolId} studentId={studentId} classId={classId} />}
      </div>
      <Footer />
    </div>
  );
};

export default GameScreen;
