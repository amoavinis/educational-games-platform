import React, { useState } from "react";
import {
  Button,
  Card,
  Container,
  Row,
  Col,
  Alert,
  ProgressBar,
  ListGroup,
} from "react-bootstrap";
import "../../styles/Game.css";

const GreekVerbEndingGame = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState("playing"); // 'playing' or 'results'
  const [gameData, setGameData] = useState([]);

  const questions = [
    {
      sentence: "Εμείς τώρα γράφ______",
      context: "Ενεστώτας, 1ο πληθυντικό πρόσωπο",
      options: ["-ετε", "-ηκαμε", "-ουμε"],
      correct: "-ουμε",
      explanation:
        'Το "εμείς" (1ο πληθυντικό πρόσωπο) στον ενεστώτα παίρνει την κατάληξη -ουμε',
    },
    {
      sentence: "Εσείς χθες χαθ_____",
      context: "Παρελθόντας, 2ο πληθυντικό πρόσωπο",
      options: ["-ήκαμε", "-ήκατε", "-ω"],
      correct: "-ήκατε",
      explanation:
        'Το "εσείς" (2ο πληθυντικό πρόσωπο) στον παρελθόντα παίρνει την κατάληξη -ήκατε',
    },
    {
      sentence: "Αυτός χθες έτρεξ______",
      context: "Παρελθόντας, 3ο ενικό πρόσωπο",
      options: ["-ε", "-αμε", "-ατε"],
      correct: "-ε",
      explanation:
        "Το 3ο ενικό πρόσωπο στον παρελθόντα παίρνει την κατάληξη -ε",
    },
    {
      sentence: "Εμείς χθες φάγ______",
      context: "Παρελθόντας, 1ο πληθυντικό πρόσωπο",
      options: ["-αμε", "-ατε", "-αν"],
      correct: "-αμε",
      explanation:
        'Το "εμείς" (1ο πληθυντικό πρόσωπο) στον παρελθόντα παίρνει την κατάληξη -αμε',
    },
    {
      sentence: "Αυτά τα βιβλί______",
      context: "Γενική πληθυντικού",
      options: ["-α", "-ων", "-ους"],
      correct: "-ων",
      explanation:
        "Τα ουδέτερα ουσιαστικά στη γενική πληθυντικού παίρνουν την κατάληξη -ων",
    },
  ];

  const handleAnswerSelect = (answer) => {
    const question = questions[currentQuestion];
    const isCorrect = answer === question.correct;

    setSelectedAnswer(answer);

    // Record the attempt
    const attempt = {
      question: question.sentence,
      context: question.context,
      selected: answer,
      correct: question.correct,
      isCorrect,
      explanation: question.explanation,
    };

    setGameData((prev) => [...prev, attempt]);

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
    } else {
      setGameState("results");
    }
  };

  const resetGame = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setFeedback("");
    setScore(0);
    setGameData([]);
    setGameState("playing");
  };

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (gameState === "results") {
    return (
      <Container className="d-flex flex-column align-items-center justify-content-center full-height">
        <Card
          className="w-100"
          style={{ maxWidth: "800px", overflowY: "auto" }}
        >
          <Card.Header className="text-center bg-primary text-white">
            <h2 className="mb-0">Αποτελέσματα</h2>
          </Card.Header>

          <Card.Body>
            <div className="text-center mb-4">
              <h3 className="text-primary">
                Τελικό Σκορ: {score}/{questions.length}
              </h3>
              <p className="h4 mt-3">
                {score === questions.length
                  ? "🎉 Τέλεια! Όλα σωστά!"
                  : score >= questions.length * 0.8
                  ? "👍 Πολύ καλά!"
                  : score >= questions.length * 0.6
                  ? "😊 Καλά!"
                  : "💪 Συνέχισε την προσπάθεια!"}
              </p>
            </div>

            <ListGroup className="mb-4">
              {gameData.map((item, index) => (
                <ListGroup.Item
                  key={index}
                  variant={item.isCorrect ? "success" : "danger"}
                >
                  <div className="d-flex justify-content-between">
                    <strong>{item.question}</strong>
                    <span>{item.isCorrect ? "✓" : "✗"}</span>
                  </div>
                  <div className="mt-2">
                    <small className="text-muted">{item.context}</small>
                  </div>
                  <div className="mt-2">
                    <strong>Επιλογή σας:</strong> {item.selected}
                    {!item.isCorrect && (
                      <span className="text-danger"> (Λάθος)</span>
                    )}
                  </div>
                  {!item.isCorrect && (
                    <div>
                      <strong>Σωστή απάντηση:</strong> {item.correct}
                    </div>
                  )}
                  <div className="mt-2">
                    <em>{item.explanation}</em>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>

            <div className="d-flex justify-content-center gap-3">
              <Button variant="primary" onClick={resetGame} className="mr-3">
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
          <h2 className="mb-0">12η Δραστηριότητα: Πολλαπλής Επιλογής</h2>
        </Card.Header>

        <Card.Body>
          <ProgressBar
            now={progress}
            label={`${currentQuestion + 1}/${questions.length}`}
            className="w-100 mb-4"
          />

          <div className="text-center mb-4">
            <p className="text-muted font-italic">{question.context}</p>
          </div>

          <Card className="mb-4 border-primary">
            <Card.Body className="text-center">
              <h3 className="display-5 mb-4 text-primary">
                {question.sentence}
              </h3>
            </Card.Body>
          </Card>

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
              <Button variant="primary" onClick={nextQuestion} className="mr-3">
                {currentQuestion < questions.length - 1
                  ? "Επόμενη Ερώτηση"
                  : "Τέλος"}
              </Button>
            )}

            {/* <Button variant="secondary" onClick={resetGame}>
              Επανάληψη
            </Button> */}
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default GreekVerbEndingGame;
