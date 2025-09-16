import React, { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import QuestionProgressLights from "../QuestionProgressLights";
import "../../styles/Game.css";

const ReactionTimeGame = ({ gameId, schoolId, studentId, classId }) => {
  const navigate = useNavigate();

  // Game states
  const [gameState, setGameState] = useState("initial"); // initial, waiting, ready, clicked, next, completed
  const [currentRound, setCurrentRound] = useState(0);
  const [isShape, setIsShape] = useState("rectangle"); // rectangle or circle
  const [reactionTimes, setReactionTimes] = useState([]);
  const [shapeChangeTime, setShapeChangeTime] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);
  const [currentReactionTime, setCurrentReactionTime] = useState(null);

  const totalRounds = 5;

  // Start a new round with random delay
  const startNewRound = useCallback(() => {
    setIsShape("rectangle");
    setGameState("waiting");
    setCurrentReactionTime(null);

    // Random delay between 2-5 seconds
    const delay = Math.random() * 3000 + 2000;

    const timeout = setTimeout(() => {
      setIsShape("circle");
      setShapeChangeTime(Date.now());
      setGameState("ready");
    }, delay);

    setTimeoutId(timeout);
  }, []);

  // Handle clicking anywhere to start the game
  const handleInitialClick = useCallback(() => {
    if (gameState === "initial") {
      setGameState("waiting");
      setGameStarted(true);
      startNewRound();
    }
  }, [gameState, startNewRound]);

  // Complete the game and generate report
  const completeGame = useCallback(
    (finalTimes) => {
      const averageTime =
        finalTimes.reduce((sum, time) => sum + time, 0) / finalTimes.length;

      const reportData = {
        studentId: studentId,
        datetime: new Date().toISOString().slice(0, 19).replace("T", " "),
        gameName: "ReactionTimeGame",
        reactionTimes: finalTimes,
        averageReactionTime: Math.round(averageTime),
        totalRounds: totalRounds,
      };

      console.log("Reaction Time Game Results:", reportData);

      setGameState("completed");
    },
    [studentId]
  );

  // Handle shape click (only when it's a circle)
  const handleShapeClick = useCallback(() => {
    if (gameState === "ready" && isShape === "circle" && shapeChangeTime) {
      const clickTime = Date.now();
      const reactionTime = clickTime - shapeChangeTime;

      setCurrentReactionTime(reactionTime);
      setReactionTimes((prev) => [...prev, reactionTime]);
      setGameState("clicked");

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
  }, [
    gameState,
    isShape,
    shapeChangeTime,
    timeoutId,
    currentRound,
    completeGame,
    reactionTimes,
  ]);

  // Handle premature click (before circle appears)
  const handlePrematureClick = useCallback(() => {
    if (gameState === "waiting") {
      // User clicked too early
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(null);
      }

      // Record a penalty time (e.g., 5000ms)
      const penaltyTime = 5000;
      setCurrentReactionTime(penaltyTime);
      setReactionTimes((prev) => [...prev, penaltyTime]);
      setGameState("clicked");

      // Check if game is completed
      if (currentRound >= totalRounds - 1) {
        setTimeout(() => {
          completeGame([...reactionTimes, penaltyTime]);
        }, 1500);
      } else {
        setTimeout(() => {
          setCurrentRound((prev) => prev + 1);
          setGameState("next");
        }, 1500);
      }
    }
  }, [gameState, timeoutId, currentRound, completeGame, reactionTimes]);

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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

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
        backgroundColor: "#000",
        borderRadius: "20px",
      };
    } else {
      return {
        ...baseStyle,
        backgroundColor: "#000",
        borderRadius: "50%",
      };
    }
  };

  // Get instruction text based on game state
  const getInstructionText = () => {
    switch (gameState) {
      case "initial":
        return "Κάνε κλικ οπουδήποτε για ξεκινήσεις";
      case "waiting":
        return "Περίμενε να γίνει κύκλος…";
      case "ready":
        return "ΤΩΡΑ!";
      case "clicked":
        return currentReactionTime
          ? `Χρόνος αντίδρασης: ${currentReactionTime}ms`
          : "Καταγράφηκε!";
      case "next":
        return `Επόμενη προσπάθεια! (${currentRound + 1}/${totalRounds})`;
      case "completed":
        return "Τέλος παιχνιδιού!";
      default:
        return "";
    }
  };

  if (gameState === "completed") {
    const averageTime =
      reactionTimes.reduce((sum, time) => sum + time, 0) / reactionTimes.length;

    return (
      <Container fluid className="game-container">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="main-card">
              <Card.Header
                className="text-center"
                style={{ backgroundColor: "#2F4F4F", color: "white" }}
              >
                <h3 className="mb-0">Μπράβο! Ολοκληρώσατε το τεστ!</h3>
              </Card.Header>
              <Card.Body className="text-center">
                <div className="mb-4">
                  <h5>Αποτελέσματα:</h5>
                  <div className="mb-3">
                    {reactionTimes.map((time, index) => (
                      <div key={index} className="mb-1">
                        <strong>Προσπάθεια {index + 1}:</strong> {time}ms
                      </div>
                    ))}
                  </div>
                  <div className="mt-3">
                    <strong>Μέσος όρος: {Math.round(averageTime)}ms</strong>
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate("/")}
                  className="mt-3"
                >
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
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="main-card">
            <Card.Header
              className="text-center"
              style={{ backgroundColor: "#2F4F4F", color: "white" }}
            >
              <h4 className="mb-0">Τεστ Χρόνου Αντίδρασης</h4>
            </Card.Header>
            <Card.Body className="text-center">
              {gameStarted && (
                <div className="mb-3">
                  <QuestionProgressLights
                    totalQuestions={totalRounds}
                    currentQuestion={currentRound}
                    answeredQuestions={reactionTimes.map(() => true)}
                  />
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
                    ), πάτα όσο πιο γρηγορα μπορείς το αριστερό κλικ στο
                    ποντίκι.
                  </p>
                  <p className="mb-4">
                    <strong>Ξεκινάμε;</strong>
                  </p>
                </div>
              )}

              <div className="mb-4">
                <h5>{getInstructionText()}</h5>
              </div>

              {gameStarted && (
                <div
                  style={getShapeStyle()}
                  onClick={
                    isShape === "circle"
                      ? handleShapeClick
                      : handlePrematureClick
                  }
                ></div>
              )}

              {gameState === "next" && (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={continueToNextRound}
                  className="mt-3"
                >
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
