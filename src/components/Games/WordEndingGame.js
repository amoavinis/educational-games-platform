import React, { useState, useEffect, useRef } from "react";
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

const WordEndingGame = () => {
  // Game state
  const [currentRound, setCurrentRound] = useState(0); // 0 = slow, 1 = normal
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameResults, setGameResults] = useState([]);
  const audioRef = useRef(null);

  const questions = React.useMemo(
    () => [
      {
        stem: "τοπ",
        correctSuffix: "ικός",
        word: "τοπικός",
        options: ["ιμός", "ικός", "ώνω"],
        audioSlow: require("../../assets/sounds/game4/word1-slow.mp3"),
        audioNormal: require("../../assets/sounds/game4/word1.mp3"),
      },
      {
        stem: "γυάλ",
        correctSuffix: "ινος",
        word: "γυάλινος",
        options: ["ιμος", "ινος", "ικος"],
        audioSlow: require("../../assets/sounds/game4/word1-slow.mp3"),
        audioNormal: require("../../assets/sounds/game4/word1.mp3"),
      },
      {
        stem: "χρωμάτ",
        correctSuffix: "ικός",
        word: "χρωματικός",
        options: ["ικός", "ιμός", "ώνω"],
        audioSlow: require("../../assets/sounds/game4/word1-slow.mp3"),
        audioNormal: require("../../assets/sounds/game4/word1.mp3"),
      },
      {
        stem: "μουσ",
        correctSuffix: "ική",
        word: "μουσική",
        options: ["ική", "ιμή", "ωμένη"],
        audioSlow: require("../../assets/sounds/game4/word1-slow.mp3"),
        audioNormal: require("../../assets/sounds/game4/word1.mp3"),
      },
    ],
    []
  );

  // Play audio automatically when question changes
  const playAudio = React.useCallback(
    (slow = false) => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      const audioFile = slow
        ? questions[currentQuestion].audioSlow
        : questions[currentQuestion].audioNormal;
      audioRef.current = new Audio(audioFile);

      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          audioRef.current.onended = () => setIsPlaying(false);
        })
        .catch((error) => {
          console.error("Audio playback failed:", error);
          setIsPlaying(false);
        });
    },
    [questions, currentQuestion]
  );

  useEffect(() => {
    if (!gameCompleted) {
      playAudio(currentRound === 0); // Slow for first round, normal for second
    }
  }, [currentQuestion, currentRound, gameCompleted, playAudio]);

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
    const isCorrect = answer === questions[currentQuestion].correctSuffix;

    // Track the result
    setGameResults((prev) => [
      ...prev,
      {
        word: questions[currentQuestion].word,
        stem: questions[currentQuestion].stem,
        correctSuffix: questions[currentQuestion].correctSuffix,
        selectedSuffix: answer,
        isCorrect,
        round: currentRound === 0 ? "Αργά" : "Γρήγορα",
      },
    ]);

    if (isCorrect) {
      setFeedback("Σωστό! 🎉");
      setScore((prev) => prev + 1);
    } else {
      setFeedback(
        `Λάθος. Η σωστή απάντηση είναι: ${questions[currentQuestion].correctSuffix}`
      );
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else if (currentRound === 0) {
      // Move to normal speed round
      setCurrentRound(1);
      setCurrentQuestion(0);
    } else {
      setGameCompleted(true);
    }

    setSelectedAnswer(null);
    setFeedback("");
  };

  const resetGame = () => {
    setCurrentRound(0);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setFeedback("");
    setScore(0);
    setGameCompleted(false);
    playAudio(true); // Start with slow audio
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
                Τελικό Σκορ: {score}/{questions.length * 2}
              </h4>
            </Alert>

            <h5 className="mb-3">Λεπτομέρειες:</h5>
            <ListGroup className="mb-4">
              {gameResults.map((result, index) => (
                <ListGroup.Item key={index}>
                  <div className="mb-2">
                    <strong>{result.word}</strong> ({result.round})
                  </div>
                  <div
                    className={
                      result.isCorrect ? "text-success" : "text-danger"
                    }
                  >
                    Επιλογή: {result.stem}
                    {result.selectedSuffix}
                  </div>
                  {!result.isCorrect && (
                    <div className="text-success">Σωστό: {result.word}</div>
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
          <Card.Title as="h1" className="text-primary mb-3">
            4η δραστηριότητα: Πολλαπλής επιλογής
          </Card.Title>
          <Card.Text className="lead">
            Άκουσε προσεκτικά τη λέξη και επίλεξε το σωστό επίθημα που την
            ολοκληρώνει.
          </Card.Text>
        </Card.Body>
      </Card>

      <ProgressBar
        now={
          ((currentRound * questions.length + currentQuestion) /
            (questions.length * 2)) *
          100
        }
        label={`${currentRound * questions.length + currentQuestion + 1}/${
          questions.length * 2
        }`}
        className="w-100 mb-4"
      />

      <Card className="w-100 mb-4" style={{ maxWidth: "800px" }}>
        <Card.Body className="text-center">
          <div className="mb-4">
            <span className="text-muted">
              {currentRound === 0 ? "Αργά" : "Γρήγορα"} | Ερώτηση{" "}
              {currentQuestion + 1} από {questions.length} | Σκορ: {score}/
              {questions.length * 2}
            </span>
          </div>

          <div className="p-4 bg-light rounded mb-4">
            <div className="display-4 font-weight-bold mb-3">
              {currentQ.stem}_______
            </div>

            <Button
              variant={isPlaying ? "secondary" : "primary"}
              onClick={() => playAudio(currentRound === 0)}
              disabled={isPlaying}
              className="mb-3"
            >
              {isPlaying ? "Αναπαραγωγή..." : "Ακούστε τη λέξη"}
            </Button>

            <div className="h5 text-muted">Λέξη: {currentQ.word}</div>
          </div>

          <Row className="g-3 mb-4">
            {currentQ.options.map((option, index) => (
              <Col key={index} xs={12}>
                <Button
                  variant={
                    selectedAnswer === option
                      ? option === currentQ.correctSuffix
                        ? "success"
                        : "danger"
                      : selectedAnswer && option === currentQ.correctSuffix
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
            {currentQuestion < questions.length - 1 || currentRound === 0
              ? "Επόμενη Ερώτηση"
              : "Ολοκλήρωση"}
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default WordEndingGame;
