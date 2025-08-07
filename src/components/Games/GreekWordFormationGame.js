import React, { useState, useEffect, useMemo } from "react";
import { Button, Card, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import QuestionProgressLights from "../QuestionProgressLights";
import "../../styles/Game.css";
import { addReport } from "../../services/reports";
import { game13Questions } from "../Data/Game13";

const GreekWordFormationGame = ({ gameId, schoolId, studentId, classId }) => {
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

    // Auto advance after 1 second
    setTimeout(() => {
      nextQuestion();
    }, 1000);
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
              <Card.Header className="text-center bg-success text-white">
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
              currentQuestion={currentQuestion - 1} // Subtract 1 for example
              answeredQuestions={gameResults.map((r) => r.isCorrect)}
            />
          )}
          <Card className="main-card">
            <Card.Header
              className={`text-center ${
                questions[currentQuestion].isExample
                  ? "bg-warning"
                  : "bg-primary"
              } text-white`}
            >
              <h4 className="mb-0">
                {questions[currentQuestion].isExample && (
                  <span className="badge badge-light text-dark mr-2">
                    Παράδειγμα
                  </span>
                )}
                Φτιάξε νέες λέξεις
              </h4>
            </Card.Header>
            <Card.Body>
              <Card className="mb-4 border-primary">
                <Card.Body className="text-center">
                  <h3 className="display-6 mb-3 text-primary">
                    {question.instruction}
                  </h3>
                  <h4 className="mb-4 text-muted">
                    για τη λέξη{" "}
                    <span className="text-primary font-weight-bold">
                      {question.baseWord}
                    </span>
                  </h4>
                  
                  {selectedAnswer && (
                    <div className="mt-4 p-3 bg-light rounded">
                      <h3 className="font-weight-bold">
                        {selectedAnswer === question.correct ? (
                          <span className="text-success">
                            ✓ {question.result}
                          </span>
                        ) : (
                          <span className="text-danger">
                            ✗ {question.result}
                          </span>
                        )}
                      </h3>
                    </div>
                  )}
                </Card.Body>
              </Card>

              <Row className="justify-content-center mb-4">
                {question.options.map((option, index) => (
                  <Col
                    key={index}
                    xs={3}
                    className="mb-3 d-flex justify-content-center"
                  >
                    <Button
                      block
                      onClick={() => handleAnswerSelect(option)}
                      disabled={selectedAnswer !== null}
                      variant={
                        selectedAnswer === option
                          ? option === question.correct
                            ? "success"
                            : "danger"
                          : selectedAnswer && option === question.correct
                          ? "outline-success"
                          : "outline-primary"
                      }
                      size="lg"
                      className="py-3"
                    >
                      {option}
                    </Button>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default GreekWordFormationGame;
