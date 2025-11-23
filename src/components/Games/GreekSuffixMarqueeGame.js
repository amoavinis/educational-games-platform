// Game 15
import React, { useState, useEffect, useRef, useMemo } from "react";
import { Button, Card, Container, Row, Col } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import QuestionProgressLights from "../QuestionProgressLights";
import "../../styles/Game.css";
import { addReport } from "../../services/reports";
import { game15Questions } from "../Data/Game15";

const GreekSuffixMarqueeGame = ({ gameId, schoolId, studentId: propStudentId, classId }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // Get student ID from props or URL parameters
  const searchParams = new URLSearchParams(location.search);
  const studentId = propStudentId || searchParams.get("studentId") || "unknown";
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [isMarqueeActive, setIsMarqueeActive] = useState(true);
  const [gameResults, setGameResults] = useState([]);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const marqueeRef = useRef(null);
  const containerRef = useRef(null);

  const questions = useMemo(() => game15Questions, []);

  useEffect(() => {
    if (!isMarqueeActive) return;

    const container = containerRef.current;
    const textElement = marqueeRef.current;

    if (!container || !textElement) return;

    // Reset styles - start with first letter at right edge
    textElement.style.transition = "none";
    textElement.style.visibility = "visible";

    // Force reflow to apply reset styles
    textElement.getBoundingClientRect();

    const containerWidth = container.offsetWidth;
    const textWidth = textElement.offsetWidth;

    // Start with first letter at right edge of container
    textElement.style.left = `${containerWidth}px`;
    textElement.style.transform = "translateX(0)";

    // Force reflow
    textElement.getBoundingClientRect();

    // Move left until last letter is visible (stop when text fits completely)
    const stopOffset = containerWidth - textWidth;

    textElement.style.transition = "left 3s ease-out";
    textElement.style.left = `${stopOffset}px`;

    const handleTransitionEnd = () => {
      setIsMarqueeActive(false);
      textElement.removeEventListener("transitionend", handleTransitionEnd);
      // Start timing when buttons appear
      setQuestionStartTime(Date.now());
    };

    textElement.addEventListener("transitionend", handleTransitionEnd);

    return () => {
      textElement.removeEventListener("transitionend", handleTransitionEnd);
    };
  }, [currentQuestion, isMarqueeActive]);

  const handleAnswerSelect = (answer) => {
    if (selectedAnswer !== null) return; // Prevent multiple selections

    const question = questions[currentQuestion];
    const isCorrect = answer === question.correct;
    const questionEndTime = Date.now();
    const secondsForQuestion = questionStartTime ? (questionEndTime - questionStartTime) / 1000 : 0;

    setSelectedAnswer(answer);

    // Track the result only for non-example questions
    if (!question.isExample) {
      setGameResults((prev) => [
        ...prev,
        {
          question: question.sentence,
          result: answer,
          target: question.correct,
          isCorrect: isCorrect,
          seconds: secondsForQuestion,
        },
      ]);
    }

    // Auto advance after 1 second
    setTimeout(() => {
      nextQuestion();
    }, 1000);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setSelectedAnswer(null);
      setQuestionStartTime(null); // Reset timing for next question
      setIsMarqueeActive(true);
      // Hide current text first, then change question
      const textElement = marqueeRef.current;
      if (textElement) {
        textElement.style.visibility = "hidden";
      }
      setTimeout(() => {
        setCurrentQuestion((prev) => prev + 1);
      }, 50);
    } else {
      setGameCompleted(true);
    }
  };

  // Use effect to log results when game completes
  useEffect(() => {
    // Log game results function
    const submitGameResults = async (finalResults) => {
      if (!studentId || !classId) {
        console.log("Missing studentId or classId, cannot submit results");
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
        gameName: "GreekSuffixMarqueeGame",
        questions: finalResults,
      };

      try {
        await addReport({
          schoolId,
          studentId,
          classId,
          gameId,
          results: JSON.stringify(results),
        });
        // console.log("Game results submitted successfully");
      } catch (error) {
        console.error("Error submitting game results:", error);
      }
    };

    if (gameCompleted) {
      submitGameResults(gameResults);
    }
  }, [classId, gameCompleted, gameId, gameResults, schoolId, studentId]);

  const question = questions[currentQuestion];

  // Center the text when answer is selected
  useEffect(() => {
    if (selectedAnswer) {
      const textElement = marqueeRef.current;
      const container = containerRef.current;
      if (textElement && container) {
        const containerWidth = container.offsetWidth;
        const textWidth = textElement.offsetWidth;
        const centerOffset = (containerWidth - textWidth) / 2;
        textElement.style.transition = "left 0.5s ease";
        textElement.style.left = `${centerOffset}px`;
      }
    }
  }, [selectedAnswer]);

  if (gameCompleted) {
    return (
      <Container fluid className="game-container">
        <Row className="justify-content-center">
          <Col md={12} lg={10}>
            <QuestionProgressLights
              totalQuestions={questions.filter((q) => !q.isExample).length}
              currentQuestion={questions.filter((q) => !q.isExample).length}
              answeredQuestions={gameResults.map((r) => r.isCorrect)}
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
      <Row className="justify-content-center">
        <Col md={12} lg={10}>
          {!questions[currentQuestion].isExample && (
            <QuestionProgressLights
              totalQuestions={questions.filter((q) => !q.isExample).length}
              currentQuestion={questions.slice(0, currentQuestion).filter((q) => !q.isExample).length}
              answeredQuestions={gameResults.map((r) => r.isCorrect)}
            />
          )}
          <Card className="main-card">
            <Card.Header className="text-center" style={{ backgroundColor: "#2F4F4F", color: "white" }}>
              <h4 className="mb-0">
                {questions[currentQuestion].isExample && <span className="badge badge-dark me-2">Παράδειγμα</span>}
                Διαλέγω το κατάλληλο επίθημα όσο πιο γρήγορα μπορώ
              </h4>
            </Card.Header>
            <Card.Body className="text-center">
              <div className="rounded mb-4">
                {/* Marquee container */}
                <div
                  ref={containerRef}
                  className="marquee-container mb-4"
                  style={{
                    width: "600px",
                    margin: "0 auto",
                    padding: "20px 0",
                    display: "block",
                    minHeight: "80px",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                    <div
                      ref={marqueeRef}
                      className="marquee-text"
                      style={{
                        position: "absolute",
                        whiteSpace: "nowrap",
                        transition: "left 3s ease-out",
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                        visibility: "visible",
                      }}
                    >
                      {selectedAnswer ? question.result : question.sentence}
                    </div>
                  </div>

              {!isMarqueeActive && (
                <Row className="g-3 mb-4">
                  {question.options.map((option, index) => {
                    let variant = "outline-primary";
                    let customStyle = {};
                    let showIcon = null;

                    if (selectedAnswer === option) {
                      if (option === question.correct) {
                        variant = "success";
                        customStyle = { backgroundColor: "#FFFF33", borderColor: "#FFFF33", color: "black" };
                        showIcon = "✓";
                      } else {
                        variant = "danger";
                        customStyle = { backgroundColor: "#9370DB", borderColor: "#9370DB", color: "white" };
                        showIcon = "✗";
                      }
                    } else if (selectedAnswer && option === question.correct) {
                      variant = "success";
                      customStyle = { backgroundColor: "#FFFF33", borderColor: "#FFFF33", color: "black" };
                      showIcon = "✓";
                    }

                    return (
                      <Col key={index} xs={4}>
                        <Button
                          variant={variant}
                          style={customStyle}
                          onClick={() => handleAnswerSelect(option)}
                          disabled={selectedAnswer !== null}
                          className="w-100 py-3"
                        >
                          {option}
                          {showIcon && (
                            <span className="ms-2 fs-4">
                              {showIcon}
                            </span>
                          )}
                        </Button>
                      </Col>
                    );
                  })}
                </Row>
              )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default GreekSuffixMarqueeGame;
