// Game 16
import React, { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import QuestionProgressLights from "../QuestionProgressLights";
import { addReport } from "../../services/reports";
import "../../styles/Game.css";
import titleInstructionsAudio from "../../assets/sounds/response-time/title-instructions.mp3";
import useAudio from "../../hooks/useAudio";

const ReactionTimeGame = ({ gameId, schoolId, studentId, classId }) => {
  const navigate = useNavigate();

  // Game states
  const [gameState, setGameState] = useState("initial"); // initial, waiting, ready, clicked, next, completed
  const [currentRound, setCurrentRound] = useState(0);
  const [isShape, setIsShape] = useState("rectangle"); // rectangle or circle
  const [reactionTimes, setReactionTimes] = useState([]);
  const [gameStats, setGameStats] = useState({
    rounds: [],
    totalRounds: 0,
  });
  const [shapeChangeTime, setShapeChangeTime] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);
  // const [currentReactionTime, setCurrentReactionTime] = useState(null);
  const [resultsSubmitted, setResultsSubmitted] = useState(false);
  // const [liveCounter, setLiveCounter] = useState(0);
  const [counterInterval, setCounterInterval] = useState(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(true);

  const totalRounds = 5;

  // Use the audio hook with automatic URL change detection
  const { audioRef, audioSrc } = useAudio(titleInstructionsAudio, {
    playOnMount: true,
    onPlaySuccess: () => {
      // Audio is playing
    },
    onPlayError: () => {
      setIsAudioPlaying(false);
    },
  });

  // Listen for audio ended event
  useEffect(() => {
    const audio = audioRef.current;
    const handleAudioEnded = () => {
      setIsAudioPlaying(false);
    };

    if (audio) {
      audio.addEventListener("ended", handleAudioEnded);
      return () => {
        audio.removeEventListener("ended", handleAudioEnded);
      };
    }
  }, [audioRef]);

  // Initialize game stats
  useEffect(() => {
    if (gameStats.totalRounds === 0) {
      setGameStats((prev) => ({
        ...prev,
        totalRounds: totalRounds,
      }));
    }
  }, [gameStats.totalRounds]);

  // Submit game results function
  const submitGameResults = useCallback(async () => {
    if (!studentId || !classId || !schoolId || !gameId) {
      return;
    }

    const now = new Date();
    const datetime =
      now.getFullYear() +
      "-" +
      String(now.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(now.getDate()).padStart(2, "0") +
      " " +
      String(now.getHours()).padStart(2, "0") +
      ":" +
      String(now.getMinutes()).padStart(2, "0");

    const results = {
      studentId: studentId,
      datetime: datetime,
      gameName: "ReactionTimeGame",
      questions: gameStats.rounds,
    };

    try {
      await addReport({
        schoolId,
        studentId,
        classId,
        gameId,
        results: JSON.stringify(results),
      });
    } catch (error) {
      console.error("Error submitting game results:", error);
    }
  }, [gameStats.rounds, studentId, classId, schoolId, gameId]);

  // Submit final results when game completes
  useEffect(() => {
    if (gameState === "completed" && gameStats.rounds.length > 0 && !resultsSubmitted) {
      submitGameResults();
      setResultsSubmitted(true);
    }
  }, [gameState, gameStats.rounds, submitGameResults, resultsSubmitted]);

  // Start the live counter when circle appears
  const startLiveCounter = useCallback(() => {
    // setLiveCounter(0);
    const interval = setInterval(() => {
      // setLiveCounter(prev => prev + 10);
    }, 10);
    setCounterInterval(interval);
  }, []);

  // Stop the live counter
  const stopLiveCounter = useCallback(() => {
    if (counterInterval) {
      clearInterval(counterInterval);
      setCounterInterval(null);
    }
  }, [counterInterval]);

  // Reset the live counter
  const resetLiveCounter = useCallback(() => {
    stopLiveCounter();
    // setLiveCounter(0);
  }, [stopLiveCounter]);

  // Start a new round with random delay
  const startNewRound = useCallback(() => {
    setIsShape("rectangle");
    setGameState("waiting");
    // setCurrentReactionTime(null);
    resetLiveCounter(); // Reset counter when square appears

    // Random delay between 2-3 seconds
    const delay = Math.random() * 1000 + 2000;

    const timeout = setTimeout(() => {
      setIsShape("circle");
      setShapeChangeTime(Date.now());
      setGameState("ready");
      startLiveCounter(); // Start counter when circle appears
    }, delay);

    setTimeoutId(timeout);
  }, [resetLiveCounter, startLiveCounter]);

  // Handle clicking anywhere to start the game
  const handleInitialClick = useCallback(() => {
    if (gameState === "initial" && !isAudioPlaying) {
      setGameState("waiting");
      setGameStarted(true);
      startNewRound();
    }
  }, [gameState, isAudioPlaying, startNewRound]);

  // Complete the game and generate report
  const completeGame = useCallback((finalTimes) => {
    const averageTime = finalTimes.reduce((sum, time) => sum + time, 0) / finalTimes.length;

    console.log("Reaction Time Game Results:", {
      reactionTimes: finalTimes,
      averageReactionTime: Math.round(averageTime),
      totalRounds: totalRounds,
    });

    setGameState("completed");
  }, []);

  // Handle shape click (only when it's a circle)
  const handleShapeClick = useCallback(() => {
    if (gameState === "ready" && isShape === "circle" && shapeChangeTime) {
      const clickTime = Date.now();
      const reactionTime = clickTime - shapeChangeTime;

      stopLiveCounter(); // Stop counter when circle is clicked
      // setCurrentReactionTime(reactionTime);
      setReactionTimes((prev) => [...prev, reactionTime]);
      setGameState("clicked");

      // Update game stats with proper question format
      setGameStats((prev) => ({
        ...prev,
        rounds: [
          ...prev.rounds,
          {
            question: `Προσπάθεια ${currentRound + 1}`,
            target: "",
            result: "",
            isCorrect: true,
            seconds: (reactionTime / 1000).toFixed(3),
          },
        ],
      }));

      // Clear any existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(null);
      }

      // Check if game is completed
      if (currentRound >= totalRounds - 1) {
        setTimeout(() => {
          completeGame([...reactionTimes, reactionTime]);
        }, 1500);
      } else {
        setTimeout(() => {
          setCurrentRound((prev) => prev + 1);
          setGameState("next");
        }, 1500);
      }
    }
  }, [gameState, isShape, shapeChangeTime, timeoutId, currentRound, completeGame, reactionTimes, stopLiveCounter]);

  // Continue to next round
  const continueToNextRound = useCallback(() => {
    if (gameState === "next") {
      startNewRound();
    }
  }, [gameState, startNewRound]);

  // Add click event listener for initial start
  useEffect(() => {
    if (gameState === "initial") {
      document.addEventListener("click", handleInitialClick);
      return () => document.removeEventListener("click", handleInitialClick);
    }
  }, [gameState, handleInitialClick]);

  // Cleanup timeout and counter on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (counterInterval) {
        clearInterval(counterInterval);
      }
    };
  }, [timeoutId, counterInterval]);

  // Shape style based on current state
  const getShapeStyle = () => {
    const baseStyle = {
      width: "200px",
      height: "200px",
      margin: "50px auto",
      cursor: "pointer",
      transition: "all 0.3s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "24px",
      fontWeight: "bold",
      color: "white",
      userSelect: "none",
    };

    if (isShape === "rectangle") {
      return {
        ...baseStyle,
        backgroundColor: "rgb(130, 19, 19)",
        borderRadius: "20px",
      };
    } else {
      return {
        ...baseStyle,
        backgroundColor: "rgb(130, 19, 19)",
        borderRadius: "50%",
      };
    }
  };

  // Get instruction text based on game state
  const getInstructionText = () => {
    switch (gameState) {
      case "initial":
        return isAudioPlaying ? "Άκουσε τις οδηγίες..." : "Κάνε κλικ οπουδήποτε για ξεκινήσεις.";
      case "waiting":
        return "Περίμενε να γίνει κύκλος…";
      case "ready":
        return "ΤΩΡΑ!";
      case "clicked":
        return "Καταγράφηκε!";
      case "next":
        return `Επόμενη προσπάθεια! (${currentRound + 1}/${totalRounds})`;
      case "completed":
        return "Τέλος παιχνιδιού!";
      default:
        return "";
    }
  };

  if (gameState === "completed") {
    return (
      <Container fluid className="game-container">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="main-card">
              <Card.Header className="text-center" style={{ backgroundColor: "#2F4F4F", color: "white" }}>
                <h3 className="mb-0">Μπράβο! Φοβεροί χρόνοι!</h3>
              </Card.Header>
              <Card.Body className="text-center">
                <Button variant="primary" size="lg" onClick={() => navigate("/")} className="mt-3">
                  Τέλος Άσκησης
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container fluid className="game-container">
      <audio ref={audioRef} src={audioSrc} />
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="main-card">
            <Card.Header className="text-center" style={{ backgroundColor: "#2F4F4F", color: "white" }}>
              <h4 className="mb-0">Χρόνος Αντίδρασης</h4>
            </Card.Header>
            <Card.Body className="text-center">
              {gameStarted && (
                <div className="mb-3">
                  <QuestionProgressLights totalQuestions={totalRounds} currentQuestion={currentRound} answeredQuestions={gameStats.rounds.map(() => true)} />
                </div>
              )}

              {!gameStarted && (
                <div className="mb-4">
                  <p className="mb-3">
                    Όταν το ορθογώνιο (
                    <span
                      style={{
                        display: "inline-block",
                        width: "20px",
                        height: "15px",
                        backgroundColor: "#000",
                        borderRadius: "3px",
                        marginLeft: "5px",
                        marginRight: "5px",
                      }}
                    ></span>
                    ) γίνει κύκλος (
                    <span
                      style={{
                        display: "inline-block",
                        width: "18px",
                        height: "18px",
                        backgroundColor: "#000",
                        borderRadius: "50%",
                        marginLeft: "5px",
                        marginRight: "5px",
                      }}
                    ></span>
                    ), πάτα όσο πιο γρηγορα μπορείς το αριστερό κλικ στο ποντίκι.
                  </p>
                  <p className="mb-4">
                    <strong>Ξεκινάμε;</strong>
                  </p>
                </div>
              )}

              <div className="mb-4">
                <h5>{getInstructionText()}</h5>
              </div>

              {gameStarted && <div style={getShapeStyle()} onClick={isShape === "circle" ? handleShapeClick : undefined}></div>}

              {gameState === "next" && (
                <Button variant="primary" size="lg" onClick={continueToNextRound} className="mt-3">
                  Συνέχεια
                </Button>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ReactionTimeGame;
