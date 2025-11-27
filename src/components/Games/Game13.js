// Game 13
import React, { useState, useEffect, useMemo } from "react";
import { Button, Card, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import QuestionProgressLights from "../QuestionProgressLights";
import "../../styles/Game.css";
import { addReport } from "../../services/reports";
import { game13Questions } from "../Data/Game13Data";

const Game13 = ({ gameId, schoolId, studentId, classId }) => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [gameState, setGameState] = useState("playing"); // 'playing' or 'results'
  const [gameResults, setGameResults] = useState([]);
  const [questionStartTime, setQuestionStartTime] = useState(null);

  const questions = useMemo(() => game13Questions, []);

  const handleAnswerSelect = (answer) => {
    if (selectedAnswer !== null) return; // Prevent multiple selections

    const question = questions[currentQuestion];
    const isCorrect = answer === question.correct;
    const questionEndTime = Date.now();
    const secondsForQuestion = questionStartTime
      ? (questionEndTime - questionStartTime) / 1000
      : 0;

    setSelectedAnswer(answer);

    // Track the result only for non-example questions
    if (!question.isExample) {
      setGameResults((prev) => [
        ...prev,
        {
          question: `${question.instruction} για τη λέξη ${question.baseWord}`,
          result: answer,
          target: question.correct,
          isCorrect: isCorrect,
          seconds: secondsForQuestion,
        },
      ]);
    }

    // Auto advance after 10 seconds
    setTimeout(() => {
      nextQuestion();
    }, 10000);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setQuestionStartTime(null); // Reset timing for next question
    } else {
      setGameState("results");
      submitGameResults();
    }
  };

  // Log game results function
  const submitGameResults = async () => {
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
      gameName: "GreekWordFormationGame",
      questions: gameResults,
    };

    try {
      await addReport({
        schoolId,
        studentId,
        classId,
        gameId,
        results: JSON.stringify(results)
      });
      // console.log("Game results submitted successfully");
    } catch (error) {
      console.error("Error submitting game results:", error);
    }
  };

  // Start timing when question loads
  useEffect(() => {
    if (gameState === "playing") {
      setQuestionStartTime(Date.now());
    }
  }, [currentQuestion, gameState]);

  const question = questions[currentQuestion];

  if (gameState === "results") {
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
              <Card.Header
                className="text-center"
                style={{ backgroundColor: "#2F4F4F", color: "white" }}
              >
                <h3 className="mb-0">Μπράβο! Τελείωσες την άσκηση!</h3>
              </Card.Header>
              <Card.Body className="text-center">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate("/")}
                  className="mt-4"
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
        <Col md={12} lg={10}>
          {!questions[currentQuestion].isExample && (
            <QuestionProgressLights
              totalQuestions={questions.filter((q) => !q.isExample).length}
              currentQuestion={questions.slice(0, currentQuestion).filter((q) => !q.isExample).length}
              answeredQuestions={gameResults.map((r) => r.isCorrect)}
            />
          )}
          <Card className="main-card">
            <Card.Header
              className="text-center"
              style={{ backgroundColor: "#2F4F4F", color: "white" }}
            >
              <h4 className="mb-0">
                {questions[currentQuestion].isExample && (
                  <span className="badge badge-dark me-2">
                    Παράδειγμα
                  </span>
                )}
                Διαλέγω το κατάλληλο επίθημα και φτιάχνω…
              </h4>
            </Card.Header>
            <Card.Body>
              {/* Visual flow diagram */}
              <div className="mb-4 p-4">
                <div className="d-flex align-items-center justify-content-center gap-3 flex-wrap">
                  {/* Base word in oval */}
                  <div
                    className="px-4 py-3 bg-primary text-white rounded-pill"
                    style={{ fontSize: "1.5rem", fontWeight: "bold", minWidth: "150px", textAlign: "center" }}
                  >
                    {question.baseWord}
                  </div>

                  {/* Arrow with instruction above */}
                  <div className="d-flex flex-column align-items-center justify-content-center">
                    <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#2F4F4F", marginBottom: "0.5rem", height: "1.5rem" }}>
                      {question.instruction}
                    </div>
                    <i className="bi bi-arrow-right" style={{ fontSize: "2rem", color: "#2F4F4F" }}></i>
                    <div style={{ height: "1.5rem", marginTop: "0.5rem" }}></div>
                  </div>

                  {/* Result oval - shows result after answer */}
                  <div
                    className={`px-4 py-3 rounded-pill ${
                      selectedAnswer
                        ? selectedAnswer === question.correct
                          ? "bg-success"
                          : "bg-danger"
                        : "bg-light border border-secondary"
                    } text-white`}
                    style={{ fontSize: "1.5rem", fontWeight: "bold", minWidth: "150px", textAlign: "center" }}
                  >
                    {selectedAnswer ? question.result : "?"}
                  </div>
                </div>
              </div>

              <Row className="justify-content-center mb-4">
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
                    <Col
                      key={index}
                      xs={4}
                      className="mb-3 d-flex justify-content-center"
                    >
                      <Button
                        block
                        onClick={() => handleAnswerSelect(option)}
                        disabled={selectedAnswer !== null}
                        variant={variant}
                        style={customStyle}
                        size="lg"
                        className="py-3"
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
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Game13;
