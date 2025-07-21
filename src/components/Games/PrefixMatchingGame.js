import React, { useState, useRef } from "react";
import {
  Button,
  Card,
  Container,
  Alert,
  ListGroup,
  ProgressBar,
  Row,
  Col,
} from "react-bootstrap";

const WordPrefixGame = () => {
  // Game state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [gameResults, setGameResults] = useState([]);
  const audioRef = useRef(null);

  const questions = [
    {
      stem: "δικασμένος",
      correctPrefix: "κατα",
      word: "καταδικασμένος",
      options: ["μετα", "κατα", "παρα"],
      audio: require("../../assets/sounds/game4/word1.mp3"),
    },
    {
      stem: "βάλλω",
      correctPrefix: "δια",
      word: "διαβάλλω",
      options: ["δυσ", "ανα", "δια"],
      audio: require("../../assets/sounds/game4/word1.mp3"),
    },
    {
      stem: "φέρω",
      correctPrefix: "μετα",
      word: "μεταφέρω",
      options: ["μετα", "παρα", "κατα"],
      audio: require("../../assets/sounds/game4/word1.mp3"),
    },
    {
      stem: "γράφω",
      correctPrefix: "ανα",
      word: "αναγράφω",
      options: ["ανα", "κατα", "δια"],
      audio: require("../../assets/sounds/game4/word1.mp3"),
    },
  ];

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    audioRef.current = new Audio(questions[currentQuestion].audio);
    audioRef.current
      .play()
      .catch((error) => console.error("Audio error:", error));
  };

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
    const isCorrect = answer === questions[currentQuestion].correctPrefix;

    // Track the result
    setGameResults((prev) => [
      ...prev,
      {
        word: questions[currentQuestion].word,
        stem: questions[currentQuestion].stem,
        correctPrefix: questions[currentQuestion].correctPrefix,
        selectedPrefix: answer,
        isCorrect,
      },
    ]);

    if (isCorrect) {
      setFeedback("Σωστό! 🎉");
      setScore((prev) => prev + 1);
    } else {
      setFeedback(
        `Λάθος. Η σωστή απάντηση είναι: ${questions[currentQuestion].correctPrefix}`
      );
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setFeedback("");
    } else {
      setGameCompleted(true);
    }
  };

  const resetGame = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setFeedback("");
    setScore(0);
    setGameCompleted(false);
    setGameResults([]);
  };

  if (gameCompleted) {
    return (
      <Container
        className="d-flex flex-column align-items-center justify-content-center"
        style={{ overflowY: "scroll" }}
      >
        <Card className="w-100" style={{ maxWidth: "800px" }}>
          <Card.Header as="h3" className="text-center bg-primary text-white">
            Αποτελέσματα
          </Card.Header>
          <Card.Body>
            <Alert variant="info" className="text-center">
              <h4 className="alert-heading">
                Τελικό Σκορ: {score}/{questions.length}
              </h4>
              <p className="mb-0">
                {score === questions.length
                  ? "Τέλεια απόδοση!"
                  : score > questions.length / 2
                  ? "Καλή προσπάθεια!"
                  : "Μπορείς να τα πας καλύτερα!"}
              </p>
            </Alert>

            <h5 className="mb-3">Λεπτομέρειες:</h5>
            <ListGroup className="mb-4">
              {gameResults.map((result, index) => (
                <ListGroup.Item key={index}>
                  <div className="mb-2">
                    <strong>{result.word}</strong>
                  </div>
                  <div
                    className={
                      result.isCorrect ? "text-success" : "text-danger"
                    }
                  >
                    Επιλογή: {result.selectedPrefix}
                    {result.stem}
                  </div>
                  {!result.isCorrect && (
                    <div className="text-success">
                      Σωστό: {result.correctPrefix}
                      {result.stem}
                    </div>
                  )}
                </ListGroup.Item>
              ))}
            </ListGroup>

            <div className="d-flex justify-content-between">
              <Button variant="outline-secondary" href="/">
                Πίσω στην αρχική
              </Button>
              <Button variant="primary" onClick={resetGame}>
                Νέα Άσκηση
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <Container
      className="d-flex flex-column align-items-center justify-content-center"
      style={{ overflowY: "scroll" }}
    >
      <Card className="w-100 mb-4 border-0 bg-transparent">
        <Card.Body className="text-center">
          <Card.Title as="h1" className="text-indigo mb-3">
            6η δραστηριότητα: Πολλαπλής επιλογής
          </Card.Title>
          <Card.Text className="lead">
            Άκουσε προσεκτικά τη λέξη και επίλεξε το σωστό πρόθημα που την
            ολοκληρώνει
          </Card.Text>
        </Card.Body>
      </Card>

      <ProgressBar
        now={((currentQuestion + 1) / questions.length) * 100}
        label={`${currentQuestion + 1}/${questions.length}`}
        className="w-100 mb-4"
      />

      <Card className="w-100 mb-4" style={{ maxWidth: "800px" }}>
        <Card.Body className="text-center">
          <div className="mb-4">
            <span className="text-muted">
              Ερώτηση {currentQuestion + 1} από {questions.length} | Σκορ:{" "}
              {score}/{questions.length}
            </span>
          </div>

          <div className="p-4 bg-light rounded mb-4">
            <div className="display-4 font-weight-bold mb-3">
              _____{currentQ.stem}
            </div>

            <Button variant="primary" onClick={playAudio} className="mb-3">
              Ακούστε τη λέξη
            </Button>
          </div>

          <Row className="g-3 mb-4">
            {currentQ.options.map((option, index) => (
              <Col key={index} xs={12}>
                <Button
                  variant={
                    selectedAnswer === option
                      ? option === currentQ.correctPrefix
                        ? "success"
                        : "danger"
                      : selectedAnswer && option === currentQ.correctPrefix
                      ? "success"
                      : "outline-primary"
                  }
                  onClick={() => handleAnswerSelect(option)}
                  disabled={selectedAnswer !== null}
                  className="w-100 py-3"
                >
                  {option}
                </Button>
              </Col>
            ))}
          </Row>

          {feedback && (
            <Alert
              variant={feedback.includes("Σωστό") ? "success" : "danger"}
              className="mb-4"
            >
              {feedback}
            </Alert>
          )}

          <Button
            variant="primary"
            onClick={nextQuestion}
            disabled={!selectedAnswer}
          >
            {currentQuestion < questions.length - 1
              ? "Επόμενη Ερώτηση"
              : "Ολοκλήρωση"}
          </Button>
        </Card.Body>
      </Card>

      <Card className="w-100" style={{ maxWidth: "800px" }}>
        <Card.Body>
          <Card.Title as="h5">Οδηγίες:</Card.Title>
          <Card.Text className="text-muted">
            Άκουσε προσεκτικά τη λέξη και επίλεξε το σωστό πρόθημα που την
            ολοκληρώνει
          </Card.Text>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default WordPrefixGame;
