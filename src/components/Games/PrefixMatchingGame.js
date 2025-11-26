// Game 6
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Button, Card, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import QuestionProgressLights from "../QuestionProgressLights";
import { addReport } from "../../services/reports";
import { game6Questions } from "../Data/Game6";
import { play } from "../../services/audioPlayer";

const WordPrefixGame = ({ gameId, schoolId, studentId, classId }) => {
  const navigate = useNavigate();
  // Game state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [gameResults, setGameResults] = useState([]);
  const [questionStartTime, setQuestionStartTime] = useState(null);

  const questions = useMemo(() => {
    const examples = game6Questions.filter(q => q.isExample);
    const nonExamples = game6Questions.filter(q => !q.isExample);

    // Shuffle non-examples using Fisher-Yates algorithm
    const shuffled = [...nonExamples];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return [...examples, ...shuffled];
  }, []);

  const playAudio = useCallback(async () => {
    console.log(6, currentQuestion + 1);

    try {
      await play(`06/${String(currentQuestion + 1).padStart(2, '0')}.mp3`);
    } catch (error) {
      console.error("Audio error:", error);
    }

    if (!questionStartTime) {
      setQuestionStartTime(Date.now());
    }
  }, [currentQuestion, questionStartTime]);

  // Auto-play audio when question changes
  useEffect(() => {
    if (!gameCompleted) {
      playAudio();
    }
  }, [currentQuestion, gameCompleted, playAudio]);

  const handleAnswerSelect = (answer) => {
    if (selectedAnswer !== null) return; // Prevent multiple selections

    setSelectedAnswer(answer);
    const isCorrect = answer === questions[currentQuestion].correctPrefix;
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
          target: currentQ.correctPrefix,
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
      gameName: "PrefixMatchingGame",
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

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setQuestionStartTime(null); // Reset timing for next question
    } else {
      setGameCompleted(true);
      submitGameResults();
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
              totalQuestions={questions.filter((q) => !q.isExample).length}
              currentQuestion={questions.filter((q) => !q.isExample).length}
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
              totalQuestions={questions.filter((q) => !q.isExample).length}
              currentQuestion={questions.slice(0, currentQuestion).filter((q) => !q.isExample).length}
              answeredQuestions={gameResults.map((r) => r.isCorrect)}
            />
          )}
          <Card className="main-card">
            <Card.Header className="text-center" style={{ backgroundColor: "#2F4F4F", color: "white" }}>
              <h4 className="mb-0">
                {questions[currentQuestion].isExample && <span className="badge badge-dark me-2">Παράδειγμα</span>}
                Ακούω και διαλέγω το σωστό πρόθημα
              </h4>
            </Card.Header>
            <Card.Body className="text-center">
              <div className="p-4 bg-light rounded mb-4">
                <div className="display-4 font-weight-bold mb-3">
                  {selectedAnswer ? currentQ.correctPrefix : "_____"}
                  {currentQ.stem}
                </div>

                <div className="d-flex justify-content-center">
                  <Button
                    variant="light"
                    onClick={playAudio}
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
                  let showIcon = null;

                  if (selectedAnswer === option) {
                    if (option === currentQ.correctPrefix) {
                      variant = "success";
                      customStyle = { backgroundColor: "#FFFF33", borderColor: "#FFFF33", color: "black" };
                      showIcon = "✓";
                    } else {
                      variant = "danger";
                      customStyle = { backgroundColor: "#9370DB", borderColor: "#9370DB", color: "white" };
                      showIcon = "✗";
                    }
                  } else if (selectedAnswer && option === currentQ.correctPrefix) {
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
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default WordPrefixGame;
