// Game 4
import React, { useState, useEffect } from "react";
import { Button, Card, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import QuestionProgressLights from "../QuestionProgressLights";
import { addReport } from "../../services/reports";
import { game4Questions } from "../Data/Game4Data";
import { play } from "../../services/audioPlayer";

const Game4 = ({ gameId, schoolId, studentId, classId }) => {
  const navigate = useNavigate();
  // Game state
  const [currentRound, setCurrentRound] = useState(0); // 0 = slow, 1 = normal
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameResults, setGameResults] = useState([]);
  const [questionStartTime, setQuestionStartTime] = useState(null);

  const questions = React.useMemo(() => {
    // Separate example questions from regular questions
    const examples = game4Questions.filter((q) => q.isExample);
    const regularQuestions = game4Questions.filter((q) => !q.isExample);

    // Shuffle regular questions using Fisher-Yates algorithm
    const shuffled = [...regularQuestions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Return examples first, then shuffled questions
    return [...examples, ...shuffled];
  }, []);

  // Play audio automatically when question changes
  const playAudio = React.useCallback(
    async (slow = false) => {
      console.log(4, currentQuestion + 1, slow ? "slow" : "fast");

      try {
        setIsPlaying(true);
        const speed = slow ? "slow" : "fast";
        await play(`04/${String(currentQuestion + 1).padStart(2, '0')}-${speed}.mp3`);

        if (!questionStartTime) {
          setQuestionStartTime(Date.now());
        }

        setTimeout(() => setIsPlaying(false), 1000);
      } catch (error) {
        console.error("Audio playback failed:", error);
        setIsPlaying(false);
      }
    },
    [currentQuestion, questionStartTime]
  );

  useEffect(() => {
    if (!gameCompleted) {
      playAudio(currentRound === 0); // Slow for first round, normal for second
    }
  }, [currentQuestion, currentRound, gameCompleted, playAudio]);

  const handleAnswerSelect = (answer) => {
    if (selectedAnswer !== null) return; // Prevent multiple selections

    setSelectedAnswer(answer);
    const isCorrect = answer === questions[currentQuestion].correctSuffix;
    const currentQ = questions[currentQuestion];
    const questionEndTime = Date.now();
    const secondsForQuestion = questionStartTime ? (questionEndTime - questionStartTime) / 1000 : 0;

    // Track the result only for non-example questions
    if (!currentQ.isExample) {
      setGameResults((prev) => [
        ...prev,
        {
          question: currentQ.word,
          result: answer,
          target: currentQ.correctSuffix,
          isCorrect: isCorrect,
          seconds: secondsForQuestion,
        },
      ]);
    }

    // Auto advance after 1 second
    setTimeout(() => {
      nextQuestion();
    }, 4000);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setQuestionStartTime(null); // Reset timing for next question
    } else if (currentRound === 0) {
      // Move to normal speed round, skip example question
      setCurrentRound(1);
      setCurrentQuestion(1); // Start at question 1 to skip example
      setSelectedAnswer(null);
      setQuestionStartTime(null); // Reset timing for next question
    } else {
      setGameCompleted(true);
      submitGameResults();
    }
  };

  // Submit game results function
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
      gameName: "WordEndingGame",
      questions: gameResults,
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
    return (
      <Container className="d-flex flex-column align-items-center justify-content-center full-height">
        <Card className="w-100" style={{ maxWidth: "600px" }}>
          <Card.Header className="text-center" style={{ backgroundColor: "#2F4F4F", color: "white" }}>
            <h3 className="mb-0">Μπράβο! Τελείωσες την άσκηση!</h3>
          </Card.Header>
          <Card.Body className="text-center">
            <QuestionProgressLights
              totalQuestions={questions.filter((q) => !q.isExample).length * 2}
              currentQuestion={questions.filter((q) => !q.isExample).length * 2}
              answeredQuestions={gameResults.filter((r) => !r.isExample).map((r) => r.isCorrect)}
            />
            <Button variant="primary" size="lg" onClick={() => navigate("/")} className="mt-4">
              Τέλος Άσκησης
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <Container fluid className="game-container">
      <Row className="justify-content-center">
        <Col md={12} lg={10}>
          {!questions[currentQuestion].isExample && (
            <QuestionProgressLights
              totalQuestions={questions.filter((q) => !q.isExample).length * 2}
              currentQuestion={currentRound * questions.filter((q) => !q.isExample).length + questions.slice(0, currentQuestion).filter((q) => !q.isExample).length}
              answeredQuestions={gameResults.filter((r) => !questions.find((q) => q.word === r.word)?.isExample).map((r) => r.isCorrect)}
            />
          )}
          <Card className="main-card">
            <Card.Header className="text-center" style={{ backgroundColor: "#2F4F4F", color: "white" }}>
              <h4 className="mb-0">
                {questions[currentQuestion].isExample && <span className="badge badge-dark me-2">Παράδειγμα</span>}
                Ακούω και διαλέγω το σωστό επίθημα
              </h4>
            </Card.Header>
            <Card.Body className="text-center">
              <div className="mb-4"></div>

              <div className="p-4 bg-light rounded mb-4">
                <div className="display-4 font-weight-bold mb-3">
                  {currentQ.stem}
                  {selectedAnswer ? currentQ.correctSuffix : "_______"}
                </div>

                <div className="d-flex justify-content-center">
                  <Button
                    variant="light"
                    onClick={() => playAudio(currentRound === 0)}
                    disabled={isPlaying}
                    className="mb-3 rounded-circle"
                    style={{
                      width: "80px",
                      height: "80px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "white",
                      border: "2px solid #6c757d",
                    }}
                  >
                    <i className="bi bi-volume-up" style={{ fontSize: "30px", color: "#6c757d" }}></i>
                  </Button>
                </div>
              </div>

              <Row className="g-3 mb-4">
                {currentQ.options.map((option, index) => {
                  let variant = "outline-primary";
                  let customStyle = {};

                  if (selectedAnswer === option) {
                    if (option === currentQ.correctSuffix) {
                      variant = "success";
                      customStyle = { backgroundColor: "#FFFF33", borderColor: "#FFFF33", color: "black" };
                    } else {
                      variant = "danger";
                      customStyle = { backgroundColor: "#9370DB", borderColor: "#9370DB", color: "white" };
                    }
                  } else if (selectedAnswer && option === currentQ.correctSuffix) {
                    variant = "success";
                    customStyle = { backgroundColor: "#FFFF33", borderColor: "#FFFF33", color: "black" };
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
                        <div className="d-flex align-items-center justify-content-center">
                          {selectedAnswer !== null && (
                            <span className="me-2" style={{ fontSize: "1.5rem" }}>
                              {option === currentQ.correctSuffix ? "✓" : "✗"}
                            </span>
                          )}
                          <span>{option}</span>
                        </div>
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

export default Game4;
