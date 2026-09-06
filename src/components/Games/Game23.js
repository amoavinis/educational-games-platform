import React, { useState, useEffect, useMemo } from "react";
import { Button, Card, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import QuestionProgressLights from "../QuestionProgressLights";
import { addReport } from "../../services/reports";
import { game23Items } from "../Data/Game23Data";
import useAudio from "../../hooks/useAudio";
import bravoAudio from "../../assets/sounds/general/bravo.mp3";
import practiceEnd from "../../assets/sounds/general/end-of-practice.mp3";

const Game23 = ({ gameId, schoolId, studentId, classId }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [gameStats, setGameStats] = useState({
    rounds: [],
    correctAnswers: 0,
    totalRounds: 0,
  });
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [waitingForPracticeEnd, setWaitingForPracticeEnd] = useState(false);

  const items = useMemo(() => game23Items, []);
  const currentItem = items[currentIndex];

  const { audioRef: practiceEndAudioRef, audioSrc: practiceEndAudioSrc } = useAudio(practiceEnd, {
    playOnMount: false,
  });

  useEffect(() => {
    const audio = practiceEndAudioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setWaitingForPracticeEnd(false);
    };

    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("ended", handleEnded);
    };
  }, [practiceEndAudioRef]);

  // Initialize game stats
  useEffect(() => {
    if (gameStats.totalRounds === 0) {
      setGameStats((prev) => ({
        ...prev,
        totalRounds: items.filter((i) => !i.isExample).length,
      }));
      setQuestionStartTime(Date.now());
    }
  }, [gameStats.totalRounds, items]);

  // Παίζει το μήνυμα λήξης της εξάσκησης, πριν ξεκινήσουν τα βαθμολογούμενα ερεθίσματα
  const playPracticeEnd = () => {
    setWaitingForPracticeEnd(true);
    setTimeout(() => {
      practiceEndAudioRef.current.play().catch((error) => {
        console.error("Error playing end of practice audio:", error);
        setWaitingForPracticeEnd(false);
      });
    }, 100);
  };

  const handleAnswerSelect = (option) => {
    if (selectedAnswer !== null) return;

    const isCorrect = option === currentItem.correct;
    setSelectedAnswer(option);

    // Update game stats only for non-example questions
    if (!currentItem.isExample) {
      const questionEndTime = Date.now();
      const secondsForQuestion = questionStartTime ? (questionEndTime - questionStartTime) / 1000 : 0;

      setGameStats((prev) => ({
        ...prev,
        rounds: [
          ...prev.rounds,
          {
            question: currentItem.word,
            target: currentItem.correct,
            result: option,
            isCorrect: isCorrect,
            seconds: secondsForQuestion,
          },
        ],
        correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers,
      }));
    }

    // After the last example, signal that the practice phase is over
    if (currentItem.isExample && !items[currentIndex + 1]?.isExample) {
      playPracticeEnd();
    }
  };

  const nextItem = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setQuestionStartTime(Date.now());
    } else {
      setGameCompleted(true);
      submitGameResults({ gameStats });
    }
  };

  // Submit game results function
  const submitGameResults = async (gameData) => {
    if (!studentId || !classId) {
      console.error("Missing required data for report submission");
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
      datetime: datetime,
      gameName: "WordContextGame",
      questions: gameData.gameStats.rounds,
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
      console.error("Error submitting report:", error);
    }
  };

  // Play bravo audio when game completes
  useEffect(() => {
    if (gameCompleted) {
      const audio = new Audio(bravoAudio);
      audio.play().catch((error) => {
        console.error("Error playing bravo audio:", error);
      });
    }
  }, [gameCompleted]);

  if (gameCompleted) {
    return (
      <Container fluid className="game-container">
        <Row className="game-row-centered">
          <Col md={12} lg={10}>
            <QuestionProgressLights
              totalQuestions={gameStats.totalRounds}
              currentQuestion={gameStats.totalRounds}
              answeredQuestions={gameStats.rounds.map((r) => r.isCorrect)}
            />
            <Card className="main-card">
              <Card.Header className="text-center" style={{ backgroundColor: "#2F4F4F", color: "white" }}>
                <h3 className="mb-0">Μπράβο! Τελείωσες την άσκηση!</h3>
              </Card.Header>
              <Card.Body className="text-center">
                <Button variant="primary" size="lg" onClick={() => navigate("/")} className="mt-4">
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
      <audio ref={practiceEndAudioRef} src={practiceEndAudioSrc} />
      <Row className="game-row-centered">
        <Col md={12} lg={10}>
          {!currentItem.isExample && (
            <QuestionProgressLights
              totalQuestions={items.filter((i) => !i.isExample).length}
              currentQuestion={items.slice(0, currentIndex).filter((i) => !i.isExample).length}
              answeredQuestions={gameStats.rounds.map((r) => r.isCorrect)}
            />
          )}
          {currentItem.isExample && (
            <div className="d-flex justify-content-center">
              <span className="example-badge">📚 Παράδειγμα</span>
            </div>
          )}
          <Card className="main-card">
            <Card.Header className="text-center" style={{ backgroundColor: "#2F4F4F", color: "white" }}>
              <h4 className="mb-0 game-title-header">Διαβάζω τη λέξη και διαλέγω πού ταιριάζει</h4>
            </Card.Header>
            <Card.Body>
              <div className="p-4 bg-light rounded mb-4 text-center">
                <div className="display-4 font-weight-bold">{currentItem.word}</div>
              </div>

              <Row className="g-3 mb-4 answer-options answer-options-wide">
                {currentItem.options.map((option, index) => {
                  let variant = "outline-primary";
                  let customStyle = {};
                  let showIcon = null;

                  if (selectedAnswer === option) {
                    if (option === currentItem.correct) {
                      variant = "success";
                      customStyle = { backgroundColor: "#FFFF33", borderColor: "#FFFF33", color: "black" };
                      showIcon = "✓";
                    } else {
                      variant = "danger";
                      showIcon = "✗";
                    }
                  } else if (selectedAnswer && option === currentItem.correct) {
                    variant = "success";
                    customStyle = { backgroundColor: "#FFFF33", borderColor: "#FFFF33", color: "black" };
                    showIcon = "✓";
                  }

                  return (
                    <Col key={index} xs={12}>
                      <Button
                        variant={variant}
                        style={customStyle}
                        onClick={() => handleAnswerSelect(option)}
                        disabled={selectedAnswer !== null}
                        size="lg"
                        className="py-3"
                      >
                        {option}
                        {showIcon && <span style={{ marginLeft: 10 }}>{showIcon}</span>}
                      </Button>
                    </Col>
                  );
                })}
              </Row>

              {selectedAnswer && (
                <div className="text-center">
                  <Button variant="primary" size="lg" onClick={nextItem} disabled={waitingForPracticeEnd}>
                    {currentIndex < items.length - 1 ? "Επόμενο" : "Ολοκλήρωση"}
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Game23;
