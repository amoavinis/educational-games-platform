import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Card,
  Container,
  Row,
  Col,
  Alert,
  ProgressBar,
} from "react-bootstrap";
import "../../styles/Game.css";

const GreekSuffixMarqueeGame = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState("playing");
  const [isMarqueeActive, setIsMarqueeActive] = useState(true);
  const marqueeRef = useRef(null);
  const containerRef = useRef(null);

  const questions = [
    {
      sentence: "Ο καιρός σήμερα είναι πολύ ζεστ___",
      hiddenPart: "__",
      options: ["-ός", "-ή", "-ό"],
      correct: "-ός",
      explanation:
        "Το επίθετο 'ζεστός' στο αρσενικό γένος παίρνει την κατάληξη -ός",
    },
    {
      sentence: "Η θάλασσα φαίνεται πολύ γαλην___",
      hiddenPart: "__",
      options: ["-ια", "-ός", "-ό"],
      correct: "-ια",
      explanation:
        "Το επίθετο 'γαλήνια' στο θηλυκό γένος παίρνει την κατάληξη -ια",
    },
    {
      sentence: "Το παιδί κοιμήθηκε ήσυχ___",
      hiddenPart: "__",
      options: ["-ό", "-ός", "-ή"],
      correct: "-ό",
      explanation:
        "Το επίθετο 'ήσυχο' στο ουδέτερο γένος παίρνει την κατάληξη -ο",
    },
  ];

  useEffect(() => {
    if (!isMarqueeActive) return;

    const container = containerRef.current;
    const textElement = marqueeRef.current;

    if (!container || !textElement) return;

    // Reset styles
    textElement.style.transition = "none";
    textElement.style.left = "100%";
    textElement.style.transform = "translateX(0)";

    // Force reflow to apply reset styles
    textElement.getBoundingClientRect();

    const containerWidth = container.offsetWidth;
    const textWidth = textElement.offsetWidth;

    const centerOffset = (containerWidth - textWidth) / 2;

    // Animate to center
    textElement.style.transition = "left 3s ease-out";
    textElement.style.left = `${centerOffset}px`;

    const handleTransitionEnd = () => {
      setIsMarqueeActive(false);
      textElement.style.transition = "none";
      textElement.style.left = "50%";
      textElement.style.transform = "translateX(-50%)";
      textElement.removeEventListener("transitionend", handleTransitionEnd);
    };

    textElement.addEventListener("transitionend", handleTransitionEnd);

    return () => {
      textElement.removeEventListener("transitionend", handleTransitionEnd);
    };
  }, [currentQuestion, isMarqueeActive]);

  const handleAnswerSelect = (answer) => {
    const question = questions[currentQuestion];
    const isCorrect = answer === question.correct;

    setSelectedAnswer(answer);

    if (isCorrect) {
      setFeedback(`Σωστό! 🎉 ${question.explanation}`);
      setScore((prev) => prev + 1);
    } else {
      setFeedback(`Λάθος. ${question.explanation}`);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setFeedback("");
      setIsMarqueeActive(true);
    } else {
      setGameState("results");
    }
  };

  const resetGame = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setFeedback("");
    setScore(0);
    setGameState("playing");
    setIsMarqueeActive(true);
  };

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (gameState === "results") {
    return (
      <Container
        className="d-flex flex-column align-items-center justify-content-center full-height"
        style={{ overflowY: "auto" }}
      >
        <Card className="w-100" style={{ maxWidth: "800px" }}>
          <Card.Header className="text-center bg-primary text-white">
            <h2 className="mb-0">Αποτελέσματα</h2>
          </Card.Header>
          <Card.Body className="text-center">
            <h3 className="text-primary">
              Τελικό Σκορ: {score}/{questions.length}
            </h3>
            <div className="d-flex justify-content-center gap-3 mt-4">
              <Button variant="primary" onClick={resetGame}>
                Παίξτε Ξανά
              </Button>
              <Button variant="secondary" href="/">
                Αρχική Σελίδα
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="d-flex flex-column align-items-center justify-content-center full-height">
      <Card className="w-100" style={{ maxWidth: "800px" }}>
        <Card.Header className="text-center bg-primary text-white">
          <h2 className="mb-0">Επιλογή Καταλήξεων</h2>
        </Card.Header>

        <Card.Body>
          <ProgressBar
            now={progress}
            label={`${currentQuestion + 1}/${questions.length}`}
            className="w-100 mb-4"
          />

          {/* Marquee container */}
          <div
            ref={containerRef}
            className="marquee-container mb-4"
            style={{
              width: "100%",
              padding: "20px",
              display: "flex",
              alignItems: "center",
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
              }}
            >
              {question.sentence.replace(question.hiddenPart, "____")}
            </div>
          </div>

          {!isMarqueeActive && (
            <>
              <Row className="justify-content-center mb-4">
                {question.options.map((option, index) => (
                  <Col
                    key={index}
                    md={4}
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

              {feedback && (
                <Alert
                  variant={feedback.includes("Σωστό") ? "success" : "danger"}
                  className="text-center"
                >
                  {feedback}
                </Alert>
              )}

              <div className="d-flex justify-content-center mt-4 gap-3">
                {selectedAnswer && (
                  <Button variant="primary" onClick={nextQuestion}>
                    {currentQuestion < questions.length - 1
                      ? "Επόμενη Ερώτηση"
                      : "Τέλος"}
                  </Button>
                )}
                <Button variant="secondary" onClick={resetGame}>
                  Επανάληψη
                </Button>
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default GreekSuffixMarqueeGame;
